
use tauri_plugin_global_shortcut::{Shortcut, Code, Modifiers};

#[derive(Debug)]
pub struct Shortcuts {
    pub toggle_window: String,
    // Add more shortcuts as needed
}

impl Shortcuts {
    pub fn new() -> Self {
        Self {
            toggle_window: Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyR).to_string(),
            // Initialize more shortcuts as needed
        }
    }
}