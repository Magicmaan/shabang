mod app;

use std::sync::Arc;
use tauri::Manager;
use std::{thread, time};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

use app::shortcut::make_shortcut;
use app::api::javascript::{open_window_js, greet, close_window_js, close_window, open_window, search_everything_js, open_link_js};

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// #[tauri::command]
// fn send_event(app: AppHandle, _event: String) {
//     app.emit("test", "hi").unwrap();
// }

// #[tauri::command]
// async fn open_window_js(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
//     webview_window.show().unwrap();
//     webview_window.set_focus().unwrap();

//     open_window(app_handle.clone());
// }

// #[tauri::command]
// fn close_window_js(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
//     close_window(app_handle.clone());
                                            
//     let window_clone = webview_window.clone();
//     tauri::async_runtime::spawn(async move {
//         thread::sleep(time::Duration::from_millis(500));
//         window_clone.hide().unwrap();
//     });
// }


// fn open_window(app: AppHandle) {
//     app.emit("open_window", "").unwrap();
// }
// fn close_window(app: AppHandle) {
//     app.emit("close_window", "").unwrap();
// }



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            let handler = app.handle().clone();
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
                use tauri::tray::TrayIconBuilder;

                let window = app.get_webview_window("main").unwrap();
                
                let shortcuts = app::settings::shortcuts::Shortcuts::new();
                // create open / close shortcut
                match make_shortcut(
                    &handler,
                    shortcuts.toggle_window,
                    Arc::new({
                        let handler = handler.clone();
                        let window = window.clone();
                        move || {
                            if window.is_visible().unwrap() {
                                close_window(handler.clone());
                                
                                let window_clone = window.clone();
                                tauri::async_runtime::spawn(async move {
                                    thread::sleep(time::Duration::from_millis(500));
                                    window_clone.hide().unwrap();
                                });
                                
                            } else {
                                window.show().unwrap();
                                window.set_focus().unwrap();
                                
                                open_window(handler.clone());
                            }
                        }
                    }),
                ) {
                    Ok(_) => {}
                    Err(e) => {
                        eprintln!("Error setting global shortcut: {:?}", e);
                    }
                }

                let tray = TrayIconBuilder::new()
  .icon(app.default_window_icon().unwrap().clone())
  .build(app)?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        
        .invoke_handler(tauri::generate_handler![greet, open_window_js, close_window_js, search_everything_js, open_link_js])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
