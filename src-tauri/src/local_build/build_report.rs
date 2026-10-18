use super::build_stage::{BuildStage, StoppedStep};
use super::BuildRequest;
use std::path::Path;
use std::process::Command;

/// What the branch holds once the build has stopped: where it stopped and why, how many commits it made,
/// what they changed, and whether they reached origin.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildReport {
    pub checkout: String,
    pub failed_step: Option<String>,
    pub failed_stage: Option<BuildStage>,
    pub commit_count: u32,
    pub diff_stat: String,
    pub is_pushed: bool,
}

pub fn report(request: &BuildRequest, checkout: &Path, stopped_step: Option<StoppedStep>) -> BuildReport {
    let (failed_step, failed_stage) = stopped_step.map(|step| (step.title, step.stage)).unzip();
    let mut report = BuildReport {
        checkout: checkout.to_string_lossy().to_string(),
        failed_step,
        failed_stage,
        commit_count: 0,
        diff_stat: String::new(),
        is_pushed: false,
    };
    let current_branch = git_output(checkout, &["rev-parse", "--abbrev-ref", "HEAD"]);
    let is_on_task_branch = current_branch.trim() == request.branch;
    if !is_on_task_branch {
        return report;
    }
    let base = format!("origin/{}", request.default_branch);
    report.commit_count = git_output(checkout, &["rev-list", "--count", &format!("{base}..HEAD")])
        .trim()
        .parse()
        .unwrap_or_default();
    report.diff_stat = git_output(checkout, &["diff", "--stat", &format!("{base}...HEAD")]).trim_end().to_string();
    report.is_pushed = report.commit_count > 0 && is_branch_pushed(request, checkout);
    report
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
