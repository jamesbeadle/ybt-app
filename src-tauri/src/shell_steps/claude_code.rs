use std::collections::HashMap;

/// Claude Code building a task without asking, on the model and prompt its environment names.
pub const BUILD_WITH_CLAUDE_CODE: &str =
    "claude -p --permission-mode acceptEdits --output-format stream-json --verbose \"$TASK_PROMPT\"";
const LOCAL_TOKEN: &str = "lmstudio";

/// The environment that points Claude Code at the local model and hands it the task.
pub fn claude_code_environment(lm_studio_origin: &str, model: &str, prompt: &str) -> HashMap<String, String> {
    HashMap::from([
        ("ANTHROPIC_BASE_URL".to_string(), lm_studio_origin.to_string()),
        ("ANTHROPIC_AUTH_TOKEN".to_string(), LOCAL_TOKEN.to_string()),
        ("ANTHROPIC_MODEL".to_string(), model.to_string()),
        ("ANTHROPIC_SMALL_FAST_MODEL".to_string(), model.to_string()),
        ("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC".to_string(), "1".to_string()),
        ("TASK_PROMPT".to_string(), prompt.to_string()),
    ])
}
