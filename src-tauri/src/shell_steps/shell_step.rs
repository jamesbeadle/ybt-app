use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// One shell step: a script run in a directory with its own environment. A step that must pass stops the run when it fails.
pub struct ShellStep {
    pub title: String,
    pub script: String,
    pub directory: PathBuf,
    pub environment: HashMap<String, String>,
    pub must_pass: bool,
}

impl ShellStep {
    pub fn new(title: &str, script: &str, directory: &Path) -> Self {
        Self {
            title: title.to_string(),
            script: script.to_string(),
            directory: directory.to_path_buf(),
            environment: HashMap::new(),
            must_pass: false,
        }
    }

    pub fn with_environment(mut self, environment: HashMap<String, String>) -> Self {
        self.environment = environment;
        self
    }

    pub fn that_must_pass(mut self) -> Self {
        self.must_pass = true;
        self
    }
}
