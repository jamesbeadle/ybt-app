use super::build_stage::BuildRefusal;
use super::BuildRequest;
use std::path::{Path, PathBuf};
use tauri::Manager;

const DEFAULT_BUILDS_FOLDER: &str = "ybt-builds";
const GIT_SUFFIX: &str = ".git";
const HOME_MARKER: &str = "~";
const HOME_PREFIX: &str = "~/";
const PATH_SEPARATORS: [char; 2] = ['/', ':'];

/// Where a repository is built: the folder every checkout lives in, and this repository's checkout inside it.
pub struct Checkout {
    pub builds_folder: PathBuf,
    pub path: PathBuf,
}

/// Finds the checkout for the request's repository, making the builds folder when it does not exist yet.
/// A builds folder that cannot be used is this computer's to fix; a repository with no readable name is the task's.
pub fn locate(app: &tauri::AppHandle, request: &BuildRequest) -> Result<Checkout, BuildRefusal> {
    let builds_folder = builds_folder(app, &request.builds_folder).map_err(BuildRefusal::on_this_machine)?;
    std::fs::create_dir_all(&builds_folder).map_err(|error| {
        BuildRefusal::on_this_machine(format!("The builds folder {} could not be made: {error}", builds_folder.display()))
    })?;
    let repository = repository_folder(&request.repository_url).map_err(BuildRefusal::in_the_task)?;
    Ok(Checkout { path: builds_folder.join(repository), builds_folder })
}

fn builds_folder(app: &tauri::AppHandle, chosen: &str) -> Result<PathBuf, String> {
    let home = app
        .path()
        .home_dir()
        .map_err(|error| format!("The home folder could not be found: {error}"))?;
    let chosen = chosen.trim();
    if chosen.is_empty() {
        return Ok(home.join(DEFAULT_BUILDS_FOLDER));
    }
    let folder = expand_home(chosen, &home);
    if folder.is_relative() {
        let example = home.join(DEFAULT_BUILDS_FOLDER);
        return Err(format!("The builds folder must be a full path such as {}, not {chosen}.", example.display()));
    }
    Ok(folder)
}

fn expand_home(chosen: &str, home: &Path) -> PathBuf {
    if chosen == HOME_MARKER {
        return home.to_path_buf();
    }
    match chosen.strip_prefix(HOME_PREFIX) {
        Some(inside_home) => home.join(inside_home),
        None => PathBuf::from(chosen),
    }
}

/// The repository's owner and name from its URL, which together name its checkout folder.
fn repository_folder(repository_url: &str) -> Result<PathBuf, String> {
    let mut segments = repository_url.trim_end_matches('/').rsplit(PATH_SEPARATORS);
    let name = plain_folder_name(segments.next(), repository_url)?;
    let owner = plain_folder_name(segments.next(), repository_url)?;
    Ok(PathBuf::from(owner).join(name))
}

fn plain_folder_name(segment: Option<&str>, repository_url: &str) -> Result<String, String> {
    let segment = segment.unwrap_or_default();
    let name = segment.strip_suffix(GIT_SUFFIX).unwrap_or(segment);
    let is_plain = !name.is_empty() && !name.starts_with('.') && name.chars().all(is_folder_character);
    if !is_plain {
        return Err(format!("No checkout folder name could be read from the repository {repository_url}."));
    }
    Ok(name.to_string())
}

fn is_folder_character(character: char) -> bool {
    character.is_ascii_alphanumeric() || character == '-' || character == '_' || character == '.'
}
