import simpleGit, { SimpleGit } from "simple-git";
import { randomUUID } from "crypto";
import { rm } from "fs/promises";
import { RawCommit, FileChange } from "./types";

export async function cloneRepo(url: string): Promise<string> {
  const repoPath = `/tmp/gh-${randomUUID()}`;
  const git = simpleGit();
  await git.clone(url, repoPath, ["--filter=blob:none", "--no-checkout"]);
  const repoGit = simpleGit(repoPath);
  await repoGit.checkout();
  return repoPath;
}

export async function extractCommits(
  repoPath: string
): Promise<RawCommit[]> {
  const git: SimpleGit = simpleGit(repoPath);

  // Use git.raw() with a custom format for reliable field extraction
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
    `-n`,
    "500",
    `--pretty=format:${format}${separator}`,
  ]);

  if (!raw || !raw.trim()) {
    return [];
  }

  const records = raw
    .split(separator)
    .map((r) => r.trim())
    .filter(Boolean);

  const commits: RawCommit[] = [];

  for (const record of records) {
    const fields = record.split(fieldSep);
    if (fields.length < 5) continue;

    const [hash, author, email, date, message] = fields;

    // Get diff stats for this commit
    const diffSummary = await git
      .diffSummary([`${hash}^`, hash])
      .catch(() => ({
        files: [],
        insertions: 0,
        deletions: 0,
        changed: 0,
      }));

    const files: FileChange[] = diffSummary.files.map((f) => {
      if (f.binary) {
        return {
          path: f.file,
          status: "modified" as const,
          insertions: 0,
          deletions: 0,
        };
      }
      let status: FileChange["status"] = "modified";
      if (f.insertions > 0 && f.deletions === 0) status = "added";
      else if (f.deletions > 0 && f.insertions === 0) status = "deleted";
      return {
        path: f.file,
        status,
        insertions: f.insertions,
        deletions: f.deletions,
      };
    });

    commits.push({
      hash,
      author,
      email,
      date,
      message,
      files,
      insertions: diffSummary.insertions ?? 0,
      deletions: diffSummary.deletions ?? 0,
    });
  }

  return commits;
}

export async function cleanup(repoPath: string): Promise<void> {
  await rm(repoPath, { recursive: true, force: true });
}
