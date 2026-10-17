mod events;
mod run_step;
mod steps;

use events::HarnessEvent;
use std::path::PathBuf;
use tauri::ipc::Channel;

/// What the test screen asks for: the task to build, where, and on which local model.
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HarnessRequest {
    pub checkout: String,
    pub task_text: String,
    pub model: String,
    pub lm_studio_origin: String,
}

/// Builds one task with Claude Code on the local model, then checks it, sending every line as it happens.
#[tauri::command]
pub async fn run_harness_test(request: HarnessRequest, on_event: Channel<HarnessEvent>) -> Result<(), String> {
    let checkout = PathBuf::from(&request.checkout);
    if !checkout.join(".git").exists() {
        return Err(format!("{} is not a git checkout.", request.checkout));
    }
    tauri::async_runtime::spawn_blocking(move || run_every_step(&request, &checkout, &on_event))
        .await
        .map_err(|error| error.to_string())
}

fn run_every_step(request: &HarnessRequest, checkout: &PathBuf, on_event: &Channel<HarnessEvent>) {
    for step in steps::harness_steps(request) {
        let is_passed = run_step::run_step(&step, checkout, on_event);
        if !is_passed && step.must_pass {
            break;
        }
    }
    let _ = on_event.send(HarnessEvent::Finished);
}
