export interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  insertions: number;
  deletions: number;
}

export interface RawCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files: FileChange[];
  insertions: number;
  deletions: number;
}
