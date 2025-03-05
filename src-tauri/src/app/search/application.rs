
use everything_sdk::EverythingError;

use crate::app::types::search::AppResult;
use crate::app::search::everything;

// app locations
// C:\ProgramData\Microsoft\Windows\Start Menu\Programs


pub fn search(query: String) -> std::result::Result<Vec<AppResult>, EverythingError> {
    let mut results_vec: Vec<AppResult> = Vec::new();
    if query.len() < 2 {
        return Err(EverythingError::InvalidCall);
    }
   
    //format query to only search in the app locations
    let query = format!("\"{path}\" {q}", path = r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs", q = query);
    println!("App search query: {}", query);
    let result = match everything::search(query) {
        Ok(res) => res,
        Err(e) => return Err(e),
    };


    for item in result {
        let readable_name = item.readable_name;
        let name = item.name;
        let path = item.path;
        let category = "App".to_string();
        results_vec.push(AppResult {
            readable_name,
            name,
            path,
            category,
        });
    }

    println!("app results: {:?}", results_vec);
    Ok(results_vec)
}