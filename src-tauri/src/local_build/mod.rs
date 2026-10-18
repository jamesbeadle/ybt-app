mod build_report;
mod build_scripts;
mod build_stage;
mod build_steps;
mod checkout;

use crate::shell_steps::{run_steps, StepEvent};
use build_report::BuildReport;
use build_stage::{BuildRefusal, StoppedStep};
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
) -> Result<BuildReport, BuildRefusal> {
    let checkout = checkout::locate(&app, &request)?;
    tauri::async_runtime::spawn_blocking(move || build(&request, &checkout, &on_event))
        .await
        .map_err(|error| BuildRefusal::on_this_machine(error.to_string()))
}

fn build(request: &BuildRequest, checkout: &Checkout, on_event: &Channel<StepEvent>) -> BuildReport {
    let stopped_step = run_every_step(request, checkout, on_event);
    let _ = on_event.send(StepEvent::Finished);
    build_report::report(request, &checkout.path, stopped_step)
}

/// Prepares the checkout, does the work and pushes it. Work that stops short is kept on the branch for the next attempt;
/// a failed preparation or push is this computer's to fix, and the model's work is not blamed for it.
fn run_every_step(request: &BuildRequest, checkout: &Checkout, on_event: &Channel<StepEvent>) -> Option<StoppedStep> {
    if let Some(title) = run_steps(&build_steps::prepare_steps(request, checkout), on_event) {
        return Some(StoppedStep::on_this_machine(title));
    }
    if let Some(title) = run_steps(&build_steps::work_steps(request, &checkout.path), on_event) {
        run_steps(&[build_steps::keep_unfinished_work_step(request, &checkout.path)], on_event);
        return Some(StoppedStep::in_the_work(title));
    }
    let failed_push = run_steps(&[build_steps::push_step(request, &checkout.path)], on_event)?;
    Some(StoppedStep::on_this_machine(failed_push))
}
