import { RobotsPolicyViolationError } from "../persistence/schema";

export interface RobotsRuleSet {
  userAgent: string;
  disallows: string[];
  allows: string[];
}

/**
 * Parses a standard robots.txt file string into structured user-agent rules.
 */
export function parseRobotsTxt(content: string, targetUserAgent = "WearIDBot"): RobotsRuleSet {
  const lines = content.split("\n").map((l) => l.trim());
  const disallows: string[] = [];
  const allows: string[] = [];

  let appliesToUs = false;

  for (const line of lines) {
    if (line.startsWith("#") || line === "") continue;

    const [directive, ...rest] = line.split(":");
    if (!directive || rest.length === 0) continue;

    const key = directive.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      const ua = value.toLowerCase();
      appliesToUs = ua === "*" || ua === targetUserAgent.toLowerCase();
    } else if (appliesToUs) {
      if (key === "disallow" && value !== "") {
        disallows.push(value);
      } else if (key === "allow" && value !== "") {
        allows.push(value);
      }
    }
  }

  return {
    userAgent: targetUserAgent,
    disallows,
    allows,
  };
}

/**
 * Evaluates whether an endpoint URL is permitted under domain robots.txt directives.
 */
export function isPathAllowed(urlStr: string, robotsTxtContent: string, targetUserAgent = "WearIDBot"): boolean {
  try {
    const parsedUrl = new URL(urlStr);
    const pathname = parsedUrl.pathname;

    const rules = parseRobotsTxt(robotsTxtContent, targetUserAgent);

    // Explicit Allow overrides general Disallow
    for (const allow of rules.allows) {
      if (pathname.startsWith(allow)) return true;
    }

    // Check Disallows
    for (const disallow of rules.disallows) {
      if (disallow === "/" || pathname.startsWith(disallow)) {
        return false;
      }
    }

    return true;
  } catch {
    // If URL is invalid, fail closed
    return false;
  }
}

/**
 * High-governance crawler execution wrapper.
 * Invariant 6 & TC-SEC-003: Aborts immediately with RobotsPolicyViolationError
 * when encountering a Disallow rule. Never bypasses website access boundaries.
 */
export async function executePoliteCrawl<T>(
  targetUrl: string,
  robotsTxtContent: string,
  fetcher: (url: string) => Promise<T>
): Promise<T> {
  const allowed = isPathAllowed(targetUrl, robotsTxtContent);

  if (!allowed) {
    throw new RobotsPolicyViolationError(
      `Robots policy violation: Crawling '${targetUrl}' is prohibited by robots.txt rules. Aborting per AGENTS.md Invariant 6.`
    );
  }

  return await fetcher(targetUrl);
}
