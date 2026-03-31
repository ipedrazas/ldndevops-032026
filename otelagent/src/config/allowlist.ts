/**
 * Parses ALLOWED_REPOS env var (comma-separated glob patterns) and checks
 * whether a given "owner/repo" string matches at least one pattern.
 *
 * Supported patterns:
 *   myorg/*            — any repo under myorg
 *   myorg/prefix-*     — repos starting with prefix- under myorg
 *   myorg/exact-repo   — exact match
 */

export function parseAllowlist(envValue: string | undefined): string[] {
  if (!envValue || !envValue.trim()) return [];
  return envValue
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function isRepoAllowed(repoFullName: string, patterns: string[]): boolean {
  if (patterns.length === 0) return true; // no allowlist = allow all
  return patterns.some((pattern) => matchGlob(repoFullName, pattern));
}

function matchGlob(value: string, pattern: string): boolean {
  // Escape regex special chars except *
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  // Convert * to regex .*
  const regex = new RegExp("^" + escaped.replace(/\*/g, ".*") + "$");
  return regex.test(value);
}
