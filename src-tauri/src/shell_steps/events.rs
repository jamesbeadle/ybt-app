/// What a screen hears while shell steps run.
#[derive(Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum StepEvent {
    StepStarted { title: String },
    OutputLine { text: String },
    StepFinished { title: String, is_passed: bool, seconds: u64 },
    Finished,
}
