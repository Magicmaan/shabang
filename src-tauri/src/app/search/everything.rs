use std::sync::{MutexGuard, TryLockError};

use everything_sdk::*;

use crate::app::types::search::EverythingResult;

fn get_everything() -> MutexGuard<'static, EverythingGlobal> {
    let mut retries = 5;
    loop {
        match global().try_lock() {
            Ok(lock) => return lock,
            Err(TryLockError::WouldBlock) if retries > 0 => {
                retries -= 1;
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
            Err(_) => {
                println!("Failed to acquire lock on Everything instance after multiple attempts")
            }
        }
    }
}

fn set_search(query: String, searcher: &mut EverythingSearcher) {
    // Set the query parameters,
    searcher.set_search(query);
    searcher
        .set_request_flags(
            RequestFlags::EVERYTHING_REQUEST_FILE_NAME
                | RequestFlags::EVERYTHING_REQUEST_PATH
                | RequestFlags::EVERYTHING_REQUEST_SIZE
                | RequestFlags::EVERYTHING_REQUEST_RUN_COUNT,
        )
        .set_max(20)
        .set_sort(SortType::EVERYTHING_SORT_DATE_RECENTLY_CHANGED_ASCENDING)
        .set_match_case(false);
}

pub fn search(query: String) -> std::result::Result<Vec<EverythingResult>, EverythingError> {
    // At first, we should clearly understand that Everything-SDK IPC code is
    // based on **global mutable static variables** (the internal state is
    // stored in them), at least that's the case for now.

    // Even if you use multiple processes to query by IPC at the same time, they
    // will only be processed serially by the Everything.exe (ver 1.4.1) process.

    // So we need and can only do the query serially via global states.
    let mut everything = get_everything();
    let mut results_vec: Vec<EverythingResult> = Vec::new();

    // Check whether the Everything.exe in the background is running.
    match everything.is_db_loaded() {
        Ok(false) => {
            return Err(EverythingError::InvalidCall);
        }
        Err(EverythingError::Ipc) => {
            return Err(EverythingError::Ipc);
        }
        _ => {
            // Now _Everything_ is OK!
            // We got the searcher, which can be reused for multiple times queries and cleans up
            // memory when it has been dropped.
            let mut searcher = everything.searcher();

            set_search(query, &mut searcher);

            // They have default value, check them in docs.
            assert_eq!(searcher.get_match_case(), false);

            // Send IPC query now, _block_ and wait for the result to return.
            // Some heavy query (like search single 'a') may take a lot of time in IPC data transfer, so
            // if you need unblocking, do them in a new thread or enable the `async` feature in crate.
            let results = searcher.query();

            // We set the max-limit(20) for query, so we can check these 20 or less results.
            let visible_num_results = dbg!(results.num());
            assert!(visible_num_results <= 20);
            // But we also know the total number of results if max not set. (just know, no IPC data copy)
            let total_num_results = dbg!(results.total());
            assert!(total_num_results >= visible_num_results);

            // Make sure you set the corresponding `RequestFlags` for getting result props.
            let is_attr_flag_set =
                dbg!(results.request_flags()).contains(RequestFlags::EVERYTHING_REQUEST_ATTRIBUTES);
            // So we have no corresponding data to call item.attributes() in for-loop as below.
            assert!(!is_attr_flag_set);

            // Walking the 20 query results from Everything IPC by iterator.
            for item in results.iter() {
                let full_path = item.filepath().unwrap();
                let _file_name = item.filename().unwrap();
                let _size = item.size().unwrap();

                // add to results
                results_vec.push(EverythingResult {
                    readable_name: _file_name.to_string_lossy().to_string(),
                    name: full_path.to_string_lossy().to_string(),
                    path: full_path.to_string_lossy().to_string(),
                    category: "Everything".to_string(),
                });
            }

            // Or you are only interested in the run count of the 3rd result in Everything Run History.
            if visible_num_results >= 3 {
                let run_count = results
                    .at(2)
                    .expect("I'm pretty sure there are at least 3 results.")
                    .run_count()
                    .unwrap();
                println!("Run Count for Item[2]: `{}`", run_count);
            }

            // Remember, because of global variables, there can only be one `everything`, `searcher`
            // and `results` at any time during the entire program lifetime.
        }
    }
    // Remember the LIFETIME again!
    global().try_lock().expect_err("Prev lock is still held.");
    drop(everything);
    let _is_in_appdata = global()
        .try_lock()
        .expect("We could take the lock now, use it, and return it immediately.")
        .is_appdata()
        .unwrap();

    Ok(results_vec)
}
