import { Sparkles } from "lucide-react";
import type { WorkspacePageProps } from "./types";
export function CoachPage({
  t,
  heading,
  insights,
  insightCard,
  addButton,
  goalsCard,
}: WorkspacePageProps) {
  return (
    <>
      {heading("coach", "coachIntro")}
      <div className="coach-banner">
        <Sparkles size={20} />
        <div>
          <strong>{t("insights")}</strong>
          <p>
            {t("rules")} · {t("basedOn")}
          </p>
        </div>
      </div>
      <div className="coach-layout">
        <div className="coach-cards">
          {insights.length ? (
            insights.map((s, i) => insightCard(s, i, true))
          ) : (
            <section className="card">
              <h2>{t("firstStep")}</h2>
              <p className="muted">{t("noInsights")}</p>
              {addButton("paper")}
            </section>
          )}
        </div>
        {goalsCard}
      </div>
    </>
  );
}
