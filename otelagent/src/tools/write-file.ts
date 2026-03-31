import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";

export function createWriteFileTool(repoDir: string) {
  return tool(
    "write_file",
    "Create or overwrite a file in the repository. Parent directories are created automatically. Use this for FIX mode to add new files or fully replace existing ones.",
    {
      path: z.string().describe("Relative path to the file within the repository"),
      content: z.string().describe("Full content to write to the file"),
    },
    async (args) => {
      const absPath = resolve(repoDir, args.path);
      const rel = relative(repoDir, absPath);
      if (rel.startsWith("..")) {
        return {
          content: [{ type: "text" as const, text: "Error: path is outside the repository directory" }],
          isError: true,
        };
      }

      try {
        await mkdir(dirname(absPath), { recursive: true });
        await writeFile(absPath, args.content, "utf-8");
        return {
          content: [{ type: "text" as const, text: `File written: ${args.path}` }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error writing file: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
