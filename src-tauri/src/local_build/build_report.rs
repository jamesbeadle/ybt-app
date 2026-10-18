use super::BuildRequest;
use std::path::Path;
use std::process::Command;

/// What the branch holds once the build has stopped: how many commits it made, what they changed, and whether they reached origin.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildReport {
    pub checkout: String,
    pub failed_step: Option<String>,
    pub commit_count: u32,
    pub diff_stat: String,
    pub is_pushed: bool,
}

pub fn report(request: &BuildRequest, checkout: &Path, failed_step: Option<String>) -> BuildReport {
    let base = format!("origin/{}", request.default_branch);
    let commit_count = git_output(checkout, &["rev-list", "--count", &format!("{base}..HEAD")])
        .trim()
        .parse()
        .unwrap_or_default();
    let diff_stat = git_output(checkout, &["diff", "--stat", &format!("{base}...HEAD")]).trim_end().to_string();
    let is_pushed = commit_count > 0 && is_branch_pushed(request, checkout);
    BuildReport { checkout: checkout.to_string_lossy().to_string(), failed_step, commit_count, diff_stat, is_pushed }
}

fn is_branch_pushed(request: &BuildRequest, checkout: &Path) -> bool {
    let local_head = git_output(checkout, &["rev-parse", "HEAD"]);
    let remote_branch = format!("origin/{}", request.branch);
    let remote_head = git_output(checkout, &["rev-parse", "--verify", "--quiet", &remote_branch]);
    !local_head.trim().is_empty() && local_head.trim() == remote_head.trim()
}

fn git_output(checkout: &Path, arguments: &[&str]) -> String {
    Command::new("git")
        .args(arguments)
        .current_dir(checkout)
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .unwrap_or_default()
}
