import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import type { Insight } from "../services/analysis";
import type { Goal, Mistake, Paper, Preferences } from "../types";
/** Shared read models and user actions supplied by the workspace controller. */
export interface WorkspacePageProps {
  t: TFunction;
  heading: (
    title: string,
    description: string,
    action?: ReactNode,
  ) => ReactNode;
  addButton: (kind: "mistake" | "paper") => ReactNode;
  filters: (kind: "mistake" | "paper" | "analytics") => ReactNode;
  setForm: (
    value: { kind: "mistake" | "paper"; record?: Mistake | Paper } | null,
  ) => void;
  setDetail: (value: Mistake | Paper | null) => void;
  prefs: Preferences;
  mistakes: Mistake[];
  papers: Paper[];
  goals: Goal[];
  insights: Insight[];
  insightCard: (insight: Insight, index: number, full?: boolean) => ReactNode;
  paperRows: (rows: Paper[]) => ReactNode;
  empty: ReactNode;
  filteredPapers: Paper[];
  filteredMistakes: Mistake[];
  goalsCard: ReactNode;
}
