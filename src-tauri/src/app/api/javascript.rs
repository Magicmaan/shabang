use crate::app::search;
use serde::{Deserialize, Serialize};
use serde_json::Number;
use std::sync::Arc;
use std::{thread, time};
use tauri::{Manager, State};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use crate::app::types::search::{searchResult, AppResult, ControlPanelResult, EverythingResult};
use crate::{app, AppState, BlurStyle};
use app::search::application;
use app::search::controlpanel;
use app::search::everything;
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::time::Instant;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::{Channel, Response};
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;
use window_vibrancy::{
    apply_acrylic, apply_blur, apply_vibrancy, clear_acrylic, clear_blur, NSVisualEffectMaterial,
};

// Open Close window
#[tauri::command]
pub fn open_window(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
    app_handle.emit("open_window_transition", "").unwrap();
    webview_window.show().unwrap();
    webview_window.set_focus().unwrap();

    app_handle.emit("open_window_transition_done", "").unwrap();
}

// fn spawn_search_task<'a>(query: String, on_event: Channel<SearchEvent<'a>>, time: Number) {
//     tauri::async_runtime::spawn(async move {
//         let app_result = match application::search(query.clone()) {
//             Ok(res) => res,
//             Err(e) => return Err(e.to_string()),
//         };
//         on_event.send(SearchEvent::ApplicationFinished {
//             start_time: time.clone(),
//             time: time.clone(),
//             query: &query,
//             data: app_result,
//         }).unwrap();

//         Ok(())
//     });
// }

#[tauri::command]
pub fn close_window(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
    app_handle.emit("close_window_transition", "").unwrap();

    let window_clone = webview_window.clone();
    tauri::async_runtime::spawn(async move {
        thread::sleep(time::Duration::from_millis(500));
        window_clone.hide().unwrap();
        app_handle.emit("close_window_transition_done", "").unwrap();
    });
}

#[tauri::command]
pub fn set_blur(
    window: tauri::WebviewWindow,
    state: State<'_, Mutex<AppState>>,
    blur: bool,
    colour: Option<(u8, u8, u8, u8)>,
    style: String,
) {
    let mut state = state.lock().unwrap();

    let state_enabled = &state.use_blur;
    let state_colour = &state.blur_colour;
    let state_style = &state.blur_style;

    println!("set_blur_js: {}", blur);
    println!("args: {:?}", colour);
    println!("style: {}", style);
    let style: BlurStyle = match style.as_str() {
        "acrylic" => BlurStyle::Acrylic,
        "vibrancy" => BlurStyle::Vibrancy,
        _ => BlurStyle::Blur,
    };
    if blur {
        match style {
            BlurStyle::Acrylic => {
                apply_acrylic(&window, colour)
                    .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            }
            BlurStyle::Blur => {
                apply_blur(&window, colour)
                    .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            }
            BlurStyle::Vibrancy => {
                println!("Vibrancy");
            }
        }
        // apply_acrylic(&window, colour).expect("Unsupported platform! 'apply_blur' is only supported on Windows");
        state.use_blur = true;
        if colour.is_some() {
            state.blur_colour = colour;
        }
        println!("Enabled blur");
    } else {
        println!("Disabled blur");
        clear_acrylic(&window)
            .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
        clear_blur(&window)
            .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
        state.use_blur = false;
    }
}

#[tauri::command]
pub fn get_blur(state: State<'_, Mutex<AppState>>) -> bool {
    let mut state = state.lock().unwrap();

    state.use_blur
}

#[tauri::command]
pub fn open_link(link: &str, mode: &str, app_handle: tauri::AppHandle) {
    println!("open_link_js: {}", link);
    // very basic check for link
    match mode {
        "default" => {
            let _ = app_handle.opener().open_path(link, Some("explorer"));
        }
        "explorer" => {
            let _ = app_handle.opener().open_path(link, Some("explorer"));
        }
        "default_program" => {
            let _ = app_handle.opener().open_path(link, None::<&str>);
        }
        "web" => {
            use webbrowser;
            if (link.starts_with("http://") || link.starts_with("https://")) {
                let _ = app_handle.opener().open_url(link, None::<&str>);
            } else {
                eprintln!("Invalid web link: {}", link);
            }
        }
        "terminal" => {
            let _ = app_handle.opener().open_path(link, Some("cmd"));
        }
        "powershell" => {
            let _ = app_handle.opener().open_path(link, Some("powershell"));
        }
        _ => {
            eprintln!("Invalid mode: {}", mode);
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum SearchEvent<'a> {
    #[serde(rename_all = "camelCase")]
    Started { query: &'a str, start_time: Number },
    #[serde(rename_all = "camelCase")]
    Progress {
        time: Number,
        query: &'a str,
        search_type: &'a str,
    },

    #[serde(rename_all = "camelCase")]
    EverythingResult {
        start_time: Number,
        time: Number,
        query: &'a str,
        data: Vec<EverythingResult>,
    },
    #[serde(rename_all = "camelCase")]
    ApplicationResult {
        start_time: Number,
        time: Number,
        query: &'a str,
        data: Vec<AppResult>,
    },
    #[serde(rename_all = "camelCase")]
    ControlPanelResult {
        start_time: Number,
        time: Number,
        query: &'a str,
        data: Vec<ControlPanelResult>,
    },

    #[serde(rename_all = "camelCase")]
    Finished {
        start_time: Number,
        time: Number,
        data: searchResult,
    },
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SearchOptions {
    pub everything: bool,
    pub controlpanel: bool,
    pub application: bool,
}

// the programs main search function
#[tauri::command]
pub async fn search<'a>(
    query: String,
    search_options: Option<SearchOptions>,
    app: AppHandle,
    on_event: Channel<SearchEvent<'a>>,
) -> Result<searchResult, String> {
    let start_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    on_event
        .send(SearchEvent::Started {
            query: &query,
            start_time: Number::from(start_time),
        })
        .unwrap();
    
   
    // get control panel settings results
    let controlpanel_result = match controlpanel::search(query.clone()) {
        Ok(res) => {
            let time = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            on_event
                .send(SearchEvent::ControlPanelResult {
                    start_time: Number::from(start_time),
                    time: Number::from(time),
                    query: &query,
                    data: res.clone(),
                })
                .unwrap();
            res
        }
        Err(e) => return Err(e.to_string()),
    };

    // get application results
    let app_result = match application::search(query.clone()) {
        Ok(res) => {
            let time = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            on_event
                .send(SearchEvent::ApplicationResult {
                    start_time: Number::from(start_time),
                    time: Number::from(time),
                    query: &query,
                    data: res.clone(),
                })
                .unwrap();
            res
        }
        Err(e) => return Err(e.to_string()),
    };

    // get everything results
    let everything_result = match everything::search(query.clone()) {
        Ok(res) => {
            let time = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            on_event
                .send(SearchEvent::EverythingResult {
                    start_time: Number::from(start_time),
                    time: Number::from(time),
                    query: &query,
                    data: res.clone(),
                })
                .unwrap();
            res
        }
        Err(e) => return Err(e.to_string()),
    };

    on_event
        .send(SearchEvent::Finished {
            start_time: Number::from(start_time),
            time: Number::from(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            ),
            data: searchResult {
                everything: everything_result.clone(),
                controlpanel: controlpanel_result.clone(),
                application: app_result.clone(),
            },
        })
        .unwrap();
    Ok(searchResult {
        everything: everything_result,
        controlpanel: controlpanel_result,
        application: app_result,
    })
}
