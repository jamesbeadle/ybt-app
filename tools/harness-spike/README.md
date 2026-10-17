# Choosing how the local model writes code

The spike behind the YBT task *Choose how the local model writes code, proven on one easy task*. It tries the default harness first: Claude Code's command line pointed at LM Studio's Anthropic-compatible endpoint, so the local model works under the same `CLAUDE.md`, skills and branch guard as Claude does in the cloud.

## Run it on the Mac mini

1. LM Studio's server is running with `qwen3.6-35b-a3b-mlx` loaded (`curl http://127.0.0.1:1234/v1/models` lists it).
2. Claude Code is installed (`npm install -g @anthropic-ai/claude-code`).
3. Clone the repository of a 1-point buildable task, and save the task's text (its title, story and details from YBT) to a file.
4. `tools/harness-spike/try-claude-code.sh <the clone> <the task file>`

It branches from the default branch, lets the local model build the task, runs the repository's checks and the audit gate, and prints a report (also written beside the clone). It never pushes. Paste the report on the YBT task.

`LOCAL_MODEL` and `LM_STUDIO_ADDRESS` override the model id and the server address.

## If it falls short

The alternatives named on the task are an open-source agent such as Aider or OpenHands against LM Studio's OpenAI-compatible endpoint. The builder runs the harness as one command in a checkout, so swapping it is a change to that command alone.
