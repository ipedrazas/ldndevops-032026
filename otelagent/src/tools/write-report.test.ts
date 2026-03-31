import { describe, it, expect } from "vitest";
import { createWriteReportTool, type ReportCapture } from "./write-report.js";

describe("write_report", () => {
  it("captures the report content", async () => {
    const capture: ReportCapture = { content: "" };
    const tool = createWriteReportTool(capture);

    const result = await tool.handler({ content: "# My Report\nFindings here." }, {});

    expect(result.isError).toBeFalsy();
    expect(capture.content).toBe("# My Report\nFindings here.");
  });

  it("overwrites previous capture on second call", async () => {
    const capture: ReportCapture = { content: "old" };
    const tool = createWriteReportTool(capture);

    await tool.handler({ content: "new report" }, {});

    expect(capture.content).toBe("new report");
  });
});
