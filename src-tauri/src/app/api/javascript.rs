use std::sync::Arc;
use tauri::Manager;
use std::{thread, time};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use lazy_static::lazy_static;

use crate::app;
use app::search::everything::everything::search;
use tauri_plugin_opener::OpenerExt;
use std::sync::Mutex;
use std::time::Instant;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Open Close window

#[tauri::command]
pub async fn open_window_js(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
    webview_window.show().unwrap();
    webview_window.set_focus().unwrap();

    open_window(app_handle.clone());
}

#[tauri::command]
pub fn close_window_js(webview_window: tauri::WebviewWindow, app_handle: tauri::AppHandle) {
    close_window(app_handle.clone());
                                            
    let window_clone = webview_window.clone();
    tauri::async_runtime::spawn(async move {
        thread::sleep(time::Duration::from_millis(500));
        window_clone.hide().unwrap();
    });
}

pub fn open_window(app: AppHandle) {
    lazy_static::lazy_static! {
        static ref LAST_OPEN: Mutex<Option<Instant>> = Mutex::new(None);
    }

    let mut last_open = LAST_OPEN.lock().unwrap();
    if let Some(last) = *last_open {
        if last.elapsed() < time::Duration::from_secs(1) {
            return;
        }
    }
    *last_open = Some(Instant::now());
    app.emit("open_window", "").unwrap();
}
pub fn close_window(app: AppHandle) {
    lazy_static::lazy_static! {
        static ref LAST_CLOSE: Mutex<Option<Instant>> = Mutex::new(None);
    }

    let mut last_close = LAST_CLOSE.lock().unwrap();
    if let Some(last) = *last_close {
        if last.elapsed() < time::Duration::from_secs(1) {
            return;
        }
    }
    *last_close = Some(Instant::now());
    app.emit("close_window", "").unwrap();
}

#[tauri::command]
pub fn open_link_js(link: &str, app_handle: tauri::AppHandle) {
    println!("open_link_js: {}", link);
    
   let _ = app_handle.opener().open_path(link, None::<&str>);
}

// Everything IPC
#[tauri::command]
pub fn search_everything_js(query: &str) -> Vec<String> {
    println!("search_everything_js: {}", query);
    let result = search(query.to_string());
    //let result = vec!["".to_string()];
    result
}