import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { createRunCommandTool } from "./run-command.js";

const FIXTURES = resolve(import.meta.dirname, "../__fixtures__/sample-repo");

function handler(repoDir: string = FIXTURES) {
  return createRunCommandTool(repoDir).handler;
}

describe("run_command", () => {
  it("executes a command and returns stdout", async () => {
    const result = await handler()({ command: "echo hello" }, {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0]!.text).toContain("hello");
    expect(result.content[0]!.text).toContain("exit code: 0");
  });

  it("returns stderr and non-zero exit code on failure", async () => {
    const result = await handler()({ command: "ls /nonexistent_path_xyz" }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("exit code:");
  });

  it("runs in the correct directory", async () => {
    const result = await handler()({ command: "cat package.json" }, {});
    expect(result.isError).toBeFalsy();
    expect(result.content[0]!.text).toContain("sample-app");
  });

  it("rejects directory outside the repo", async () => {
    const result = await handler()({ command: "pwd", directory: "../../.." }, {});
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("outside");
  });
});
