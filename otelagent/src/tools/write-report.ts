import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";

export type ReportCapture = { content: string };

export function createWriteReportTool(capture: ReportCapture) {
  return tool(
    "write_report",
    "Emit the final analysis output. Call this exactly once when you have completed your analysis. The content should be the full Markdown report (REPORT mode), the coding-agent prompt (PROMPT mode), or a summary of all changes made (FIX mode).",
    {
      content: z.string().describe("The final output content (Markdown)"),
    },
    async (args) => {
      capture.content = args.content;
      return {
        content: [{ type: "text" as const, text: "Report captured successfully." }],
      };
    }
  );
}
