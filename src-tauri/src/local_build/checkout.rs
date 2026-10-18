use super::BuildRequest;
use std::path::PathBuf;
use tauri::Manager;

const DEFAULT_BUILDS_FOLDER: &str = "ybt-builds";
const GIT_SUFFIX: &str = ".git";
const PATH_SEPARATORS: [char; 2] = ['/', ':'];

/// Where a repository is built: the folder every checkout lives in, and this repository's checkout inside it.
pub struct Checkout {
    pub builds_folder: PathBuf,
    pub path: PathBuf,
}

/// Finds the checkout for the request's repository, making the builds folder when it does not exist yet.
pub fn locate(app: &tauri::AppHandle, request: &BuildRequest) -> Result<Checkout, String> {
    let builds_folder = builds_folder(app, &request.builds_folder)?;
    std::fs::create_dir_all(&builds_folder)
        .map_err(|error| format!("The builds folder {} could not be made: {error}", builds_folder.display()))?;
    let folder_name = repository_folder_name(&request.repository_url)?;
    let path = builds_folder.join(folder_name);
    Ok(Checkout { builds_folder, path })
}

fn builds_folder(app: &tauri::AppHandle, chosen: &str) -> Result<PathBuf, String> {
    let chosen = chosen.trim();
    if !chosen.is_empty() {
        return Ok(PathBuf::from(chosen));
    }
    let home = app
        .path()
        .home_dir()
        .map_err(|error| format!("The home folder could not be found: {error}"))?;
    Ok(home.join(DEFAULT_BUILDS_FOLDER))
}

/// The repository's name from its URL, which names its checkout folder.
fn repository_folder_name(repository_url: &str) -> Result<String, String> {
    let last_segment = repository_url
        .trim_end_matches('/')
        .rsplit(PATH_SEPARATORS)
        .next()
        .unwrap_or_default();
    let name = last_segment.strip_suffix(GIT_SUFFIX).unwrap_or(last_segment);
    let is_plain = !name.is_empty() && !name.starts_with('.') && name.chars().all(is_folder_character);
    if !is_plain {
        return Err(format!("No checkout folder name could be read from the repository {repository_url}."));
    }
    Ok(name.to_string())
}

fn is_folder_character(character: char) -> bool {
    character.is_ascii_alphanumeric() || character == '-' || character == '_' || character == '.'
}
