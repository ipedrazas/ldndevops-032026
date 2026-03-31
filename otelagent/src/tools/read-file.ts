import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

export function createReadFileTool(repoDir: string) {
  return tool(
    "read_file",
    "Read the contents of a file in the repository. Returns the file content as text. Use offset and limit for large files.",
    {
      path: z.string().describe("Relative path to the file within the repository"),
      offset: z.number().optional().describe("Line number to start reading from (0-based)"),
      limit: z.number().optional().describe("Maximum number of lines to read"),
    },
    async (args) => {
      const absPath = resolve(repoDir, args.path);
      const rel = relative(repoDir, absPath);
      if (rel.startsWith("..") || resolve(absPath) === resolve(repoDir)) {
        return {
          content: [{ type: "text" as const, text: "Error: path is outside the repository directory" }],
          isError: true,
        };
      }

      try {
        const raw = await readFile(absPath, "utf-8");
        let lines = raw.split("\n");

        if (args.offset !== undefined) {
          lines = lines.slice(args.offset);
        }
        if (args.limit !== undefined) {
          lines = lines.slice(0, args.limit);
        }

        const numbered = lines.map((line, i) => {
          const lineNum = (args.offset ?? 0) + i + 1;
          return `${lineNum}\t${line}`;
        });

        return {
          content: [{ type: "text" as const, text: numbered.join("\n") }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error reading file: ${msg}` }],
          isError: true,
        };
      }
    },
    { annotations: { readOnlyHint: true } }
  );
}
