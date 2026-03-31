import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { resolve, relative } from "node:path";
import { glob } from "node:fs/promises";

export function createListFilesTool(repoDir: string) {
  return tool(
    "list_files",
    "List files in the repository matching a glob pattern. Returns relative file paths sorted alphabetically. Useful for discovering project structure, finding config files, or locating source files by extension.",
    {
      pattern: z.string().optional().describe("Glob pattern to match (e.g. '**/*.ts', 'src/**/*.json'). Defaults to '**/*'"),
      directory: z.string().optional().describe("Subdirectory to search within (relative to repo root)"),
    },
    async (args) => {
      const baseDir = args.directory ? resolve(repoDir, args.directory) : repoDir;
      const rel = relative(repoDir, baseDir);
      if (rel.startsWith("..")) {
        return {
          content: [{ type: "text" as const, text: "Error: directory is outside the repository" }],
          isError: true,
        };
      }

      try {
        const pattern = args.pattern ?? "**/*";
        const matches: string[] = [];

        for await (const entry of glob(pattern, { cwd: baseDir })) {
          matches.push(args.directory ? `${args.directory}/${entry}` : String(entry));
        }

        matches.sort();

        if (matches.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No files matched the pattern." }],
          };
        }

        const truncated = matches.length > 500;
        const output = truncated ? matches.slice(0, 500) : matches;
        const suffix = truncated ? `\n... and ${matches.length - 500} more files` : "";

        return {
          content: [{ type: "text" as const, text: output.join("\n") + suffix }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error listing files: ${msg}` }],
          isError: true,
        };
      }
    },
    { annotations: { readOnlyHint: true } }
  );
}
