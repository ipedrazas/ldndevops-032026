import { describe, it, expect } from "vitest";
import { parseAllowlist, isRepoAllowed } from "./allowlist.js";

describe("parseAllowlist", () => {
  it("parses comma-separated patterns", () => {
    expect(parseAllowlist("myorg/*,other/repo")).toEqual(["myorg/*", "other/repo"]);
  });

  it("trims whitespace", () => {
    expect(parseAllowlist(" myorg/* , other/repo ")).toEqual(["myorg/*", "other/repo"]);
  });

  it("returns empty array for undefined", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseAllowlist("")).toEqual([]);
  });

  it("filters out blank entries", () => {
    expect(parseAllowlist("myorg/*,,other/repo")).toEqual(["myorg/*", "other/repo"]);
  });
});

describe("isRepoAllowed", () => {
  it("allows everything when allowlist is empty", () => {
    expect(isRepoAllowed("any/repo", [])).toBe(true);
  });

  it("matches exact repo name", () => {
    expect(isRepoAllowed("myorg/myrepo", ["myorg/myrepo"])).toBe(true);
    expect(isRepoAllowed("myorg/other", ["myorg/myrepo"])).toBe(false);
  });

  it("matches wildcard org pattern", () => {
    expect(isRepoAllowed("myorg/anything", ["myorg/*"])).toBe(true);
    expect(isRepoAllowed("otherorg/anything", ["myorg/*"])).toBe(false);
  });

  it("matches prefix wildcard", () => {
    expect(isRepoAllowed("myorg/pulse-api", ["myorg/pulse-*"])).toBe(true);
    expect(isRepoAllowed("myorg/core-api", ["myorg/pulse-*"])).toBe(false);
  });

  it("matches against multiple patterns", () => {
    const patterns = ["myorg/*", "other/specific-repo"];
    expect(isRepoAllowed("myorg/anything", patterns)).toBe(true);
    expect(isRepoAllowed("other/specific-repo", patterns)).toBe(true);
    expect(isRepoAllowed("other/different", patterns)).toBe(false);
  });
});
