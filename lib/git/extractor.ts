import { RawCommit, FileChange } from "./types";

const MAX_COMMITS = 200;
const PER_PAGE = 100; // GitHub API max per page

/**
 * Parse a GitHub URL into owner/repo.
 * Supports multiple formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - git@github.com:owner/repo.git  (SSH)
 *   - github.com/owner/repo
 *   - owner/repo  (shorthand)
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const trimmed = url.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // SSH format: git@github.com:owner/repo
  const sshMatch = trimmed.match(/git@github\.com:([^/]+)\/(.+)/);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };

  // HTTPS format: https://github.com/owner/repo (with optional www)
  const httpsMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2] };

  // Shorthand: owner/repo
  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  throw new Error(
    "Could not parse GitHub URL. Use a format like https://github.com/owner/repo"
  );
}

/**
 * Build common headers for GitHub API requests.
 * Uses GITHUB_TOKEN if available (5,000 req/hr vs 60 unauthenticated).
 */
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "git-historian",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch commits from the GitHub REST API.
 * No git binary required — works on Vercel serverless.
 */
export async function extractCommits(url: string): Promise<RawCommit[]> {
  const extractStart = Date.now();
  const { owner, repo } = parseGitHubUrl(url);

  // Fetch commits in pages (GitHub API returns max 100 per page)
  const pages = Math.ceil(MAX_COMMITS / PER_PAGE);
  const allCommits: RawCommit[] = [];

  for (let page = 1; page <= pages; page++) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${PER_PAGE}&page=${page}`;
    const res = await fetch(apiUrl, {
      headers: githubHeaders(),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          "Repository not found. Make sure the URL is correct and the repository is public."
        );
      }
      if (res.status === 403 || res.status === 429) {
        const resetHeader = res.headers.get("x-ratelimit-reset");
        const resetMin = resetHeader
          ? Math.max(1, Math.ceil((Number(resetHeader) * 1000 - Date.now()) / 60000))
          : null;
        const waitMsg = resetMin ? ` Resets in ~${resetMin} minute${resetMin === 1 ? "" : "s"}.` : "";
        throw new Error(
          `GitHub API rate limit reached. Too many repos analyzed recently.${waitMsg} Try again shortly.`
        );
      }
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) break;

    for (const c of commits) {
      allCommits.push({
        hash: c.sha,
        author: c.commit?.author?.name ?? "Unknown",
        email: c.commit?.author?.email ?? "",
        date: c.commit?.author?.date ?? "",
        message: c.commit?.message?.split("\n")[0] ?? "",
        files: [],
        insertions: 0,
        deletions: 0,
      });
    }

    // Stop if we got fewer than a full page (no more commits)
    if (commits.length < PER_PAGE) break;
    if (allCommits.length >= MAX_COMMITS) break;
  }

  // Fetch diff stats for each commit (in parallel, batched)
  // Stop early if we hit a rate limit — partial stats are better than failing entirely
  const BATCH_SIZE = 10;
  let rateLimitHit = false;
  for (let i = 0; i < allCommits.length && !rateLimitHit; i += BATCH_SIZE) {
    const batch = allCommits.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (commit) => {
        if (rateLimitHit) return;
        try {
          const detailUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit.hash}`;
          const detailRes = await fetch(detailUrl, {
            headers: githubHeaders(),
            signal: AbortSignal.timeout(15_000),
          });

          if (detailRes.status === 403 || detailRes.status === 429) {
            rateLimitHit = true;
            console.warn(`[extract] Rate limit hit during commit detail fetch, continuing with partial stats`);
            return;
          }
          if (!detailRes.ok) return; // Skip stats on failure

          const detail = await detailRes.json();
          if (detail.files && Array.isArray(detail.files)) {
            const files: FileChange[] = [];
            let totalInsertions = 0;
            let totalDeletions = 0;

            for (const f of detail.files) {
              const insertions = f.additions ?? 0;
              const deletions = f.deletions ?? 0;
              let status: FileChange["status"] = "modified";
              if (f.status === "added") status = "added";
              else if (f.status === "removed") status = "deleted";
              else if (f.status === "renamed") status = "renamed";

              files.push({
                path: f.filename,
                status,
                insertions,
                deletions,
              });
              totalInsertions += insertions;
              totalDeletions += deletions;
            }

            commit.files = files;
            commit.insertions = totalInsertions;
            commit.deletions = totalDeletions;
          }
        } catch {
          // Silently skip stats for this commit
        }
      })
    );
  }

  console.log(
    `[extract] Fetched ${allCommits.length} commits via GitHub API in ${Date.now() - extractStart}ms`
  );
  return allCommits.slice(0, MAX_COMMITS);
}

/**
 * No-op cleanup — no temp files when using GitHub API.
 */
export async function cleanup(_repoPath: string): Promise<void> {
  // Nothing to clean up when using GitHub API
}

/**
 * @deprecated No longer needed — extractCommits fetches directly from GitHub API.
 */
export async function cloneRepo(url: string): Promise<string> {
  return url; // Return URL as the "repo path" — extractCommits uses it directly
}
