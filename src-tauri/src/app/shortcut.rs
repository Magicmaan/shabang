use std::str::FromStr;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

// function takes in the shortcut combo, onpress and onrelease functions
// returns a function thats then used to handle the event
// i.e. let x = make_shortcut(shortcut, onpress, onrelease)
//      x(hotkey, event)

// https://github.com/tw93/Pake/blob/3d3528f3bb1b21ad0caac75f90ebfa6c5f5dcb9c/src-tauri/src/app/setup.rs#L60
pub fn make_shortcut(
    app: &AppHandle,
    shortcut: String,
    on_press: Arc<dyn Fn() + Send + Sync>,
) -> tauri::Result<()> {
    if shortcut.is_empty() {
        return Ok(());
    }

    let app_handle = app.clone();
    let shortcut_hotkey = Shortcut::from_str(&shortcut).unwrap();
    let last_triggered = Arc::new(Mutex::new(Instant::now()));

    app_handle
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler({
                    let last_triggered = Arc::clone(&last_triggered);
                    let on_press = Arc::clone(&on_press);
                    move |app, event, _shortcut| {
                        let mut last_triggered = last_triggered.lock().unwrap();
                        if Instant::now().duration_since(*last_triggered)
                            < Duration::from_millis(300)
                        {
                            return;
                        }
                        *last_triggered = Instant::now();

                        if shortcut_hotkey.eq(event) {
                            on_press();
                        }
                    }
                })
                .build(),
        )
        .expect("Failed to set global shortcut");

    if !app.global_shortcut().is_registered(shortcut_hotkey) {
        app.global_shortcut().register(shortcut_hotkey).unwrap();
    }

    Ok(())
}
