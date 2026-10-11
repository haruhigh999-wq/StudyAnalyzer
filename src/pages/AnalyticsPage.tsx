import { Charts } from "../components/Charts";
import { localAnalysis, percentage } from "../services/analysis";
import type { WorkspacePageProps } from "./types";
export function AnalyticsPage({
  t,
  heading,
  filters,
  filteredPapers,
  filteredMistakes,
  insightCard,
}: WorkspacePageProps) {
  return (
    <>
      {heading("analytics", "analyticsIntro")}
      {filters("analytics")}
      <p className="fine-print">{t("schoolScope")}</p>
      <Charts papers={filteredPapers} mistakes={filteredMistakes} />
      <div className="dashboard-grid">
        <section className="card">
          <h3>{t("trend")}</h3>
          <p className="muted">
            {filteredPapers.length >= 2
              ? t("trendText", {
                  from: percentage(
                    filteredPapers.at(-1)!.score,
                    filteredPapers.at(-1)!.maximum,
                  ),
                  to: percentage(
                    filteredPapers[0].score,
                    filteredPapers[0].maximum,
                  ),
                })
              : t("notEnoughTrend")}
          </p>
          <p className="fine-print">{t("caveat")}</p>
        </section>
        <section className="card">
          <h3>{t("priorities")}</h3>
          {localAnalysis.analyze(filteredMistakes, filteredPapers, [])
            .length ? (
            localAnalysis
              .analyze(filteredMistakes, filteredPapers, [])
              .slice(0, 3)
              .map((s, i) => insightCard(s, i))
          ) : (
            <p className="muted">{t("noInsights")}</p>
          )}
        </section>
      </div>
    </>
  );
}
