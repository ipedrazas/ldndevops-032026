import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { createCloneRepoTool } from "./clone-repo.js";
import { createReadFileTool } from "./read-file.js";
import { createListFilesTool } from "./list-files.js";
import { createGrepTool } from "./grep.js";
import { createRunCommandTool } from "./run-command.js";
import { createWriteFileTool } from "./write-file.js";
import { createEditFileTool } from "./edit-file.js";
import { createWriteReportTool, type ReportCapture } from "./write-report.js";

export function createToolServer(repoDir: string, reportCapture: ReportCapture) {
  const tools = [
    createCloneRepoTool(),
    createReadFileTool(repoDir),
    createListFilesTool(repoDir),
    createGrepTool(repoDir),
    createRunCommandTool(repoDir),
    createWriteFileTool(repoDir),
    createEditFileTool(repoDir),
    createWriteReportTool(reportCapture),
  ];

  return createSdkMcpServer({
    name: "otelagent",
    version: "0.1.0",
    tools,
  });
}
