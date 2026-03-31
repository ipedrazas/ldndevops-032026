import type { AgentMode } from "../agent/index.js";

export interface WebhookCommand {
  mode: AgentMode;
  repoFullName: string;
  repoCloneUrl: string;
  prNumber: number;
  headRef: string;
  headSha: string;
  commentId: number;
  commentUser: string;
}

export interface IssueCommentPayload {
  action: string;
  comment: {
    id: number;
    body: string;
    user: { login: string };
  };
  issue: {
    number: number;
    pull_request?: { url: string };
  };
  repository: {
    full_name: string;
    clone_url: string;
  };
}

const COMMAND_REGEX = /^\/analyze\s+(report|prompt|fix)\s*$/im;

export function parseCommand(commentBody: string): AgentMode | null {
  const match = commentBody.match(COMMAND_REGEX);
  if (!match) return null;
  return match[1]!.toLowerCase() as AgentMode;
}

export function parseWebhookPayload(
  payload: IssueCommentPayload
): Omit<WebhookCommand, "mode" | "headRef" | "headSha"> | null {
  if (payload.action !== "created") return null;
  if (!payload.issue.pull_request) return null;

  return {
    repoFullName: payload.repository.full_name,
    repoCloneUrl: payload.repository.clone_url,
    prNumber: payload.issue.number,
    commentId: payload.comment.id,
    commentUser: payload.comment.user.login,
  };
}
