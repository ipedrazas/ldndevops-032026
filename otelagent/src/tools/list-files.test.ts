import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { createListFilesTool } from "./list-files.js";

const FIXTURES = resolve(import.meta.dirname, "../__fixtures__/sample-repo");

function handler(repoDir: string = FIXTURES) {
  return createListFilesTool(repoDir).handler;
}

describe("list_files", () => {
  it("lists all files with default pattern", async () => {
    const result = await handler()({}, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("package.json");
    expect(text).toContain("src/index.ts");
  });

  it("filters by glob pattern", async () => {
    const result = await handler()({ pattern: "**/*.ts" }, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("index.ts");
    expect(text).not.toContain("package.json");
  });

  it("searches within a subdirectory", async () => {
    const result = await handler()({ directory: "src" }, {});
    expect(result.isError).toBeFalsy();
    const text = result.content[0]!.text;
    expect(text).toContain("src/index.ts");
  });

  it("rejects directory outside the repo", async () => {
    const result = await handler()({ directory: "../../.." }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });

  it("returns message when no files match", async () => {
    const result = await handler()({ pattern: "**/*.xyz" }, {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0]!.text).toContain("No files matched");
  });
});
