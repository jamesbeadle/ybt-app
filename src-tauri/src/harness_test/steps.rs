use super::HarnessRequest;
use crate::shell_steps::{claude_code_environment, repository_checks, ShellStep, BUILD_WITH_CLAUDE_CODE};
use std::collections::HashMap;
use std::path::Path;

const MAKE_BRANCH: &str = "git fetch origin && git switch -c \"$TEST_BRANCH\" origin/HEAD";
const SUMMARISE: &str = "echo \"Commits made: $(git rev-list --count origin/HEAD..HEAD)\"; git diff --stat origin/HEAD..HEAD";
const PROMPT_START: &str = "Build this task in this repository, following CLAUDE.md. Commit your work on the current \
branch, which is already the task's branch. Do not push. The task: ";

pub fn harness_steps(request: &HarnessRequest, checkout: &Path) -> Vec<ShellStep> {
    let build_title = format!("Claude Code builds the task on {}", request.model);
    let prompt = format!("{PROMPT_START}{}", request.task_text);
    let build_environment = claude_code_environment(&request.lm_studio_origin, &request.model, &prompt);
    vec![
        ShellStep::new("Make a branch for the test", MAKE_BRANCH, checkout)
            .with_environment(branch_environment())
            .that_must_pass(),
        ShellStep::new(&build_title, BUILD_WITH_CLAUDE_CODE, checkout).with_environment(build_environment),
        ShellStep::new("Run the repository's checks", repository_checks::RUN_CHECKS, checkout),
        ShellStep::new("Run the audit and its gate", repository_checks::RUN_GATE, checkout),
        ShellStep::new("Count what changed", SUMMARISE, checkout),
    ]
}

fn branch_environment() -> HashMap<String, String> {
    let seconds = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs())
        .unwrap_or_default();
    HashMap::from([("TEST_BRANCH".to_string(), format!("spike/local-harness-{seconds}"))])
}
