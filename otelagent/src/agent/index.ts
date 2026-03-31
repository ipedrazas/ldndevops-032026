import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createToolServer } from "../tools/index.js";
import type { ReportCapture } from "../tools/write-report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT_PATH = resolve(__dirname, "../../docs/system-prompt.md");

export type AgentMode = "report" | "prompt" | "fix";

export interface AgentRunOptions {
  repoDir: string;
  mode: AgentMode;
  model?: string;
  maxTurns?: number;
  maxBudgetUsd?: number;
  maxToolCalls?: number;
}

export interface AgentResult {
  output: string;
  costUsd: number;
  numTurns: number;
  durationMs: number;
}

export async function runAgent(options: AgentRunOptions): Promise<AgentResult> {
  const systemPrompt = await readFile(SYSTEM_PROMPT_PATH, "utf-8");
  const reportCapture: ReportCapture = { content: "" };
  const toolServer = createToolServer(options.repoDir, reportCapture);

  const userMessage = buildUserMessage(options);

  let toolCallCount = 0;
  const maxToolCalls = options.maxToolCalls ?? Infinity;
  const abortController = new AbortController();

  const stream = query({
    prompt: userMessage,
    options: {
      systemPrompt,
      model: options.model,
      maxTurns: options.maxTurns,
      maxBudgetUsd: options.maxBudgetUsd,
      mcpServers: { otelagent: toolServer },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      tools: [],
      persistSession: false,
      abortController,
      canUseTool: async () => {
        toolCallCount++;
        if (toolCallCount > maxToolCalls) {
          reportCapture.content =
            reportCapture.content ||
            `Agent halted: exceeded maximum tool call limit (${maxToolCalls}).`;
          abortController.abort();
          return { behavior: "deny" as const, message: "Tool call limit exceeded" };
        }
        return { behavior: "allow" as const };
      },
    },
  });

  let resultOutput = "";
  let costUsd = 0;
  let numTurns = 0;
  let durationMs = 0;

  try {
    for await (const message of stream) {
      if (message.type === "result") {
        costUsd = message.total_cost_usd;
        numTurns = message.num_turns;
        durationMs = message.duration_ms;

        if (message.subtype === "success") {
          resultOutput = reportCapture.content || message.result;
        } else {
          resultOutput =
            reportCapture.content ||
            `Agent error (${message.subtype}): ${message.errors?.join("; ") ?? "unknown"}`;
        }
      }
    }
  } catch (err) {
    // If aborted due to tool call limit, use captured output
    if (abortController.signal.aborted && reportCapture.content) {
      resultOutput = reportCapture.content;
    } else {
      throw err;
    }
  }

  return { output: resultOutput, costUsd, numTurns, durationMs };
}

function buildUserMessage(options: AgentRunOptions): string {
  const modeUpper = options.mode.toUpperCase();
  return [
    `Analyse the repository at: ${options.repoDir}`,
    `Mode: ${modeUpper}`,
    ``,
    `Please perform a full observability analysis of this codebase and produce the ${modeUpper} output as described in your instructions.`,
    `When you are done, call the write_report tool with your final output.`,
  ].join("\n");
}
