use super::events::StepEvent;
use super::run_step::run_step;
use super::shell_step::ShellStep;
use tauri::ipc::Channel;

/// Runs the steps in order and stops at the first failed step that must pass, naming it.
pub fn run_steps(steps: &[ShellStep], on_event: &Channel<StepEvent>) -> Option<String> {
    for step in steps {
        let is_passed = run_step(step, on_event);
        if !is_passed && step.must_pass {
            return Some(step.title.clone());
        }
    }
    None
}
