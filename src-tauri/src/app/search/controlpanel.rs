use phf::phf_map;
use phf::phf_set;
use std::collections::HashMap;
use everything_sdk::EverythingError;
use crate::app::types::search::ControlPanelResult;

// This is a map of search terms to the corresponding control panel settings.
static SETTINGS: phf::Map<&'static str, &'static str> = phf_map! {
    "Ease Of Access" => "access.cpl",
    "Programs And Features" => "appwiz.cpl",
    "Display Settings" => "desk.cpl",
    "Device Manager" => "hdwwiz.cpl",
    "Internet Properties" => "inetcpl.cpl",
    "Game Controllers" => "joy.cpl",
"   Mouse Properties" => "main.cpl",
    //sound properties
    "Sound Card Properties" => "mmsys.cpl",
    "Sound Card Settings" => "mmsys.cpl",
    "Sound Mixer" => "sndvol.exe",
    "Volume Mixer" => "sndvol.exe",

    "Network Connections" => "ncpa.cpl",
    "Power Options" => "powercfg.cpl",
    "System Properties" => "sysdm.cpl",
    "Phone And Modem Options" => "telephon.cpl",
    "Date And Time" => "timedate.cpl",
    "Security And Maintenance" => "wscui.cpl",
    "Windows Update" => "wuaucpl.cpl",
    "Control Panel" => "control",
};

pub fn search(query: String) -> std::result::Result<Vec<ControlPanelResult>, EverythingError> {
    let mut result: Vec<ControlPanelResult> = Vec::new();
    let query = query.to_lowercase();
    if query.len() < 1 {
        return Err(EverythingError::InvalidCall);
    }
    let keys = SETTINGS.keys();

    for key in keys {
        if key.to_lowercase().contains(query.as_str()) {
            let setting = SETTINGS.get(key).unwrap();

            let readable_name = key.to_string();
            let name = setting.to_string();
            let category = "Control Panel".to_string();

            // make sure no duplicate results are added as there are aliases
            // bit of hack, but it works, and theirs so few control panel settings that it's not a big deal
            if !result.iter().any(|r| r.name == name) {
                result.push(ControlPanelResult {
                    readable_name,
                    name,
                    category,
                });
            }
        }
    }

    Ok(result)
}
