import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { createReadFileTool } from "./read-file.js";

const FIXTURES = resolve(import.meta.dirname, "../__fixtures__/sample-repo");

function handler(repoDir: string = FIXTURES) {
  return createReadFileTool(repoDir).handler;
}

describe("read_file", () => {
  it("reads a file with line numbers", async () => {
    const result = await handler()({ path: "package.json" }, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("1\t{");
    expect(text).toContain("sample-app");
  });

  it("supports offset and limit", async () => {
    const result = await handler()({ path: "src/index.ts", offset: 5, limit: 2 }, {});
    expect(result.isError).toBeFalsy();
    const lines = result.content[0]!.text.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^6\t/);
  });

  it("rejects paths outside the repo", async () => {
    const result = await handler()({ path: "../../etc/passwd" }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });

  it("returns error for non-existent file", async () => {
    const result = await handler()({ path: "does-not-exist.txt" }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Error reading file");
  });
});
