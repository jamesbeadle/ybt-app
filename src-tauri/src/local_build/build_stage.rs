/// Where the fault lies when a build stops: in the task as YBT records it, in this computer's set-up, or in the model's work.
#[derive(Clone, Copy, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BuildStage {
    Task,
    Machine,
    Work,
}

/// The step a build stopped at, and where its fault lies.
pub struct StoppedStep {
    pub title: String,
    pub stage: BuildStage,
}

impl StoppedStep {
    pub fn on_this_machine(title: String) -> Self {
        Self { title, stage: BuildStage::Machine }
    }

    pub fn in_the_work(title: String) -> Self {
        Self { title, stage: BuildStage::Work }
    }
}

/// Why a build could not start, and where its fault lies, as the Builder screen receives it.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildRefusal {
    pub reason: String,
    pub stage: BuildStage,
}

impl BuildRefusal {
    pub fn on_this_machine(reason: String) -> Self {
        Self { reason, stage: BuildStage::Machine }
    }

    pub fn in_the_task(reason: String) -> Self {
        Self { reason, stage: BuildStage::Task }
    }
}
