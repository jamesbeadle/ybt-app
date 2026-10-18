use super::lossy_lines::lossy_lines;
use std::process::{Command, Stdio};
use std::sync::{mpsc, OnceLock};
use std::time::Duration;

const PATH_MARKER: &str = "YBT_LOGIN_PATH=";
const PRINT_PATH: &str = "printf '\\nYBT_LOGIN_PATH=%s\\n' \"$PATH\"";
const LOGIN_SHELL_PATIENCE: Duration = Duration::from_secs(10);

static LOGIN_PATH: OnceLock<Option<String>> = OnceLock::new();

/// The PATH the person's own terminal has, read once from their shell as a terminal starts it, so steps find the tools
/// they installed; nothing when the shell cannot say within ten seconds.
pub fn login_path() -> Option<String> {
    LOGIN_PATH.get_or_init(read_login_path).clone()
}

fn read_login_path() -> Option<String> {
    let shell = std::env::var("SHELL").ok()?;
    let mut child = Command::new(shell)
        .args(["-i", "-l", "-c", PRINT_PATH])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    let output = child.stdout.take()?;
    let (sender, receiver) = mpsc::channel();
    std::thread::spawn(move || {
        let path = lossy_lines(output).find_map(|line| line.strip_prefix(PATH_MARKER).map(str::to_string));
        let _ = sender.send(path);
    });
    let path = receiver.recv_timeout(LOGIN_SHELL_PATIENCE).ok().flatten();
    let _ = child.kill();
    let _ = child.wait();
    path.filter(|found| !found.is_empty())
}
