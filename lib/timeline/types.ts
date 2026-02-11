export interface TimelineEvent {
  name: string;
  year: number;
  degree: number;
  variant?: "medium" | "large";
  title: string;
  // Extended fields for git history
  narrative?: string;
  commits?: TimelineCommit[];
  architectureNote?: string;
  complexityDelta?: number;
  category?: string;
  dateRange?: string;
  image?: string;
}

export interface TimelineCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  story?: string;
  insertions: number;
  deletions: number;
}

export interface Line {
  variant: TimelineEvent["variant"];
  rotation: number;
  offsetX: number;
  offsetY: number;
  dataIndex: number | null;
}

export type Lines = Line[];
export type TimelineData = TimelineEvent[];
