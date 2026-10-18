mod harness_test;
mod local_build;
mod shell_steps;
mod sign_in_redirect;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            sign_in_redirect::start_sign_in_listener,
            harness_test::run_harness_test,
            local_build::run_local_build
        ])
        .run(tauri::generate_context!())
        .expect("the YBT desktop app could not start");
}
