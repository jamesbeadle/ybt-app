#!/usr/bin/env bash
# Builds one easy task with Claude Code pointed at LM Studio's Anthropic-compatible endpoint,
# then runs the repository's checks and the audit gate, and writes what happened to a report.
# Usage: try-claude-code.sh <checkout of the task's repository> <file holding the task's text>
set -uo pipefail

checkout="$(cd "$1" && pwd)"
task_file="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
model="${LOCAL_MODEL:-qwen3.6-35b-a3b-mlx}"
lm_studio="${LM_STUDIO_ADDRESS:-http://127.0.0.1:1234}"
branch="spike/local-harness-$(date +%Y%m%d-%H%M)"
report="$checkout/../local-harness-report-$(date +%Y%m%d-%H%M).md"

cd "$checkout"
git fetch -q origin && git switch -q -c "$branch" "origin/$(git remote show origin | sed -n 's/.*HEAD branch: //p')"

started=$(date +%s)
ANTHROPIC_BASE_URL="$lm_studio" ANTHROPIC_AUTH_TOKEN=lmstudio ANTHROPIC_MODEL="$model" \
ANTHROPIC_SMALL_FAST_MODEL="$model" CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
	claude -p --permission-mode acceptEdits --output-format text \
	"Build this task in this repository, following CLAUDE.md. Commit your work on the current branch, which is already the task's branch. Do not push. The task: $(cat "$task_file")" \
	> "$checkout/../local-harness-transcript.txt" 2>&1
harness_exit=$?
seconds=$(( $(date +%s) - started ))

run_check() { "$@" > /dev/null 2>&1 && echo "passed" || echo "failed"; }
checks="not run"
[ -f package.json ] && checks="check $(run_check npm run check), tests $(run_check npm test), build $(run_check npm run build)"
python3 -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast > /dev/null 2>&1
gate=$(run_check python3 -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json)

cat > "$report" <<REPORT
# Local harness spike: Claude Code on $model

- Repository: $(basename "$checkout"), branch $branch
- Harness exit code: $harness_exit, in $seconds seconds
- Commits made: $(git rev-list --count "origin/HEAD..HEAD" 2>/dev/null || echo unknown)
- Files changed: $(git diff --stat "origin/HEAD..HEAD" 2>/dev/null | tail -1)
- Checks: $checks
- Audit gate: $gate
- Transcript: local-harness-transcript.txt beside the checkout
REPORT
cat "$report"
