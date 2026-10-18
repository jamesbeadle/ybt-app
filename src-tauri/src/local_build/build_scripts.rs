/// Stops before anything is cloned when Claude Code's command line cannot be found, since nothing can be built without it.
pub const FIND_CLAUDE_CODE: &str = r#"command -v claude >/dev/null 2>&1 || { echo "Claude Code's command line was not found on this computer, so nothing was built. Install it, open a new terminal to check that claude runs, then build again."; exit 1; }
echo "Claude Code is at $(command -v claude).""#;

pub const FIND_OR_CLONE: &str = r#"[ -d "$CHECKOUT/.git" ] && { echo "Using the checkout at $CHECKOUT."; exit 0; }
mkdir -p "$(dirname "$CHECKOUT")" && exec git clone "$REPOSITORY_URL" "$CHECKOUT""#;

/// Continues a branch an earlier attempt left, here or on origin, and starts one from the default branch only when neither has it.
pub const SWITCH_TO_BRANCH: &str = r#"[ -z "$(git status --porcelain)" ] || { echo 'The checkout has uncommitted changes, so nothing was built. Commit or discard them first.'; exit 1; }
git fetch origin --prune || exit 1
if git show-ref --verify --quiet "refs/heads/$TASK_BRANCH"; then
  git switch "$TASK_BRANCH" || exit 1
  git show-ref --verify --quiet "refs/remotes/origin/$TASK_BRANCH" || exit 0
  git merge --ff-only "origin/$TASK_BRANCH" && exit 0
  echo "The branch $TASK_BRANCH here and on origin have moved apart, so nothing was built. Bring the two together first."
  exit 1
fi
git show-ref --verify --quiet "refs/remotes/origin/$TASK_BRANCH" && exec git switch -c "$TASK_BRANCH" --track "origin/$TASK_BRANCH"
exec git switch -c "$TASK_BRANCH" --no-track "origin/$DEFAULT_BRANCH""#;

/// Installs again unless the last install finished and the lock file has not changed since; npm writes its hidden lock file only when an install completes.
pub const INSTALL_DEPENDENCIES: &str = r#"[ -f package.json ] || { echo 'No package.json, so there is nothing to install.'; exit 0; }
[ -f node_modules/.package-lock.json ] && [ ! package-lock.json -nt node_modules/.package-lock.json ] && { echo 'The dependencies are already installed.'; exit 0; }
[ -f package-lock.json ] && exec npm ci
exec npm install"#;

pub const COMMIT_LEFTOVERS: &str = r#"git checkout -q -- tools/refactor/audit-output 2>/dev/null
git add -A && { git diff --cached --quiet || git commit -q -m "$COMMIT_MESSAGE"; } || exit 1
[ "$(git rev-list --count "origin/$DEFAULT_BRANCH..HEAD")" -gt 0 ] || { echo 'No commits were made, so there is nothing to hand to review.'; exit 1; }"#;

pub const PUSH_BRANCH: &str = r#"exec git push -u origin "$TASK_BRANCH""#;

pub const KEEP_UNFINISHED_WORK: &str = r#"git checkout -q -- tools/refactor/audit-output 2>/dev/null
git add -A && { git diff --cached --quiet && echo 'Nothing was left uncommitted.' || git commit -q -m "$COMMIT_MESSAGE"; }
[ "$(git rev-list --count "origin/$DEFAULT_BRANCH..HEAD")" -gt 0 ] || { echo 'No commits to push.'; exit 0; }
exec git push -u origin "$TASK_BRANCH""#;

pub const PROMPT_START: &str = "Build this task in this repository, following CLAUDE.md. You are on the task's branch already. \
Edit the files the task needs; the checks, the commit and the push are run for you afterwards. The task: ";
