import {
  Activity,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  FileText,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Charts } from "../components/Charts";
import { filterRecords } from "../services/analysis";
import { categories } from "../types";
import type { WorkspacePageProps } from "./types";
export function HomePage({
  t,
  heading,
  setForm,
  prefs,
  mistakes,
  papers,
  goals,
  insights,
  insightCard,
  paperRows,
  empty,
}: WorkspacePageProps) {
  return (
    <>
      {heading(
        "welcome",
        "intro",
        <button
          className="secondary"
          onClick={() => setForm({ kind: "paper" })}
        >
          <Plus size={17} />
          {t("addPaper")}
        </button>,
      )}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow cyan">
            <span className="status-dot" />
            {t("basedOn")}
          </span>
          <p className="hero-greeting">
            {prefs.name
              ? t("welcomeName", { name: prefs.name })
              : t("greeting")}
          </p>
          <h2>{mistakes.length || papers.length ? t("ready") : t("start")}</h2>
          <p>{t("tagline")}</p>
          <button
            className="primary"
            onClick={() => setForm({ kind: "mistake" })}
          >
            {t("addMistake")}
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="orbital" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit-core">
            <Activity size={48} strokeWidth={1.2} />
          </div>
          <span className="orbit-node n1" />
          <span className="orbit-node n2" />
          <span className="orbit-node n3" />
          <span className="orbit-label">LEARN · REFLECT · EVOLVE</span>
        </div>
      </section>
      <div className="stat-grid">
        {[
          {
            key: "totalMistakes",
            value: mistakes.length,
            icon: BookOpen,
          },
          {
            key: "totalPapers",
            value: papers.length,
            icon: FileText,
          },
          {
            key: "activeGoals",
            value: goals.filter((g) => !g.completed).length,
            icon: Target,
          },
          {
            key: "activity",
            value: filterRecords([...mistakes, ...papers], "", 7).length,
            icon: Activity,
          },
        ].map(({ key, value, icon: Icon }) => (
          <section className="card stat" key={key}>
            <div>
              <span>{t(key)}</span>
              <strong>{value.toString().padStart(2, "0")}</strong>
            </div>
            <Icon size={21} />
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card focus-card">
          <div className="section-heading">
            <h3>
              <Sparkles size={18} />
              {t("focus")}
            </h3>
            <span className="badge">{t("rules")}</span>
          </div>
          {insights.length ? (
            insights.slice(0, 2).map((s, i) => insightCard(s, i))
          ) : (
            <div className="first-focus">
              <span className="focus-icon">
                <Target size={24} />
              </span>
              <h2>{t("firstStep")}</h2>
              <p className="muted">{t("firstDescription")}</p>
              <button
                className="text-button"
                onClick={() => setForm({ kind: "mistake" })}
              >
                {t("step1")}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
        <Charts papers={papers} mistakes={mistakes} compact />
        <section className="card">
          <div className="section-heading">
            <h3>{t("recent")}</h3>
            <NavLink className="text-button" to="/papers">
              {t("all")}
              <ArrowRight size={15} />
            </NavLink>
          </div>
          {paperRows(
            [...papers]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3),
          )}
        </section>
        <section className="card">
          <div className="section-heading">
            <h3>{t("weakness")}</h3>
            <ChartNoAxesCombined size={18} />
          </div>
          {mistakes.length
            ? categories
                .map((c) => ({
                  c,
                  count: mistakes.filter((m) => m.category === c).length,
                }))
                .filter((c) => c.count)
                .sort((a, b) => b.count - a.count)
                .slice(0, 4)
                .map(({ c, count }) => (
                  <div className="weakness-row" key={c}>
                    <div>
                      <span>{t(c)}</span>
                      <span>{count}</span>
                    </div>
                    <div className="meter">
                      <span
                        style={{
                          width: `${(count / mistakes.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            : empty}
          <NavLink to="/analytics" className="text-button">
            {t("viewAnalytics")}
            <ArrowRight size={15} />
          </NavLink>
        </section>
      </div>
    </>
  );
}
