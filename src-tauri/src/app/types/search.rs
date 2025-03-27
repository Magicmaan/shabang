pub enum SearchType {
    calculator,
    file,
    search,
    setting,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct EverythingResult {
    pub readable_name: String,
    pub name: String,
    pub path: String,
    pub category: String,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct ControlPanelResult {
    pub readable_name: String,
    pub name: String,
    pub category: String,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct AppResult {
    pub readable_name: String,
    pub name: String,
    pub path: String,
    pub category: String,
}

#[derive(serde::Serialize, Clone)]
pub struct searchResult {
    pub everything: Vec<EverythingResult>,
    pub controlpanel: Vec<ControlPanelResult>,
    pub application: Vec<AppResult>,
}
