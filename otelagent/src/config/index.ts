import { parseAllowlist } from "./allowlist.js";

export interface Config {
  // Required for all modes
  anthropicApiKey: string;

  // Agent settings (all have defaults)
  model: string;
  maxTurns: number;
  maxBudgetUsd: number;
  maxToolCalls: number;
  logLevel: string;

  // Server-only (validated lazily)
  githubToken: string | undefined;
  webhookSecret: string | undefined;
  allowedRepos: string[];
  port: number;
}

export function loadConfig(overrides?: Partial<Config>): Config {
  const config: Config = {
    anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    maxTurns: parseIntEnv("MAX_TURNS", 50),
    maxBudgetUsd: parseFloatEnv("MAX_COST", 5.0),
    maxToolCalls: parseIntEnv("MAX_TOOL_CALLS", 200),
    logLevel: process.env.LOG_LEVEL ?? "info",
    githubToken: process.env.GITHUB_TOKEN,
    webhookSecret: process.env.WEBHOOK_SECRET,
    allowedRepos: parseAllowlist(process.env.ALLOWED_REPOS),
    port: parseIntEnv("PORT", 3000),
    ...overrides,
  };

  return config;
}

export function validateServerConfig(config: Config): void {
  const missing: string[] = [];
  if (!config.githubToken) missing.push("GITHUB_TOKEN");
  if (!config.webhookSecret) missing.push("WEBHOOK_SECRET");
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for server mode: ${missing.join(", ")}`
    );
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer for ${name}: ${raw}`);
  }
  return parsed;
}

function parseFloatEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for ${name}: ${raw}`);
  }
  return parsed;
}
