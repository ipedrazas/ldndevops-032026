# Plan: OtelAgent — Observability Analysis Agent

> Source PRD: `docs/system-prompt.md` + design decisions from grilling session

## Architectural decisions

Durable decisions that apply across all phases:

- **Language & runtime**: TypeScript, Node.js
- **Agent framework**: Anthropic Claude Agent SDK with tool-use loop
- **Model**: Configurable via `ANTHROPIC_MODEL` env var
- **System prompt**: Loaded from `docs/system-prompt.md` at startup
- **Tool pattern**: Each tool is a self-contained module exporting a name, description, input schema, and handler function. A registry collects them at startup — new tools are added by dropping a module into the tools directory.
- **Entrypoints**: Two thin wrappers over the same agent core:
  - **CLI**: `src/cli/index.ts` — parses args, invokes agent, writes output
  - **Server**: `src/server/index.ts` — HTTP server, receives GitHub webhooks, invokes agent, posts results back to GitHub
- **GitHub auth**: PAT via `GITHUB_TOKEN` env var
- **Repo allowlist**: `ALLOWED_REPOS` env var, comma-separated glob patterns (e.g. `myorg/*,my-other-org/pulse-*`)
- **Guardrails**: `MAX_COST` and `MAX_TOOL_CALLS` env vars
- **Concurrency**: Webhook requests processed in parallel (no queue, no locking)
- **Repo cleanup**: Cloned repos wiped from temp dir after each agent run
- **Packaging**: Docker container with git and Node.js; no language runtimes for analyzed repos (static analysis only)
- **Webhook trigger**: GitHub PR `issue_comment` event; comment body parsed for command (e.g. `/analyze report`)
- **Output routing**:
  - REPORT / PROMPT → GitHub PR comment
  - FIX → new branch + new PR against the source branch
  - CLI → stdout (default) or file via `--output` flag

---

## Phase 1: Project Skeleton & Agent Core

**User stories**: As a developer, I can run a minimal agent that reads files from a local repo and returns an analysis response, proving the Agent SDK loop works end-to-end.

### What to build

Set up the TypeScript project (package.json, tsconfig, eslint, project structure). Wire up the Claude Agent SDK with the system prompt from `docs/system-prompt.md`. Implement a single tool — `read_file` — so the agent can read files from a provided repo path. Create a minimal CLI entrypoint that accepts a `--repo` path argument and prints the agent's raw response to stdout.

The goal is a working agent loop: system prompt → user message ("analyse this repo at /path") → agent calls `read_file` in a loop → agent produces output.

### Acceptance criteria

- [ ] TypeScript project compiles and runs with `tsx` or equivalent
- [ ] Agent SDK initialised with system prompt loaded from `docs/system-prompt.md`
- [ ] `read_file` tool registered and callable by the agent
- [ ] CLI entrypoint accepts `--repo <path>` and sends a user message to the agent
- [ ] Agent iterates using tool calls and returns a text response printed to stdout
- [ ] Project structure follows the layout: `src/agent/`, `src/tools/`, `src/cli/`, `src/server/`, `src/config/`

---

## Phase 2: Full Tool Suite

**User stories**: As the agent, I can deeply explore any repository by listing files, reading contents, searching with regex, and running shell commands — and in FIX mode I can modify files.

### What to build

Implement all remaining tools following the extensible registration pattern established in Phase 1:

- **`clone_repo`** — git clone a URL into a temp directory, return the path
- **`list_files`** — glob/find within a directory, with pattern filtering
- **`grep`** — regex search across files, return matches with file/line context
- **`run_command`** — execute a shell command within the repo directory, return stdout/stderr
- **`write_file`** — create or overwrite a file (FIX mode)
- **`edit_file`** — apply a targeted string replacement in a file (FIX mode)

Each tool validates its inputs and constrains operations to the repo directory (no path traversal outside the working repo).

### Acceptance criteria

- [ ] All six tools implemented as separate modules following the shared tool interface
- [ ] Tool registry auto-discovers and loads all tool modules
- [ ] `clone_repo` clones to a system temp dir and returns the path
- [ ] `list_files` supports glob patterns and returns sorted results
- [ ] `grep` supports regex, returns file paths with line numbers and matching content
- [ ] `run_command` executes in the repo directory and returns stdout/stderr with exit code
- [ ] `write_file` and `edit_file` refuse to write outside the repo directory
- [ ] Agent can use the full tool suite to explore a real repository

---

## Phase 3: CLI Polish & Output Modes

**User stories**: As a developer, I can run the agent locally via Docker with my repo mounted and choose the analysis mode (REPORT, PROMPT, FIX) and output destination (stdout or file).

### What to build

Extend the CLI to support:

- `--mode report|prompt|fix` flag that is injected into the user message so the agent knows which action to take
- `--output <path>` flag that redirects the agent's final output to a file instead of stdout
- A `write_report` tool the agent calls to emit its final structured output (this ensures the output is cleanly separated from tool-use chatter)

In FIX mode the agent modifies files in-place in the mounted repo — no git operations from the CLI (that's the server's job).

### Acceptance criteria

- [ ] `--mode` flag accepted with values `report`, `prompt`, `fix`; defaults to `report`
- [ ] `--output` flag writes final output to the specified file path
- [ ] Without `--output`, output goes to stdout
- [ ] `write_report` tool captures the agent's final output and routes it to the correct destination
- [ ] In FIX mode, agent uses `write_file`/`edit_file` tools to modify the mounted repo
- [ ] CLI prints a non-zero exit code on agent failure
- [ ] Running `docker run -v ./my-repo:/repo otelagent --repo /repo --mode report` produces a usable Markdown report

---

## Phase 4: Webhook Server & GitHub Integration

**User stories**: As a developer, I can comment `/analyze report` on a PR and receive an observability analysis as a PR comment. For `/analyze fix`, the agent creates a new PR with instrumentation changes.

### What to build

An HTTP server that:

1. Receives GitHub `issue_comment` webhook events
2. Validates the webhook signature
3. Parses the comment body for `/analyze <mode>` commands
4. Checks the repo against the `ALLOWED_REPOS` allowlist
5. Clones the PR's head branch into a temp directory
6. Runs the agent with the appropriate mode
7. Posts results back:
   - REPORT / PROMPT → PR comment via GitHub API
   - FIX → pushes a new branch and opens a PR against the source branch

Webhook processing is concurrent — each incoming event spawns an independent agent run. The cloned repo temp directory is wiped after the run completes (success or failure).

### Acceptance criteria

- [ ] HTTP server starts and listens on a configurable port (`PORT` env var)
- [ ] `POST /webhook` endpoint accepts GitHub `issue_comment` events
- [ ] Webhook signature validated against `WEBHOOK_SECRET` env var
- [ ] Comment body parsed: `/analyze report`, `/analyze prompt`, `/analyze fix`
- [ ] Repos checked against `ALLOWED_REPOS` glob patterns; rejected repos get a reply comment explaining denial
- [ ] Agent clones the PR's head ref and runs analysis
- [ ] REPORT and PROMPT results posted as a PR comment
- [ ] FIX results pushed to a new branch named `otelagent/fix/<source-branch>` and a PR opened against the source branch
- [ ] Multiple concurrent webhook events processed in parallel
- [ ] Cloned repo temp directory cleaned up after every run (including on error)
- [ ] Health check endpoint at `GET /health`

---

## Phase 5: Config, Guardrails & Docker

**User stories**: As an operator, I can configure the agent via environment variables and deploy it as a Docker container with all dependencies included.

### What to build

Centralise all configuration into a config module that reads and validates environment variables at startup:

- `ANTHROPIC_API_KEY` — required
- `ANTHROPIC_MODEL` — optional, defaults to `claude-sonnet-4-6`
- `GITHUB_TOKEN` — required for server mode, not needed for CLI
- `WEBHOOK_SECRET` — required for server mode
- `ALLOWED_REPOS` — comma-separated glob patterns
- `MAX_COST` — max dollar cost per agent run (agent stops if exceeded)
- `MAX_TOOL_CALLS` — max tool invocations per agent run
- `PORT` — server port, defaults to 3000
- `LOG_LEVEL` — defaults to `info`

Build a Dockerfile that packages the agent with Node.js and git. No language-specific runtimes for analyzed repos.

### Acceptance criteria

- [ ] Config module validates all required env vars at startup and fails fast with clear error messages
- [ ] `MAX_TOOL_CALLS` enforced — agent run halted with a summary if limit reached
- [ ] `MAX_COST` enforced — agent run halted with a summary if cost limit reached
- [ ] Missing `GITHUB_TOKEN` or `WEBHOOK_SECRET` only errors in server mode, not CLI mode
- [ ] Dockerfile builds a working image with Node.js and git
- [ ] `docker run` with env vars starts the server or CLI depending on entrypoint args
- [ ] Image size is reasonable (use multi-stage build or slim base)

---

## Phase 6: Testing

**User stories**: As a maintainer, I can trust that changes don't break existing functionality because the test suite covers the critical paths.

### What to build

Add tests across the project:

- **Unit tests** for each tool (mock filesystem/shell, verify input validation, path traversal prevention)
- **Unit tests** for config module (env var parsing, validation, defaults)
- **Unit tests** for allowlist matching (glob pattern logic)
- **Unit tests** for webhook parsing (comment body extraction, signature validation)
- **Integration tests** for the agent loop (mock the Anthropic API, verify the agent calls tools in a reasonable sequence for a sample repo)
- **Integration tests** for the webhook server (send a mock webhook event, verify the correct GitHub API calls are made)

Use Vitest as the test runner.

### Acceptance criteria

- [ ] All tool modules have unit tests covering happy path and error cases
- [ ] Path traversal prevention tested for `read_file`, `write_file`, `edit_file`, `run_command`
- [ ] Config validation tested: missing required vars, invalid values, correct defaults
- [ ] Allowlist glob matching tested: exact match, wildcard org, wildcard repo prefix, rejection
- [ ] Webhook comment parsing tested: valid commands, invalid commands, non-matching comments
- [ ] Webhook signature validation tested: valid signature, invalid signature, missing signature
- [ ] Integration test: mock Anthropic API, run agent against a fixture repo, verify tool call sequence
- [ ] Integration test: mock webhook delivery, verify GitHub API calls (comment post, PR creation)
- [ ] All tests pass in CI (`npm test`)
- [ ] Test coverage reported

---

## Phase 7: CI/CD

**User stories**: As a maintainer, I can merge code confidently because CI runs tests on every push, and releases automatically build and publish the Docker image.

### What to build

Two GitHub Actions workflows:

1. **CI (on push)**: Install dependencies, lint, run all tests
2. **Release (on tag / release)**: Build Docker image, push to GitHub Container Registry (ghcr.io)

### Acceptance criteria

- [ ] CI workflow runs on every push to any branch
- [ ] CI installs dependencies, runs lint, runs tests
- [ ] CI fails the build if any test fails or lint errors exist
- [ ] Release workflow triggers on GitHub release creation (tag push)
- [ ] Release builds the Docker image tagged with the release version and `latest`
- [ ] Release pushes the image to `ghcr.io/<org>/otelagent`
- [ ] Both workflows use caching for node_modules
