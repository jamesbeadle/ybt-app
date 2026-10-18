use super::events::StepEvent;
use super::shell_step::ShellStep;
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::time::Instant;
use tauri::ipc::Channel;

const FALLBACK_SHELL: &str = "/bin/sh";

/// Runs one step in a login shell, so the tools a person installed are on its path, and streams its output.
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
    let shell = std::env::var("SHELL").unwrap_or_else(|_| FALLBACK_SHELL.to_string());
    let mut child = Command::new(shell)
        .arg("-lc")
        .arg(format!("{{ {} ; }} 2>&1", step.script))
        .current_dir(&step.directory)
        .envs(&step.environment)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|error| format!("The step could not start: {error}"))?;
    let output = child.stdout.take().ok_or("The step gave no output to read.")?;
    for line in BufReader::new(output).lines().map_while(Result::ok) {
        let _ = on_event.send(StepEvent::OutputLine { text: line });
    }
    let status = child.wait().map_err(|error| error.to_string())?;
    Ok(status.success())
}
