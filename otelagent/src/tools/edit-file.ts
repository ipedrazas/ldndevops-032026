import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

export function createEditFileTool(repoDir: string) {
  return tool(
    "edit_file",
    "Apply a targeted string replacement in a file. Finds the exact `old_string` and replaces it with `new_string`. The old_string must appear exactly once in the file (unless replace_all is true). Use this for FIX mode to make surgical edits to existing files.",
    {
      path: z.string().describe("Relative path to the file within the repository"),
      old_string: z.string().describe("Exact string to find in the file"),
      new_string: z.string().describe("String to replace it with"),
      replace_all: z.boolean().optional().describe("Replace all occurrences (default: false)"),
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
        const content = await readFile(absPath, "utf-8");

        if (!content.includes(args.old_string)) {
          return {
            content: [{ type: "text" as const, text: "Error: old_string not found in file" }],
            isError: true,
          };
        }

        if (!args.replace_all) {
          const count = content.split(args.old_string).length - 1;
          if (count > 1) {
            return {
              content: [{
                type: "text" as const,
                text: `Error: old_string found ${count} times. Use replace_all: true to replace all, or provide a more specific string.`,
              }],
              isError: true,
            };
          }
        }

        const updated = args.replace_all
          ? content.replaceAll(args.old_string, args.new_string)
          : content.replace(args.old_string, args.new_string);

        await writeFile(absPath, updated, "utf-8");

        return {
          content: [{ type: "text" as const, text: `File edited: ${args.path}` }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error editing file: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
