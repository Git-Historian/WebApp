import simpleGit, { SimpleGit } from "simple-git";
import { randomUUID } from "crypto";
import { rm } from "fs/promises";
import { RawCommit, FileChange } from "./types";

const MAX_COMMITS = 200;

export async function cloneRepo(url: string): Promise<string> {
  const cloneStart = Date.now();
  const repoPath = `/tmp/gh-${randomUUID()}`;
  const git = simpleGit({ timeout: { block: 30_000 } });
  await git.clone(url, repoPath, ["--bare"]);
  console.log(`[extract] Clone completed in ${Date.now() - cloneStart}ms`);
  return repoPath;
}

export async function extractCommits(
  repoPath: string
): Promise<RawCommit[]> {
  const extractStart = Date.now();
  const git: SimpleGit = simpleGit(repoPath);

  // Single git log --numstat call to get commits + diff stats in one pass
  const separator = "---GH_RECORD---";
  const fieldSep = "---GH_FIELD---";
  const format = [
    "%H", // hash
    "%an", // author name
    "%ae", // author email
    "%aI", // author date ISO
    "%s", // subject
  ].join(fieldSep);

  const raw = await git.raw([
    "log",
    "--all",
    "-n",
    String(MAX_COMMITS),
    "--numstat",
    `--pretty=format:${separator}${fieldSep}${format}`,
  ]);

  if (!raw || !raw.trim()) {
    return [];
  }

  // Split by record separator — first element before the first separator is empty
  const blocks = raw.split(separator).filter((b) => b.trim());

  const commits: RawCommit[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    // First line contains the field separator + commit fields
    const headerLine = lines[0];
    const headerPart = headerLine.startsWith(fieldSep)
      ? headerLine.slice(fieldSep.length)
      : headerLine;
    const fields = headerPart.split(fieldSep);
    if (fields.length < 5) continue;

    const [hash, author, email, date, message] = fields;

    // Remaining non-empty lines are numstat: "insertions\tdeletions\tfilepath"
    const files: FileChange[] = [];
    let totalInsertions = 0;
    let totalDeletions = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split("\t");
      if (parts.length < 3) continue;

      const [ins, del, filePath] = parts;
      const insertions = ins === "-" ? 0 : parseInt(ins, 10) || 0;
      const deletions = del === "-" ? 0 : parseInt(del, 10) || 0;

      let status: FileChange["status"] = "modified";
      if (insertions > 0 && deletions === 0) status = "added";
      else if (deletions > 0 && insertions === 0) status = "deleted";

      files.push({ path: filePath, status, insertions, deletions });
      totalInsertions += insertions;
      totalDeletions += deletions;
    }

    commits.push({
      hash,
      author,
      email,
      date,
      message,
      files,
      insertions: totalInsertions,
      deletions: totalDeletions,
    });
  }

  console.log(`[extract] Extracted ${commits.length} commits in ${Date.now() - extractStart}ms`);
  return commits;
}

export async function cleanup(repoPath: string): Promise<void> {
  await rm(repoPath, { recursive: true, force: true });
}
