# OtelAgent

AI agent that analyses application observability instrumentation and can generate reports, coding-agent prompts, or directly fix the code.

Powered by the [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk), OtelAgent checks your codebase against three observability pillars — **Prometheus metrics**, **distributed tracing**, and **structured logging** — and scores it on a 0–10 maturity scale.

## Modes

| Mode | What it does | Output |
|------|-------------|--------|
| **REPORT** | Analyses the repo and produces a findings report with scores, issues, and recommendations | Markdown report |
| **PROMPT** | Generates a self-contained prompt you can hand to a coding agent to instrument the app | Markdown prompt |
| **FIX** | Directly modifies source files to add/fix instrumentation | Modified files + summary |

## Quick start

```bash
npm install
cp .env.example .env  # fill in ANTHROPIC_API_KEY
```

### CLI — analyse a local repo

```bash
# Default mode is report
npx tsx src/cli/index.ts analyze --repo /path/to/your/repo

# Generate a coding-agent prompt
npx tsx src/cli/index.ts analyze --repo /path/to/your/repo --mode prompt

# Fix instrumentation in-place
npx tsx src/cli/index.ts analyze --repo /path/to/your/repo --mode fix

# Write output to a file
npx tsx src/cli/index.ts analyze --repo /path/to/your/repo --output report.md
```

### Webhook server — GitHub PR comments

```bash
# Set required env vars
export GITHUB_TOKEN=ghp_...
export WEBHOOK_SECRET=your-secret
export ALLOWED_REPOS="myorg/*,my-other-org/pulse-*"

npx tsx src/cli/index.ts serve
```

Then comment on a PR:

```
/analyze report
/analyze prompt
/analyze fix
```

- **report** and **prompt** post the output as a PR comment.
- **fix** creates a new PR with the instrumentation changes.

## Docker

```bash
docker build -t otelagent .

# CLI mode
docker run --rm \
  -e ANTHROPIC_API_KEY \
  -v /path/to/repo:/repo \
  otelagent analyze --repo /repo --mode report

# Server mode (default entrypoint)
docker run --rm \
  -e ANTHROPIC_API_KEY \
  -e GITHUB_TOKEN \
  -e WEBHOOK_SECRET \
  -e ALLOWED_REPOS="myorg/*" \
  -p 3000:3000 \
  otelagent
```

## Configuration

All settings are configurable via environment variables. CLI flags override env vars when provided.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-6` | Claude model to use |
| `MAX_TURNS` | No | `50` | Max agent turns per run |
| `MAX_COST` | No | `5.00` | Max cost in USD per run |
| `MAX_TOOL_CALLS` | No | `200` | Max tool invocations per run |
| `LOG_LEVEL` | No | `info` | Log level |
| `GITHUB_TOKEN` | Server only | — | GitHub PAT for repo access and PR operations |
| `WEBHOOK_SECRET` | Server only | — | GitHub webhook secret for signature verification |
| `ALLOWED_REPOS` | No | — | Comma-separated glob patterns (e.g. `myorg/*,other/repo`) |
| `PORT` | No | `3000` | Server listen port |

## Repo allowlist

The `ALLOWED_REPOS` env var controls which repositories the agent will analyse. Supports glob patterns:

- `myorg/*` — any repo under myorg
- `myorg/prefix-*` — repos starting with prefix-
- `myorg/exact-repo` — exact match

When empty or unset, all repos are allowed.

## Agent tools

The agent has access to these tools for analysing and modifying code:

| Tool | Description |
|------|-------------|
| `clone_repo` | Git clone a URL into a temp directory |
| `list_files` | List files matching a glob pattern |
| `read_file` | Read file contents with optional offset/limit |
| `grep` | Regex search across files |
| `run_command` | Execute shell commands in the repo directory |
| `write_file` | Create or overwrite files (FIX mode) |
| `edit_file` | Targeted string replacement in files (FIX mode) |
| `write_report` | Emit the final structured output |

## Development

```bash
npm install
npm run build      # compile TypeScript
npm run dev        # run CLI via tsx (no build needed)
npm test           # run tests
npm run lint       # lint
```

## Project structure

```
src/
  agent/       # Agent loop, system prompt loading
  cli/         # CLI entrypoint (analyze + serve subcommands)
  config/      # Env var parsing, allowlist
  server/      # Webhook HTTP server, GitHub API client
  tools/       # Tool implementations (one file per tool)
docs/
  system-prompt.md   # Agent system prompt
plans/
  otelagent.md       # Implementation plan
```

## License

MIT
