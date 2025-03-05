use std::collections::HashMap;
use phf::phf_map;
use phf::phf_set;

use crate::app::types::search::ControlPanelResult;



// This is a map of search terms to the corresponding control panel settings.
static SETTINGS: phf::Map<&'static str, &'static str> = phf_map! {
    "Ease Of Access" => "access.cpl",
    "Programs And Features" => "appwiz.cpl",
    "Display Settings" => "desk.cpl",
    "Device Manager" => "hdwwiz.cpl",
    "Internet Properties" => "inetcpl.cpl",
    "Game Controllers" => "joy.cpl",
    "Mouse Properties" => "main.cpl",
    "Sound Properties" => "mmsys.cpl",
    "Network Connections" => "ncpa.cpl",
    "Power Options" => "powercfg.cpl",
    "System Properties" => "sysdm.cpl",
    "Phone And Modem Options" => "telephon.cpl",
    "Date And Time" => "timedate.cpl",
    "Security And Maintenance" => "wscui.cpl",
    "Windows Update" => "wuaucpl.cpl",
    "Control Panel" => "control",
};







pub fn search(query: String) -> Vec<ControlPanelResult> {
    let mut result: Vec<ControlPanelResult> = Vec::new();
    let query = query.to_lowercase();
    if query.len() < 2  {
        return result;
    }
    let keys = SETTINGS.keys();
    for key in keys {
        if key.to_lowercase().contains(query.as_str()) {
            let setting = SETTINGS.get(key).unwrap();

            let readable_name = key.to_string();



            let name = setting.to_string();
            let category = "Control Panel".to_string();
            result.push(ControlPanelResult {
                readable_name,
                name,
                category,
            });
        }
    }

    result
}