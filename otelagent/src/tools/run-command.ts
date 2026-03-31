import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { exec } from "node:child_process";
import { resolve, relative } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export function createRunCommandTool(repoDir: string) {
  return tool(
    "run_command",
    "Execute a shell command within the repository directory. Returns stdout, stderr, and exit code. Commands are run with a 60-second timeout. Use for inspecting package manifests, checking dependency versions, or running lightweight analysis commands.",
    {
      command: z.string().describe("Shell command to execute"),
      directory: z.string().optional().describe("Subdirectory to run the command in (relative to repo root)"),
    },
    async (args) => {
      const cwd = args.directory ? resolve(repoDir, args.directory) : repoDir;
      const rel = relative(repoDir, cwd);
      if (rel.startsWith("..")) {
        return {
          content: [{ type: "text" as const, text: "Error: directory is outside the repository" }],
          isError: true,
        };
      }

      try {
        const { stdout, stderr } = await execAsync(args.command, {
          cwd,
          timeout: 60_000,
          maxBuffer: 1024 * 1024,
        });

        const parts: string[] = [];
        if (stdout.trim()) parts.push(`stdout:\n${stdout.trim()}`);
        if (stderr.trim()) parts.push(`stderr:\n${stderr.trim()}`);
        if (parts.length === 0) parts.push("(no output)");
        parts.push("exit code: 0");

        return {
          content: [{ type: "text" as const, text: parts.join("\n\n") }],
        };
      } catch (err: unknown) {
        const execErr = err as { stdout?: string; stderr?: string; code?: number; message?: string };
        const parts: string[] = [];
        if (execErr.stdout?.trim()) parts.push(`stdout:\n${execErr.stdout.trim()}`);
        if (execErr.stderr?.trim()) parts.push(`stderr:\n${execErr.stderr.trim()}`);
        parts.push(`exit code: ${execErr.code ?? "unknown"}`);

        return {
          content: [{ type: "text" as const, text: parts.join("\n\n") }],
          isError: true,
        };
      }
    }
  );
}
