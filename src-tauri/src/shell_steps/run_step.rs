use super::events::StepEvent;
use super::login_path::login_path;
use super::lossy_lines::lossy_lines;
use super::shell_step::ShellStep;
use std::process::{Command, Stdio};
use std::time::Instant;
use tauri::ipc::Channel;

const POSIX_SHELL: &str = "/bin/sh";
const PATH_VARIABLE: &str = "PATH";

/// Runs one step's script in a POSIX shell on the PATH of the person's own terminal, so the tools they installed are
/// found whichever shell they use, and streams its output.
pub fn run_step(step: &ShellStep, on_event: &Channel<StepEvent>) -> bool {
    let _ = on_event.send(StepEvent::StepStarted { title: step.title.clone() });
    let started = Instant::now();
    let is_passed = run_in_shell(step, on_event).unwrap_or_else(|problem| {
        let _ = on_event.send(StepEvent::OutputLine { text: problem });
        false
    });
    let seconds = started.elapsed().as_secs();
    let _ = on_event.send(StepEvent::StepFinished { title: step.title.clone(), is_passed, seconds });
    is_passed
}

fn run_in_shell(step: &ShellStep, on_event: &Channel<StepEvent>) -> Result<bool, String> {
    let mut command = Command::new(POSIX_SHELL);
    if let Some(path) = login_path() {
        command.env(PATH_VARIABLE, path);
    }
    let mut child = command
        .arg("-c")
        .arg(format!("{{ {} ; }} 2>&1", step.script))
        .current_dir(&step.directory)
        .envs(&step.environment)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|error| format!("The step could not start: {error}"))?;
    let output = child.stdout.take().ok_or("The step gave no output to read.")?;
    for line in lossy_lines(output) {
        let _ = on_event.send(StepEvent::OutputLine { text: line });
    }
    let status = child.wait().map_err(|error| error.to_string())?;
    Ok(status.success())
}
