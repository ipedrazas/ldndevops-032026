import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { createGrepTool } from "./grep.js";

const FIXTURES = resolve(import.meta.dirname, "../__fixtures__/sample-repo");

function handler(repoDir: string = FIXTURES) {
  return createGrepTool(repoDir).handler;
}

describe("grep", () => {
  it("finds matching lines", async () => {
    const result = await handler()({ pattern: "express" }, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("express");
  });

  it("filters by glob", async () => {
    const result = await handler()({ pattern: "express", glob: "*.json" }, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("package.json");
    expect(text).not.toContain("src/index.ts");
  });

  it("supports case-insensitive search", async () => {
    const result = await handler()({ pattern: "EXPRESS", ignoreCase: true }, {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0]!.text).toContain("express");
  });

  it("returns no matches message", async () => {
    const result = await handler()({ pattern: "zzz_no_match_zzz" }, {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0]!.text).toContain("No matches");
  });

  it("rejects directory outside the repo", async () => {
    const result = await handler()({ pattern: "test", directory: "../../.." }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });
});
