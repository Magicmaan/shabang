mod app;

use std::sync::{Arc, Mutex};
use std::{thread, time};
use tauri::Manager;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

use app::api::javascript::{
    close_window, get_blur_js, open_link_js, open_window, search_js, set_blur_js,
};
use app::setup::check_install;
use app::shortcut::make_shortcut;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};
use elevated_command::Command;
use std::process::Command as StdCommand;

// Define BlurStyle type
pub enum BlurStyle {
    Blur,
    Vibrancy,
    Acrylic,
}

// Implement Default trait for BlurStyle
impl Default for BlurStyle {
    fn default() -> Self {
        BlurStyle::Acrylic
    }
}

#[derive(Default)]
pub struct AppState {
    use_blur: bool,
    blur_style: BlurStyle,
    blur_colour: Option<(u8, u8, u8, u8)>,
}

fn start_everything() {
    //start everything in tray / background
    // only start if no instanceRR
    
    let mut command = StdCommand::new("C:\\Program Files\\Everything\\Everything.exe");
    command.arg("-close");
    command.arg("-first-instance");
    command.spawn()
        .expect("Everything failed to start");
    // command.arg("install").arg("everything").arg("-y");
    // let output = command.output().unwrap();
    println!("Everything started");

}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            let handler = app.handle().clone();
            #[cfg(desktop)]
            {
                use tauri::tray::TrayIconBuilder;
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };
                let window = app.get_webview_window("main").unwrap();

                //setup app
                check_install(app.handle().clone());

                //start app
                start_everything();


                //create state
                app.manage(Mutex::new(AppState::default()));

                //to use:
                // let state = app.state::<Mutex<AppState>>();
                // let mut state = state.lock().unwrap();
                // state.use_blur = true;

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
                                close_window(window.clone(), handler.clone());
                            } else {
                                open_window(window.clone(), handler.clone());
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
        .invoke_handler(tauri::generate_handler![
            open_window,
            search_js,
            close_window,
            open_link_js,
            set_blur_js,
            get_blur_js
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
