import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, validateServerConfig } from "./index.js";

const originalEnv = { ...process.env };

beforeEach(() => {
  // Set minimum required env vars
  process.env.ANTHROPIC_API_KEY = "sk-test-key";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("loadConfig", () => {
  it("loads with defaults", () => {
    const config = loadConfig();
    expect(config.anthropicApiKey).toBe("sk-test-key");
    expect(config.model).toBe("claude-sonnet-4-6");
    expect(config.maxTurns).toBe(50);
    expect(config.maxBudgetUsd).toBe(5.0);
    expect(config.maxToolCalls).toBe(200);
    expect(config.logLevel).toBe("info");
    expect(config.port).toBe(3000);
    expect(config.allowedRepos).toEqual([]);
  });

  it("reads env var overrides", () => {
    process.env.ANTHROPIC_MODEL = "claude-opus-4-6";
    process.env.MAX_TURNS = "100";
    process.env.MAX_COST = "10.50";
    process.env.MAX_TOOL_CALLS = "500";
    process.env.LOG_LEVEL = "debug";
    process.env.PORT = "8080";
    process.env.ALLOWED_REPOS = "myorg/*,other/repo";

    const config = loadConfig();
    expect(config.model).toBe("claude-opus-4-6");
    expect(config.maxTurns).toBe(100);
    expect(config.maxBudgetUsd).toBe(10.5);
    expect(config.maxToolCalls).toBe(500);
    expect(config.logLevel).toBe("debug");
    expect(config.port).toBe(8080);
    expect(config.allowedRepos).toEqual(["myorg/*", "other/repo"]);
  });

  it("throws on missing ANTHROPIC_API_KEY", () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => loadConfig()).toThrow("ANTHROPIC_API_KEY");
  });

  it("throws on invalid integer", () => {
    process.env.MAX_TURNS = "not-a-number";
    expect(() => loadConfig()).toThrow("Invalid integer");
  });

  it("throws on invalid float", () => {
    process.env.MAX_COST = "abc";
    expect(() => loadConfig()).toThrow("Invalid number");
  });

  it("accepts overrides", () => {
    const config = loadConfig({ model: "custom-model", port: 9999 });
    expect(config.model).toBe("custom-model");
    expect(config.port).toBe(9999);
  });
});

describe("validateServerConfig", () => {
  it("passes when GitHub vars are set", () => {
    process.env.GITHUB_TOKEN = "ghp_test";
    process.env.WEBHOOK_SECRET = "secret";
    const config = loadConfig();
    expect(() => validateServerConfig(config)).not.toThrow();
  });

  it("throws when GITHUB_TOKEN is missing", () => {
    process.env.WEBHOOK_SECRET = "secret";
    const config = loadConfig();
    expect(() => validateServerConfig(config)).toThrow("GITHUB_TOKEN");
  });

  it("throws when WEBHOOK_SECRET is missing", () => {
    process.env.GITHUB_TOKEN = "ghp_test";
    const config = loadConfig();
    expect(() => validateServerConfig(config)).toThrow("WEBHOOK_SECRET");
  });

  it("lists all missing vars", () => {
    const config = loadConfig();
    expect(() => validateServerConfig(config)).toThrow("GITHUB_TOKEN");
    expect(() => validateServerConfig(config)).toThrow("WEBHOOK_SECRET");
  });
});
