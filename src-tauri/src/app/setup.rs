use tauri::{EventLoopMessage, Manager, Wry};
use tauri_plugin_shell::{Shell, ShellExt};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::Path;
use tauri::{AppHandle, Emitter};
use tauri_plugin_fs::FsExt;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

use elevated_command::Command;
use std::process::Command as StdCommand;

pub fn install_chocolatey(shell: &Shell<Wry>) -> Result<bool, String> {
    // https://chocolatey.org/install
    // winget install --id chocolatey.chocolatey --source winget --version 2.4.3.0
    let install_command = tauri::async_runtime::block_on(async move {
        shell
            .command("winget")
            .args([
                "install",
                "--id",
                "chocolatey.chocolatey",
                "--source",
                "winget",
                "--version",
                "2.4.3.0",
            ])
            .output()
            .await
    });

    // check the commands status with match
    match install_command {
        Ok(output) => {
            // if ok, check is success. (this can still be an error though)
            if output.status.success() {
                // if success, print success message and return true
                println!("Chocolatey installed successfully");
                Ok(true)
            } else {
                // if not success, print error message and return false
                println!("Failed to install Chocolatey");
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        }
        Err(e) => {
            // if error, print error message and return false
            println!("Error: {}", e);
            Err(e.to_string())
        }
    }
}

pub fn install_everything(shell: &Shell<Wry>) -> Result<bool, String> {
    // https://community.chocolatey.org/packages/Everything

    //get elevated shell, needed for installs
    // enter powershell -> make elevated powershell process -> run choco install everything
    // powershell -Command "Start-Process PowerShell -Verb RunAs -ArgumentList "choco install everything""
    let mut command = StdCommand::new("powershell");
    command.arg("-Command").arg("Start-Process PowerShell -Verb RunAs -ArgumentList \"choco install everything --params '/run-on-system-startup /client-service' \"");
    // command.arg("install").arg("everything").arg("-y");
    let elevated_command = Command::new(command);
    let mut cmd = elevated_command.into_inner();
    let output = cmd.output();

    match output {
        Ok(output) => {
            if output.status.success() {
                println!("Everything installed successfully");
                return Ok(true);
            } else {
                println!("Failed to install Everything");
                return Err(String::from_utf8_lossy(&output.stderr).to_string());
            }
        }
        Err(e) => {
            println!("Error: {}", e);
            return Err(e.to_string());
        }
    }
}

fn check_and_install_chocolatey(shell: &Shell<Wry>) -> Result<bool, String> {
    // check if chocolatey is installed
    let choco_installed =
        tauri::async_runtime::block_on(
            async move { shell.command("choco").output().await.is_ok() },
        );

    // if chocolatey is not installed, install it
    if !choco_installed {
        println!("Chocolatey not found, installing...");
        match install_chocolatey(&shell) {
            Ok(_) => {
                println!("Chocolatey installation succeeded.");
                return Ok(true);
            }
            Err(e) => {
                println!("Chocolatey installation failed: {}", e);

                return Err(e);
            }
        }
    }

    Ok(true)
}

fn check_and_install_everything(shell: &Shell<Wry>) -> Result<bool, String> {
    // does everything exe exist?
    let does_everything_exist = Path::new("C:\\Program Files\\Everything\\Everything.exe").exists();

    if !does_everything_exist {
        println!("Everything not found, installing...");
        match install_everything(&shell) {
            Ok(_) => {
                println!("Everything installation succeeded.");
                return Ok(true);
            }
            Err(e) => {
                println!("Everything installation failed: {}", e);
                return Err(e);
            }
        }
    }
    // check if everything is installed
    // if everything is not installed, install it
    // return true if everything is installed
    // return false if everything is not installed
    Ok(true)
}

pub fn check_install(app_handle: AppHandle) -> bool {
    let shell = app_handle.shell();

    // test for chocolatey
    check_and_install_chocolatey(&shell).unwrap();

    // check for everything
    check_and_install_everything(&shell).unwrap();

    // if everything is not installed, install it
    return true;
}
