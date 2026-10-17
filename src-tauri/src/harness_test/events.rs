/// What the test screen hears while a harness test runs.
#[derive(Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum HarnessEvent {
    StepStarted { title: String },
    OutputLine { text: String },
    StepFinished { title: String, is_passed: bool, seconds: u64 },
    Finished,
}
