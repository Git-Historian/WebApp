import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { resolve } from "path";

// Force-load .env.local values that may be shadowed by empty system env vars
// (e.g. Claude for Desktop sets ANTHROPIC_API_KEY="" in the shell environment,
//  and Next.js dotenv won't override existing system env vars)
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    let value = trimmed.slice(eqIdx + 1);
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Only override if current env is empty/unset but .env.local has a value
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local may not exist in CI/production — that's fine
}

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
