/// The repository's own front-end checks, when it has a package.json.
pub const RUN_CHECKS: &str = "[ ! -f package.json ] && echo 'No package.json, so no front-end checks.' && exit 0; \
npm run check && npm test && npm run build";

/// The project-process audit and its gate, when the repository carries them.
pub const RUN_GATE: &str = "[ ! -d tools/refactor/audit ] && echo 'No audit in this repository, so no gate to pass.' && exit 0; \
python3 -B -m tools.refactor.audit.run_audit . --output tools/refactor/audit-output --fast && \
python3 -B -m tools.refactor.audit.gate tools/refactor/baseline.json tools/refactor/audit-output/audit.json";
