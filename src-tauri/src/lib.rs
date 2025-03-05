mod app;

use std::sync::{Arc, Mutex};
use tauri::Manager;
use std::{thread, time};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

use app::shortcut::make_shortcut;
use app::api::javascript::{open_window,search_js, get_blur_js, close_window, open_link_js, set_blur_js};
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

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

fn default_state() -> AppState {
    AppState {
        use_blur: true,
        blur_style: BlurStyle::Acrylic,
        blur_colour: Some((18, 18, 18, 125)),
    }
}

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
                                close_window(window.clone(),handler.clone() );
                                
                                
                                
                            } else {
                               
                                
                                open_window( window.clone(),handler.clone());
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
        
        .invoke_handler(tauri::generate_handler![open_window,search_js, close_window, open_link_js, set_blur_js, get_blur_js])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
