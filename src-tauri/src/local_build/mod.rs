mod build_report;
mod build_steps;
mod checkout;

use crate::shell_steps::{run_steps, StepEvent};
use build_report::BuildReport;
use checkout::Checkout;
use tauri::ipc::Channel;

/// What the builder screen asks for: the repository and branch to build on, the task, and the local model.
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildRequest {
    pub builds_folder: String,
    pub repository_url: String,
    pub default_branch: String,
    pub branch: String,
    pub task_title: String,
    pub task_text: String,
    pub model: String,
    pub lm_studio_origin: String,
}

/// Finds or clones the repository, builds the task on its branch with Claude Code, checks it and pushes it,
/// sending every line as it happens and reporting what the branch holds when it stops.
#[tauri::command]
pub async fn run_local_build(
    app: tauri::AppHandle,
    request: BuildRequest,
    on_event: Channel<StepEvent>,
) -> Result<BuildReport, String> {
    let checkout = checkout::locate(&app, &request)?;
    tauri::async_runtime::spawn_blocking(move || build(&request, &checkout, &on_event))
        .await
        .map_err(|error| error.to_string())
}

fn build(request: &BuildRequest, checkout: &Checkout, on_event: &Channel<StepEvent>) -> BuildReport {
    let failed_step = run_every_step(request, checkout, on_event);
    let _ = on_event.send(StepEvent::Finished);
    build_report::report(request, &checkout.path, failed_step)
}

/// Prepares the checkout, then does the work; work that stops short is kept on the branch for the next attempt.
fn run_every_step(request: &BuildRequest, checkout: &Checkout, on_event: &Channel<StepEvent>) -> Option<String> {
    let failed_preparation = run_steps(&build_steps::prepare_steps(request, checkout), on_event);
    if failed_preparation.is_some() {
        return failed_preparation;
    }
    let Some(failed_work) = run_steps(&build_steps::work_steps(request, &checkout.path), on_event) else {
        return None;
    };
    run_steps(&[build_steps::keep_unfinished_work_step(request, &checkout.path)], on_event);
    Some(failed_work)
}
