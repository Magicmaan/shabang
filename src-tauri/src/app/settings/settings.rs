use std::collections::HashMap;
use config::Config;
use std::error::Error;
use dirs;





// pub fn get_settings() -> Result<Config, Box<dyn Error>> {
//     let settings_file = dirs::data_dir().unwrap().join("Settings.toml");
//     println!("Settings file: {:?}", settings_file);

//     let settings = Config::builder()
//         // Add in `./Settings.toml`
//         .add_source(config::File::with_name("examples/simple/Settings"))
//         // Add in settings from the environment (with a prefix of APP)
//         // Eg.. `APP_DEBUG=1 ./target/app` would set the `debug` key
//         .add_source(config::Environment::with_prefix("APP"))
//         .build()
//         .unwrap();
//     Ok(settings)
// }