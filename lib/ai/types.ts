export type AgentName =
  | "commit-analyst"
  | "architecture-tracker"
  | "complexity-scorer"
  | "narrative-writer";

export interface AgentStatus {
  name: AgentName;
  status: "idle" | "running" | "thinking" | "complete" | "error";
  progress: number; // 0-100
  thinking?: string;
  result?: unknown;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface AnalysisEvent {
  type:
    | "agent_start"
    | "agent_thinking"
    | "agent_progress"
    | "agent_complete"
    | "pipeline_complete"
    | "error";
  agent?: AgentName;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface CommitAnalysis {
  significance: number; // 1-10
  category: string;
  milestoneGroup?: string;
}

export interface ArchitectureEvent {
  type: "stack_change" | "structural" | "directory_evolution";
  description: string;
  commitHash: string;
  date: string;
}

export interface ComplexitySnapshot {
  date: string;
  totalFiles: number;
  totalLines: number;
  growthRate: number;
  healthScore: number;
  refactoringRatio: number;
}

export interface Narrative {
  eraTitle: string;
  dateRange: string;
  story: string;
  milestones: string[];
  commitStories?: Record<string, string>;
}

export interface PipelineResult {
  commitAnalysis: CommitAnalysis[];
  architectureEvents: ArchitectureEvent[];
  complexitySnapshots: ComplexitySnapshot[];
  narratives: Narrative[];
}
