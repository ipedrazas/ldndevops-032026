#!/usr/bin/env node

import { Command } from "commander";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { runAgent, type AgentMode } from "../agent/index.js";
import { loadConfig, validateServerConfig } from "../config/index.js";
import { startServer } from "../server/index.js";

const program = new Command();

program
  .name("otelagent")
  .description("AI agent that analyses and instruments application observability")
  .version("0.1.0");

// Subcommand: analyze (CLI mode)
program
  .command("analyze")
  .description("Analyse a local repository")
  .requiredOption("--repo <path>", "Path to the repository to analyse")
  .option("--mode <mode>", "Analysis mode: report, prompt, or fix", "report")
  .option("--model <model>", "Claude model to use (overrides ANTHROPIC_MODEL)")
  .option("--max-turns <n>", "Maximum number of agent turns (overrides MAX_TURNS)", parseInt)
  .option("--max-budget <usd>", "Maximum budget in USD (overrides MAX_COST)", parseFloat)
  .option("--output <path>", "Write output to a file instead of stdout")
  .action(async (opts) => {
    const mode = opts.mode as AgentMode;
    if (!["report", "prompt", "fix"].includes(mode)) {
      console.error(`Invalid mode: ${mode}. Must be one of: report, prompt, fix`);
      process.exit(1);
    }

    let config;
    try {
      config = loadConfig();
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }

    const repoDir = resolve(opts.repo);

    try {
      const result = await runAgent({
        repoDir,
        mode,
        model: opts.model ?? config.model,
        maxTurns: opts.maxTurns ?? config.maxTurns,
        maxBudgetUsd: opts.maxBudget ?? config.maxBudgetUsd,
        maxToolCalls: config.maxToolCalls,
      });

      if (opts.output) {
        const outPath = resolve(opts.output);
        await writeFile(outPath, result.output, "utf-8");
        console.error(`Output written to: ${outPath}`);
      } else {
        console.log(result.output);
      }

      console.error(
        `\n--- Agent stats: ${result.numTurns} turns | $${result.costUsd.toFixed(4)} | ${(result.durationMs / 1000).toFixed(1)}s ---`
      );
    } catch (err) {
      console.error("Agent failed:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// Subcommand: serve (webhook server mode)
program
  .command("serve")
  .description("Start the webhook server for GitHub PR comment triggers")
  .option("--port <port>", "Port to listen on (overrides PORT)", parseInt)
  .option("--model <model>", "Claude model to use (overrides ANTHROPIC_MODEL)")
  .option("--max-turns <n>", "Maximum number of agent turns (overrides MAX_TURNS)", parseInt)
  .option("--max-budget <usd>", "Maximum budget in USD (overrides MAX_COST)", parseFloat)
  .action((opts) => {
    let config;
    try {
      config = loadConfig();
      validateServerConfig(config);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }

    startServer({
      ...config,
      port: opts.port ?? config.port,
      model: opts.model ?? config.model,
      maxTurns: opts.maxTurns ?? config.maxTurns,
      maxBudgetUsd: opts.maxBudget ?? config.maxBudgetUsd,
    });
  });

program.parse();
