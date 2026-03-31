import { describe, it, expect, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import type { Server } from "node:http";
import type { Config } from "../config/index.js";
import { startServer } from "./index.js";

const SECRET = "test-webhook-secret";
let server: Server | undefined;
let port: number;

function makeConfig(overrides?: Partial<Config>): Config {
  return {
    anthropicApiKey: "sk-test",
    model: "claude-sonnet-4-6",
    maxTurns: 50,
    maxBudgetUsd: 5,
    maxToolCalls: 200,
    logLevel: "info",
    githubToken: "ghp_test",
    webhookSecret: SECRET,
    allowedRepos: ["myorg/*"],
    port: 0, // random port
    ...overrides,
  };
}

function sign(payload: string): string {
  return "sha256=" + createHmac("sha256", SECRET).update(payload, "utf-8").digest("hex");
}

async function startTestServer(config?: Partial<Config>): Promise<void> {
  const cfg = makeConfig(config);
  server = startServer(cfg);
  // Wait for server to be listening and get assigned port
  await new Promise<void>((resolve) => {
    server!.on("listening", () => {
      const addr = server!.address();
      port = typeof addr === "object" && addr ? addr.port : 0;
      resolve();
    });
  });
}

afterEach(async () => {
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
});

describe("webhook server", () => {
  it("responds to health check", async () => {
    await startTestServer();
    const res = await fetch(`http://localhost:${port}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    await startTestServer();
    const res = await fetch(`http://localhost:${port}/unknown`);
    expect(res.status).toBe(404);
  });

  it("rejects webhook with invalid signature", async () => {
    await startTestServer();
    const res = await fetch(`http://localhost:${port}/webhook`, {
      method: "POST",
      headers: {
        "x-github-event": "issue_comment",
        "x-hub-signature-256": "sha256=invalid",
        "content-type": "application/json",
      },
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  it("ignores non-issue_comment events", async () => {
    await startTestServer();
    const body = "{}";
    const res = await fetch(`http://localhost:${port}/webhook`, {
      method: "POST",
      headers: {
        "x-github-event": "push",
        "x-hub-signature-256": sign(body),
        "content-type": "application/json",
      },
      body,
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Ignored event");
  });

  it("returns 200 for comment without /analyze command", async () => {
    await startTestServer();
    const payload = JSON.stringify({
      action: "created",
      comment: { id: 1, body: "looks good!", user: { login: "user" } },
      issue: { number: 1, pull_request: { url: "https://api.github.com/..." } },
      repository: { full_name: "myorg/repo", clone_url: "https://github.com/myorg/repo.git" },
    });
    const res = await fetch(`http://localhost:${port}/webhook`, {
      method: "POST",
      headers: {
        "x-github-event": "issue_comment",
        "x-hub-signature-256": sign(payload),
        "content-type": "application/json",
      },
      body: payload,
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("No command found");
  });

  it("rejects repo not in allowlist", async () => {
    await startTestServer({ allowedRepos: ["allowed-org/*"] });
    const payload = JSON.stringify({
      action: "created",
      comment: { id: 1, body: "/analyze report", user: { login: "user" } },
      issue: { number: 1, pull_request: { url: "https://api.github.com/..." } },
      repository: { full_name: "denied-org/repo", clone_url: "https://github.com/denied-org/repo.git" },
    });
    const res = await fetch(`http://localhost:${port}/webhook`, {
      method: "POST",
      headers: {
        "x-github-event": "issue_comment",
        "x-hub-signature-256": sign(payload),
        "content-type": "application/json",
      },
      body: payload,
    });
    // Server responds 200 (it posts a denial comment) — but the test PAT will fail the GitHub API call.
    // We just verify the allowlist check kicks in by checking the response text.
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Repo not allowed");
  });
});
