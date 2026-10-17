use super::HarnessRequest;
use std::collections::HashMap;

/// One shell step of the harness test; a step that must pass stops the test when it fails.
pub struct HarnessStep {
    pub title: String,
    pub script: String,
    pub environment: HashMap<String, String>,
    pub must_pass: bool,
}

const MAKE_BRANCH: &str = "git fetch origin && git switch -c \"$TEST_BRANCH\" origin/HEAD";
const BUILD_TASK: &str = "claude -p --permission-mode acceptEdits --output-format stream-json --verbose \"$TASK_PROMPT\"";
const RUN_CHECKS: &str = "[ ! -f package.json ] && echo 'No package.json, so no front-end checks.' && exit 0; \
npm run check && npm test && npm run build";
const RUN_GATE: &str = "python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast && \
python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json";
const SUMMARISE: &str = "echo \"Commits made: $(git rev-list --count origin/HEAD..HEAD)\"; git diff --stat origin/HEAD..HEAD";
const PROMPT_START: &str = "Build this task in this repository, following CLAUDE.md. Commit your work on the current \
branch, which is already the task's branch. Do not push. The task: ";
const LOCAL_TOKEN: &str = "lmstudio";

pub fn harness_steps(request: &HarnessRequest) -> Vec<HarnessStep> {
    let build_title = format!("Claude Code builds the task on {}", request.model);
    vec![
        step("Make a branch for the test", MAKE_BRANCH, branch_environment(), true),
        step(&build_title, BUILD_TASK, local_model_environment(request), false),
        step("Run the repository's checks", RUN_CHECKS, HashMap::new(), false),
        step("Run the audit and its gate", RUN_GATE, HashMap::new(), false),
        step("Count what changed", SUMMARISE, HashMap::new(), false),
    ]
}

fn step(title: &str, script: &str, environment: HashMap<String, String>, must_pass: bool) -> HarnessStep {
    HarnessStep { title: title.to_string(), script: script.to_string(), environment, must_pass }
}

fn branch_environment() -> HashMap<String, String> {
    let seconds = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs())
        .unwrap_or_default();
    HashMap::from([("TEST_BRANCH".to_string(), format!("spike/local-harness-{seconds}"))])
}

fn local_model_environment(request: &HarnessRequest) -> HashMap<String, String> {
    HashMap::from([
        ("ANTHROPIC_BASE_URL".to_string(), request.lm_studio_origin.clone()),
        ("ANTHROPIC_AUTH_TOKEN".to_string(), LOCAL_TOKEN.to_string()),
        ("ANTHROPIC_MODEL".to_string(), request.model.clone()),
        ("ANTHROPIC_SMALL_FAST_MODEL".to_string(), request.model.clone()),
        ("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC".to_string(), "1".to_string()),
        ("TASK_PROMPT".to_string(), format!("{PROMPT_START}{}", request.task_text)),
    ])
}
