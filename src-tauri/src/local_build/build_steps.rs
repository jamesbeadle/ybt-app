use super::checkout::Checkout;
use super::BuildRequest;
use crate::shell_steps::{claude_code_environment, repository_checks, ShellStep, BUILD_WITH_CLAUDE_CODE};
use std::collections::HashMap;
use std::path::Path;

const FIND_OR_CLONE: &str = "[ -d \"$CHECKOUT/.git\" ] && echo \"Using the checkout at $CHECKOUT.\" || \
git clone \"$REPOSITORY_URL\" \"$CHECKOUT\"";
const SWITCH_TO_BRANCH: &str = "[ -z \"$(git status --porcelain)\" ] || \
{ echo 'The checkout has uncommitted changes, so nothing was built. Commit or discard them first.'; exit 1; }\n\
git fetch origin --prune || exit 1\n\
git switch \"$TASK_BRANCH\" 2>/dev/null || git switch -c \"$TASK_BRANCH\" \"origin/$DEFAULT_BRANCH\"";
const COMMIT_LEFTOVERS: &str = "git checkout -q -- tools/refactor/audit-output 2>/dev/null\n\
git add -A && { git diff --cached --quiet || git commit -q -m \"$COMMIT_MESSAGE\"; } || exit 1\n\
[ \"$(git rev-list --count \"origin/$DEFAULT_BRANCH..HEAD\")\" -gt 0 ] || \
{ echo 'No commits were made, so there is nothing to hand to review.'; exit 1; }";
const PUSH_BRANCH: &str = "git push -u origin \"$TASK_BRANCH\"";
const KEEP_UNFINISHED_WORK: &str = "git checkout -q -- tools/refactor/audit-output 2>/dev/null\n\
git add -A && { git diff --cached --quiet && echo 'Nothing was left uncommitted.' || git commit -q -m \"$COMMIT_MESSAGE\"; }\n\
if [ \"$(git rev-list --count \"origin/$DEFAULT_BRANCH..HEAD\")\" -gt 0 ]; then git push -u origin \"$TASK_BRANCH\"; \
else echo 'No commits to push.'; fi";
const PROMPT_START: &str = "Build this task in this repository, following CLAUDE.md. You are on the task's branch already. \
Run the repository's checks before you finish, commit your work on the current branch with a message that is a \
sentence about the domain, and do not push. The task: ";

/// Finding or cloning the repository and switching to the task's branch; nothing is built until both pass.
pub fn prepare_steps(request: &BuildRequest, checkout: &Checkout) -> Vec<ShellStep> {
    let clone_environment = HashMap::from([
        ("CHECKOUT".to_string(), checkout.path.to_string_lossy().to_string()),
        ("REPOSITORY_URL".to_string(), request.repository_url.clone()),
    ]);
    vec![
        ShellStep::new("Find or clone the repository", FIND_OR_CLONE, &checkout.builds_folder)
            .with_environment(clone_environment)
            .that_must_pass(),
        ShellStep::new("Switch to the task's branch", SWITCH_TO_BRANCH, &checkout.path)
            .with_environment(branch_environment(request))
            .that_must_pass(),
    ]
}

/// Building, checking, committing and pushing the task's branch; every step must pass for the branch to reach review.
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
        ShellStep::new("Push the branch", PUSH_BRANCH, checkout)
            .with_environment(branch_environment(request))
            .that_must_pass(),
    ]
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
