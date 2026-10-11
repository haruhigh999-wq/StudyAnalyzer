import { categories, type Goal, type Mistake, type Paper } from "../types";
export const percentage = (score: number, maximum: number) =>
  maximum > 0 ? Math.round((score / maximum) * 1000) / 10 : 0;
export type Insight = {
  kind: string;
  count: number;
  source: "mistakes" | "papers" | "goals";
};
export interface AnalysisProvider {
  analyze(mistakes: Mistake[], papers: Paper[], goals: Goal[]): Insight[];
}
// Pure, explainable rules. Future remote providers must require explicit consent.
const timeIssue =
  /(ran out of time|running out of time|not enough time|insufficient time|too much time|poor time management|struggled with time|時間が足りな|時間不足|時間切れ|時間配分に失敗|時間をかけすぎ)/i;
const negatedTimeIssue =
  /(never ran out|did not run out|didn[’']t run out|not running out|no longer|時間不足ではな|時間切れにはなら|時間が足りないことはな)/i;
export const mentionsTimeDifficulty = (reflection: string) =>
  reflection
    .split(/[.!?。！？\n]/)
    .some(
      (sentence) =>
        timeIssue.test(sentence) && !negatedTimeIssue.test(sentence),
    );
export const localAnalysis: AnalysisProvider = {
  analyze(mistakes, papers, goals) {
    const insights: Insight[] = [];
    for (const kind of categories) {
      const count = mistakes.filter((m) => m.category === kind).length;
      if (count >= 2) insights.push({ kind, count, source: "mistakes" });
    }
    const count = papers.filter(
      (p) =>
        p.actualTime > p.timeLimit ||
        mentionsTimeDifficulty(
          [p.wentWrong, p.difficult, p.improve, p.reflection].join(" "),
        ),
    ).length;
    if (count >= 2) insights.push({ kind: "timing", count, source: "papers" });
    const below = papers.filter((p) => p.score < p.target).length;
    if (below >= 2)
      insights.push({ kind: "target", count: below, source: "papers" });
    const active = goals.filter((g) => !g.completed).length;
    if (active)
      insights.push({ kind: "goals", count: active, source: "goals" });
    return insights.sort((a, b) => b.count - a.count);
  },
};
export function filterRecords<T extends { subject: string; date: string }>(
  rows: T[],
  subject: string,
  days: number,
) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return rows.filter(
    (r) =>
      (!subject || r.subject === subject) &&
      (!days || new Date(r.date + "T00:00:00") >= cutoff),
  );
}
