import { describe, it, expect } from "vitest";
import { parseCommand, parseWebhookPayload, type IssueCommentPayload } from "./webhook-parser.js";

describe("parseCommand", () => {
  it("parses /analyze report", () => {
    expect(parseCommand("/analyze report")).toBe("report");
  });

  it("parses /analyze prompt", () => {
    expect(parseCommand("/analyze prompt")).toBe("prompt");
  });

  it("parses /analyze fix", () => {
    expect(parseCommand("/analyze fix")).toBe("fix");
  });

  it("is case-insensitive", () => {
    expect(parseCommand("/Analyze REPORT")).toBe("report");
  });

  it("handles extra whitespace", () => {
    expect(parseCommand("/analyze  report  ")).toBe("report");
  });

  it("extracts command from multiline comment", () => {
    expect(parseCommand("Some text\n/analyze report\nMore text")).toBe("report");
  });

  it("returns null for non-matching comment", () => {
    expect(parseCommand("just a regular comment")).toBeNull();
  });

  it("returns null for invalid mode", () => {
    expect(parseCommand("/analyze invalid")).toBeNull();
  });
});

function makePayload(overrides?: Partial<IssueCommentPayload>): IssueCommentPayload {
  return {
    action: "created",
    comment: {
      id: 1,
      body: "/analyze report",
      user: { login: "testuser" },
    },
    issue: {
      number: 42,
      pull_request: { url: "https://api.github.com/repos/myorg/myrepo/pulls/42" },
    },
    repository: {
      full_name: "myorg/myrepo",
      clone_url: "https://github.com/myorg/myrepo.git",
    },
    ...overrides,
  };
}

describe("parseWebhookPayload", () => {
  it("parses a valid PR comment payload", () => {
    const result = parseWebhookPayload(makePayload());
    expect(result).toEqual({
      repoFullName: "myorg/myrepo",
      repoCloneUrl: "https://github.com/myorg/myrepo.git",
      prNumber: 42,
      commentId: 1,
      commentUser: "testuser",
    });
  });

  it("returns null for non-created action", () => {
    expect(parseWebhookPayload(makePayload({ action: "edited" }))).toBeNull();
  });

  it("returns null for non-PR issue comment", () => {
    expect(
      parseWebhookPayload(
        makePayload({ issue: { number: 42, pull_request: undefined } })
      )
    ).toBeNull();
  });
});
