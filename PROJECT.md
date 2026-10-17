# This project

This repository's own instructions: its conventions, the commands that build and test it, the domain it serves, and any standing tasks or prompts that belong to this project and no other. `CLAUDE.md` loads this file and every session reads it after the kit's rules.

The project-process kit writes this file once and never touches it again, and `CLAUDE.md` is the kit's, replaced whole every time the bootstrap runs, so anything written there is lost. Write here instead. Where this file and the kit disagree about this project, this file wins, except that nothing here lifts the branch rule: the work still happens on a branch and ends as a pull request.

## What this repository is

**YBT Desktop**: the macOS app on the office Mac mini (M5 Pro, 64 GB) that puts Your Business Today and the local model side by side. James talks to the local model to manage YBT, sees the board of buildable work with the story point range each model takes, and the local builder builds easy tasks on a branch and hands them to the review model. Its tasks live on the **YBT Desktop** project in YBT, under the goal *Improve the Entire Project Process* on the YourBusinessToday project.

- **Stack:** Tauri 2 with SvelteKit (Svelte 5 runes, Tailwind 4, `adapter-static` as a single-page app). The Rust shell in `src-tauri/` stays thin: plugins for HTTP, the browser opener and the settings store, and the one-shot loopback listener YBT's sign-in redirects to (`sign_in_redirect.rs`). Everything else is TypeScript in `src/lib/`.
- **YBT** is reached through its MCP connector at `<YBT address>/api/mcp`, stateless JSON-RPC with a bearer token. The app signs in with OAuth (dynamic client registration as a public client, PKCE S256, a loopback redirect on a free port), keeps the session in the store and refreshes it a minute before it expires. Writes go through `perform_action`, so they are recorded under the signed-in person, exactly as on the site.
- **LM Studio** serves the local model at `http://127.0.0.1:1234` by default (OpenAI- and Anthropic-compatible). The default office model is Qwen3.6-35B-A3B, 8-bit MLX.
- **Requests** go through `@tauri-apps/plugin-http`, never the webview's own `fetch`, so neither YBT nor LM Studio needs CORS; `src-tauri/capabilities/default.json` lists the hosts the app may reach.

## Commands

- `npm install`, then `npm run tauri dev` on the Mac to run the app; `npm run tauri build` for the `.app` and `.dmg`.
- `npm run check`, `npm test`, `npm run build` — the front end's checks, as CI runs them.
- `cargo check --manifest-path src-tauri/Cargo.toml` — the shell compiles (on Linux it needs `libwebkit2gtk-4.1-dev`; CI installs it).
