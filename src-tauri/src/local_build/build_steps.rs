use super::build_scripts::{
    COMMIT_LEFTOVERS, FIND_CLAUDE_CODE, FIND_OR_CLONE, INSTALL_DEPENDENCIES, KEEP_UNFINISHED_WORK, PROMPT_START,
    PUSH_BRANCH, SWITCH_TO_BRANCH,
};
use super::checkout::Checkout;
use super::BuildRequest;
use crate::shell_steps::{claude_code_environment, repository_checks, ShellStep, BUILD_WITH_CLAUDE_CODE};
use std::collections::HashMap;
use std::path::Path;

/// Finding Claude Code, finding or cloning the repository, switching to the task's branch and installing its dependencies;
/// nothing is built until all four pass.
pub fn prepare_steps(request: &BuildRequest, checkout: &Checkout) -> Vec<ShellStep> {
    let clone_environment = HashMap::from([
        ("CHECKOUT".to_string(), checkout.path.to_string_lossy().to_string()),
        ("REPOSITORY_URL".to_string(), request.repository_url.clone()),
    ]);
    vec![
        ShellStep::new("Find Claude Code", FIND_CLAUDE_CODE, &checkout.builds_folder).that_must_pass(),
        ShellStep::new("Find or clone the repository", FIND_OR_CLONE, &checkout.builds_folder)
            .with_environment(clone_environment)
            .that_must_pass(),
        ShellStep::new("Switch to the task's branch", SWITCH_TO_BRANCH, &checkout.path)
            .with_environment(branch_environment(request))
            .that_must_pass(),
        ShellStep::new("Install the repository's dependencies", INSTALL_DEPENDENCIES, &checkout.path).that_must_pass(),
    ]
}

/// Building, checking and committing the task's branch; every step must pass before the branch is pushed.
pub fn work_steps(request: &BuildRequest, checkout: &Path) -> Vec<ShellStep> {
    let build_title = format!("Claude Code builds the task on {}", request.model);
    let prompt = format!("{PROMPT_START}{}", request.task_text);
    let build_environment = claude_code_environment(&request.lm_studio_origin, &request.model, &prompt);
    let commit_message = format!("Finish the local build of \"{}\"", request.task_title);
    vec![
        ShellStep::new(&build_title, BUILD_WITH_CLAUDE_CODE, checkout)
            .with_environment(build_environment)
            .that_must_pass(),
        ShellStep::new("Run the repository's checks", repository_checks::RUN_CHECKS, checkout).that_must_pass(),
        ShellStep::new("Run the audit and its gate", repository_checks::RUN_GATE, checkout).that_must_pass(),
        ShellStep::new("Commit what was left uncommitted", COMMIT_LEFTOVERS, checkout)
            .with_environment(commit_environment(request, &commit_message))
            .that_must_pass(),
    ]
}

/// Pushing the finished branch so review can read it.
pub fn push_step(request: &BuildRequest, checkout: &Path) -> ShellStep {
    ShellStep::new("Push the branch", PUSH_BRANCH, checkout)
        .with_environment(branch_environment(request))
        .that_must_pass()
}

/// Commits whatever a failed build left behind and pushes the branch, so whoever takes the task next can see the work.
pub fn keep_unfinished_work_step(request: &BuildRequest, checkout: &Path) -> ShellStep {
    let commit_message = format!("Keep the unfinished local build of \"{}\"", request.task_title);
    ShellStep::new("Keep the unfinished work on the branch", KEEP_UNFINISHED_WORK, checkout)
        .with_environment(commit_environment(request, &commit_message))
}

fn branch_environment(request: &BuildRequest) -> HashMap<String, String> {
    HashMap::from([
        ("TASK_BRANCH".to_string(), request.branch.clone()),
        ("DEFAULT_BRANCH".to_string(), request.default_branch.clone()),
    ])
}

fn commit_environment(request: &BuildRequest, commit_message: &str) -> HashMap<String, String> {
    let mut environment = branch_environment(request);
    environment.insert("COMMIT_MESSAGE".to_string(), commit_message.to_string());
    environment
}
