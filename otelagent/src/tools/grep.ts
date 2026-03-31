import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { resolve, relative } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function createGrepTool(repoDir: string) {
  return tool(
    "grep",
    "Search file contents using a regular expression. Returns matching lines with file paths and line numbers. Uses grep under the hood.",
    {
      pattern: z.string().describe("Regular expression pattern to search for"),
      glob: z.string().optional().describe("File glob pattern to restrict search (e.g. '*.ts', '*.go')"),
      directory: z.string().optional().describe("Subdirectory to search within (relative to repo root)"),
      ignoreCase: z.boolean().optional().describe("Case-insensitive search (default: false)"),
      contextLines: z.number().optional().describe("Number of context lines to show before and after each match"),
    },
    async (args) => {
      const searchDir = args.directory ? resolve(repoDir, args.directory) : repoDir;
      const rel = relative(repoDir, searchDir);
      if (rel.startsWith("..")) {
        return {
          content: [{ type: "text" as const, text: "Error: directory is outside the repository" }],
          isError: true,
        };
      }

      try {
        const grepArgs = ["-r", "-n", "--include", args.glob ?? "*"];
        if (args.ignoreCase) grepArgs.push("-i");
        if (args.contextLines !== undefined) grepArgs.push("-C", String(args.contextLines));
        grepArgs.push(args.pattern, searchDir);

        const { stdout } = await execFileAsync("grep", grepArgs, {
          maxBuffer: 1024 * 1024,
          timeout: 30_000,
        }).catch((err) => {
          if (err.code === 1) return { stdout: "", stderr: "" };
          throw err;
        });

        if (!stdout.trim()) {
          return {
            content: [{ type: "text" as const, text: "No matches found." }],
          };
        }

        // Convert absolute paths to relative
        const output = stdout.replace(new RegExp(repoDir + "/", "g"), "");
        const lines = output.split("\n");
        const truncated = lines.length > 200;
        const result = truncated ? lines.slice(0, 200).join("\n") + "\n... truncated" : output;

        return {
          content: [{ type: "text" as const, text: result }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error searching: ${msg}` }],
          isError: true,
        };
      }
    },
    { annotations: { readOnlyHint: true } }
  );
}
