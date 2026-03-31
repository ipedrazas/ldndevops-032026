import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function createCloneRepoTool() {
  return tool(
    "clone_repo",
    "Clone a git repository into a temporary directory. Returns the local path to the cloned repo. Use --depth 1 for faster cloning when full history is not needed.",
    {
      url: z.string().describe("Git clone URL (HTTPS or SSH)"),
      branch: z.string().optional().describe("Branch to clone (defaults to the repo's default branch)"),
      shallow: z.boolean().optional().describe("If true, clone with --depth 1 for faster cloning (default: true)"),
    },
    async (args) => {
      try {
        const tempDir = await mkdtemp(join(tmpdir(), "otelagent-"));

        const gitArgs = ["clone"];
        if (args.shallow !== false) {
          gitArgs.push("--depth", "1");
        }
        if (args.branch) {
          gitArgs.push("--branch", args.branch);
        }
        gitArgs.push(args.url, tempDir);

        await execFileAsync("git", gitArgs, { timeout: 120_000 });

        return {
          content: [{ type: "text" as const, text: `Repository cloned to: ${tempDir}` }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error cloning repository: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
