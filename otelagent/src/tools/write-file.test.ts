import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWriteFileTool } from "./write-file.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "otelagent-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function handler() {
  return createWriteFileTool(tempDir).handler;
}

describe("write_file", () => {
  it("creates a new file", async () => {
    const result = await handler()({ path: "hello.txt", content: "world" }, {});
    expect(result.isError).toBeFalsy();
    const content = await readFile(join(tempDir, "hello.txt"), "utf-8");
    expect(content).toBe("world");
  });

  it("creates nested directories", async () => {
    const result = await handler()({ path: "a/b/c.txt", content: "deep" }, {});
    expect(result.isError).toBeFalsy();
    const content = await readFile(join(tempDir, "a/b/c.txt"), "utf-8");
    expect(content).toBe("deep");
  });

  it("overwrites an existing file", async () => {
    await handler()({ path: "file.txt", content: "v1" }, {});
    await handler()({ path: "file.txt", content: "v2" }, {});
    const content = await readFile(join(tempDir, "file.txt"), "utf-8");
    expect(content).toBe("v2");
  });

  it("rejects paths outside the repo", async () => {
    const result = await handler()({ path: "../../etc/evil", content: "nope" }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });
});
