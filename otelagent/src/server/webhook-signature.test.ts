import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifySignature } from "./webhook-signature.js";

const SECRET = "test-secret";

function sign(payload: string): string {
  return "sha256=" + createHmac("sha256", SECRET).update(payload, "utf-8").digest("hex");
}

describe("verifySignature", () => {
  it("accepts a valid signature", () => {
    const payload = '{"action":"created"}';
    expect(verifySignature(payload, sign(payload), SECRET)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const payload = '{"action":"created"}';
    expect(verifySignature(payload, "sha256=invalid", SECRET)).toBe(false);
  });

  it("rejects a null signature", () => {
    expect(verifySignature("payload", null, SECRET)).toBe(false);
  });

  it("rejects when payload was tampered", () => {
    const original = '{"action":"created"}';
    const tampered = '{"action":"deleted"}';
    expect(verifySignature(tampered, sign(original), SECRET)).toBe(false);
  });

  it("rejects wrong secret", () => {
    const payload = '{"action":"created"}';
    expect(verifySignature(payload, sign(payload), "wrong-secret")).toBe(false);
  });
});
