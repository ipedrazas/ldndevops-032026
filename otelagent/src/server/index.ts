import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { isRepoAllowed } from "../config/allowlist.js";
import type { Config } from "../config/index.js";
import { verifySignature } from "./webhook-signature.js";
import { parseCommand, parseWebhookPayload, type IssueCommentPayload } from "./webhook-parser.js";
import { GitHubClient } from "./github.js";
import { handleAnalyzeCommand } from "./handler.js";

export function startServer(config: Config) {
  const github = new GitHubClient(config.githubToken!);

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (req.method === "POST" && req.url === "/webhook") {
      await handleWebhook(req, res, { github, config });
      return;
    }

    res.writeHead(404);
    res.end("Not Found");
  });

  server.listen(config.port, () => {
    console.log(`OtelAgent server listening on port ${config.port}`);
  });

  return server;
}

async function handleWebhook(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: { github: GitHubClient; config: Config }
) {
  const body = await readBody(req);

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!verifySignature(body, signature ?? null, ctx.config.webhookSecret!)) {
    res.writeHead(401);
    res.end("Invalid signature");
    return;
  }

  const event = req.headers["x-github-event"];
  if (event !== "issue_comment") {
    res.writeHead(200);
    res.end("Ignored event");
    return;
  }

  let payload: IssueCommentPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    res.writeHead(400);
    res.end("Invalid JSON");
    return;
  }

  const parsed = parseWebhookPayload(payload);
  if (!parsed) {
    res.writeHead(200);
    res.end("Not an actionable event");
    return;
  }

  const mode = parseCommand(payload.comment.body);
  if (!mode) {
    res.writeHead(200);
    res.end("No command found");
    return;
  }

  if (!isRepoAllowed(parsed.repoFullName, ctx.config.allowedRepos)) {
    ctx.github.postComment(
      parsed.repoFullName,
      parsed.prNumber,
      `⛔ Repository \`${parsed.repoFullName}\` is not in the allowed list.`
    ).catch(() => {});
    res.writeHead(200);
    res.end("Repo not allowed");
    return;
  }

  // Respond immediately, process asynchronously
  res.writeHead(202);
  res.end("Accepted");

  const pr = await ctx.github.getPullRequest(parsed.repoFullName, parsed.prNumber);

  handleAnalyzeCommand(
    {
      ...parsed,
      mode,
      headRef: pr.head.ref,
      headSha: pr.head.sha,
    },
    ctx.github,
    {
      model: ctx.config.model,
      maxTurns: ctx.config.maxTurns,
      maxBudgetUsd: ctx.config.maxBudgetUsd,
      maxToolCalls: ctx.config.maxToolCalls,
    }
  ).catch((err) => {
    console.error(`Error processing PR #${parsed.prNumber}:`, err);
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
