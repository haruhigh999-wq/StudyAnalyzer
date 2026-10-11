import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { percentage } from "../services/analysis";
import { categories, type Mistake, type Paper } from "../types";
export function Charts({
  papers,
  mistakes,
  compact = false,
}: {
  papers: Paper[];
  mistakes: Mistake[];
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const scores = [...papers]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({
      date: p.date,
      score: percentage(p.score, p.maximum),
      school: p.school,
      subject: p.subject,
    }));
  const subjects = [...new Set(papers.map((p) => p.subject))].map((subject) => {
    const rows = papers.filter((p) => p.subject === subject);
    return {
      name: subject,
      value: Math.round(
        rows.reduce((n, p) => n + percentage(p.score, p.maximum), 0) /
          rows.length,
      ),
    };
  });
  const mistakesData = categories
    .map((c) => ({
      name: t(c),
      value: mistakes.filter((m) => m.category === c).length,
    }))
    .filter((v) => v.value);
  const tooltip = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--text)",
  };
  return (
    <div className={compact ? "" : "chart-grid"}>
      <section className="card chart-card">
        <div className="section-heading">
          <h3>{t("progress")}</h3>
          <span className="badge">%</span>
        </div>
        {scores.length ? (
          <>
            <div className="chart" role="img" aria-label={t("progress")}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={scores}
                  margin={{ left: -20, right: 15, top: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    vertical={false}
                    strokeDasharray="4 6"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltip} />
                  <Line
                    name={t("scoreLabel")}
                    type="monotone"
                    dataKey="score"
                    stroke="#4cc9ff"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#4cc9ff",
                      strokeWidth: 3,
                      stroke: "var(--surface)",
                    }}
                    isAnimationActive={!reduced}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <details className="chart-data">
              <summary>{t("details")}</summary>
              {scores.map((p, i) => (
                <p key={i}>
                  {p.date} · {p.school} · {p.subject}: {p.score}%
                </p>
              ))}
            </details>
          </>
        ) : (
          <div className="chart-empty">
            <div className="empty-chart-lines" />
            <p>{t("insufficient")}</p>
          </div>
        )}
        <p className="fine-print">{t("caveat")}</p>
      </section>
      {!compact &&
        [
          { title: "performance", data: subjects, color: "#8b7cff" },
          { title: "distribution", data: mistakesData, color: "#4cc9ff" },
        ].map(({ title, data, color }) => (
          <section className="card chart-card" key={title}>
            <h3>{t(title)}</h3>
            {data.length ? (
              <>
                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ left: -20, right: 10, bottom: 35 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "var(--muted)", fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        domain={title === "performance" ? [0, 100] : undefined}
                        allowDecimals={false}
                        tick={{ fill: "var(--muted)", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltip} />
                      <Bar
                        name={t(
                          title === "performance" ? "scoreLabel" : "count",
                        )}
                        dataKey="value"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={!reduced}
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={color} opacity={1 - i * 0.06} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <details className="chart-data">
                  <summary>{t("details")}</summary>
                  {data.map((d) => (
                    <p key={d.name}>
                      {d.name}: {d.value}
                      {title === "performance" ? "%" : ""}
                    </p>
                  ))}
                </details>
              </>
            ) : (
              <p className="empty-inline">{t("noRecords")}</p>
            )}
          </section>
        ))}
    </div>
  );
}
