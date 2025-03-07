use serde::Serialize;
use serde_json::Number;
use std::sync::Arc;
use std::{thread, time};
use tauri::{Manager, State};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use crate::app::types::search::searchResult;
use crate::{app, AppState, BlurStyle};
use app::search::application;
use app::search::controlpanel;
use app::search::everything;
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::time::Instant;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::Response;
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;
use window_vibrancy::{
    apply_acrylic, apply_blur, apply_vibrancy, clear_acrylic, clear_blur, NSVisualEffectMaterial,
};

// #[tauri::command]
// pub fn get_settings_js() -> String {
//     let settings = app::settings::settings::get_settings().unwrap();
//     let s = "settings".to_string();
//     s
// }

// Open Close window
#[tauri::command]
pub fn open_window(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
    app_handle.emit("open_window_transition", "").unwrap();
    webview_window.show().unwrap();
    webview_window.set_focus().unwrap();

    app_handle.emit("open_window_transition_done", "").unwrap();
}

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

// pub fn open_window(app: AppHandle) {
//     lazy_static::lazy_static! {
//         static ref LAST_OPEN: Mutex<Option<Instant>> = Mutex::new(None);
//     }

//     let mut last_open = LAST_OPEN.lock().unwrap();
//     if let Some(last) = *last_open {
//         if last.elapsed() < time::Duration::from_secs(1) {
//             return;
//         }
//     }
//     *last_open = Some(Instant::now());
//     app.emit("open_window", "").unwrap();
// }
// pub fn close_window(app: AppHandle) {
//     lazy_static::lazy_static! {
//         static ref LAST_CLOSE: Mutex<Option<Instant>> = Mutex::new(None);
//     }

//     let mut last_close = LAST_CLOSE.lock().unwrap();
//     if let Some(last) = *last_close {
//         if last.elapsed() < time::Duration::from_secs(1) {
//             return;
//         }
//     }
//     *last_close = Some(Instant::now());
//     app.emit("close_window", "").unwrap();
// }

#[tauri::command]
pub fn set_blur_js(
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
pub fn get_blur_js(state: State<'_, Mutex<AppState>>) -> bool {
    let mut state = state.lock().unwrap();

    state.use_blur
}

#[tauri::command]
pub fn open_link_js(link: &str, app_handle: tauri::AppHandle) {
    println!("open_link_js: {}", link);
    let _ = app_handle.opener().open_path(link, None::<&str>);
}

#[derive(Clone, Serialize)]
struct SearchingProgress {
    time: Number,
}
#[tauri::command]
pub async fn search_js(query: String, app: AppHandle) -> Result<searchResult, String> {
    println!("search_js: {}", query);
    let start_time = SystemTime::now();
    let time = start_time.duration_since(UNIX_EPOCH).unwrap();
    app.emit(
        "searching",
        SearchingProgress {
            time: Number::from(time.as_secs()),
        },
    )
    .unwrap();

    let app_result = match application::search(query.clone()) {
        Ok(res) => res,
        Err(e) => return Err(e.to_string()),
    };

    let mut everything_result = Vec::new();
    if query.len() > 3 {
        everything_result = match everything::search(query.clone()) {
            Ok(res) => res,
            Err(e) => return Err(e.to_string()),
        };
    }

    let controlpanel_result = controlpanel::search(query.clone());

    Ok(searchResult {
        everything: everything_result,
        controlpanel: controlpanel_result,
        application: app_result,
    })
}
