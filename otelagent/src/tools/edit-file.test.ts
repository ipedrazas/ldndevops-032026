import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createEditFileTool } from "./edit-file.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "otelagent-test-"));
  await writeFile(join(tempDir, "test.txt"), "hello world\nhello again\nfoo bar");
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function handler() {
  return createEditFileTool(tempDir).handler;
}

describe("edit_file", () => {
  it("replaces a unique string", async () => {
    const result = await handler()(
      { path: "test.txt", old_string: "foo bar", new_string: "baz qux" },
      {}
    );
    expect(result.isError).toBeFalsy();
    const content = await readFile(join(tempDir, "test.txt"), "utf-8");
    expect(content).toContain("baz qux");
    expect(content).not.toContain("foo bar");
  });

  it("errors when old_string appears multiple times without replace_all", async () => {
    const result = await handler()(
      { path: "test.txt", old_string: "hello", new_string: "hi" },
      {}
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("2 times");
  });

  it("replaces all with replace_all flag", async () => {
    const result = await handler()(
      { path: "test.txt", old_string: "hello", new_string: "hi", replace_all: true },
      {}
    );
    expect(result.isError).toBeFalsy();
    const content = await readFile(join(tempDir, "test.txt"), "utf-8");
    expect(content).not.toContain("hello");
    expect(content.match(/hi/g)?.length).toBe(2);
  });

  it("errors when old_string not found", async () => {
    const result = await handler()(
      { path: "test.txt", old_string: "nonexistent", new_string: "x" },
      {}
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("not found");
  });

  it("rejects paths outside the repo", async () => {
    const result = await handler()(
      { path: "../../etc/passwd", old_string: "root", new_string: "x" },
      {}
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });
});
