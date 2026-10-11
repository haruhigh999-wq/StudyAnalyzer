import { useLiveQuery } from "dexie-react-hooks";
import { MotionConfig, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  Download,
  FileText,
  Home,
  LockKeyhole,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  HashRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Modal } from "./components/Modal";
import { RecordForm, today } from "./components/RecordForm";
import { clearData, db, exportBackup, importBackup } from "./data/db";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CoachPage } from "./pages/CoachPage";
import { HomePage } from "./pages/HomePage";
import { MistakesPage } from "./pages/MistakesPage";
import { PapersPage } from "./pages/PapersPage";
import {
  filterRecords,
  localAnalysis,
  percentage,
  type Insight,
} from "./services/analysis";
import {
  backupSchema,
  categories,
  type Mistake,
  type Paper,
  type Preferences,
} from "./types";
const navigation = [
  { path: "/", key: "home", icon: Home },
  { path: "/mistakes", key: "mistakes", icon: BookOpen },
  { path: "/papers", key: "papers", icon: FileText },
  { path: "/analytics", key: "analytics", icon: ChartNoAxesCombined },
  { path: "/coach", key: "coach", icon: Sparkles },
  { path: "/settings", key: "settings", icon: Settings },
];
function Shell() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const data = useLiveQuery(async () => ({
    mistakes: await db.mistakes.toArray(),
    papers: await db.papers.toArray(),
    goals: await db.goals.toArray(),
    prefs: await db.preferences.get("user"),
  }));
  const mistakes = data?.mistakes ?? [];
  const papers = data?.papers ?? [];
  const goals = data?.goals ?? [];
  const prefs: Preferences = data?.prefs ?? {
    id: "user",
    theme: "dark",
    language: navigator.language.startsWith("ja") ? "ja" : "en",
    name: "",
  };
  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState<{
    kind: "mistake" | "paper";
    record?: Mistake | Paper;
  } | null>(null);
  const [detail, setDetail] = useState<Mistake | Paper | null>(null);
  const [toast, setToast] = useState("");
  const [command, setCommand] = useState(false);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<{
    text: string;
    run: () => Promise<void>;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [school, setSchool] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [days, setDays] = useState(0);
  const [goalText, setGoalText] = useState("");
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.lang = prefs.language;
    void i18n.changeLanguage(prefs.language);
  }, [prefs.theme, prefs.language, i18n]);
  useEffect(() => {
    setSearch("");
    setSubject("");
    setSchool("");
    setCategory("");
    setYear("");
    setDays(0);
  }, [location.pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const safe = async (fn: () => Promise<unknown>, message = "saved") => {
    try {
      await fn();
      setToast(t(message));
    } catch {
      setToast(t("error"));
    }
  };
  const setPref = (patch: Partial<Preferences>) =>
    safe(() => db.preferences.put({ ...prefs, ...patch }));
  const insights = localAnalysis.analyze(mistakes, papers, goals);
  const filteredPapers = filterRecords(papers, subject, days)
    .filter(
      (p) =>
        (!school || p.school === school) &&
        (!year || p.year === Number(year)) &&
        (!search ||
          [
            p.school,
            p.subject,
            p.reflection,
            p.wentWell,
            p.wentWrong,
            p.difficult,
            p.improve,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const filteredMistakes = filterRecords(mistakes, subject, days)
    .filter(
      (m) =>
        (!category || m.category === category) &&
        (!search ||
          Object.values(m)
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const heading = (title: string, description: string, action?: ReactNode) => (
    <div className="page-heading">
      <div>
        <p className="eyebrow">STUDYANALYZER / {t("workspace")}</p>
        <h1>{t(title)}</h1>
        <p className="muted">{t(description)}</p>
      </div>
      {action}
    </div>
  );
  const addButton = (kind: "mistake" | "paper") => (
    <button className="primary" onClick={() => setForm({ kind })}>
      <Plus size={17} />
      {t(kind === "mistake" ? "addMistake" : "addPaper")}
    </button>
  );
  const empty = (
    <div className="empty-inline">
      <BookOpen size={28} />
      <p>{t("noRecords")}</p>
    </div>
  );
  const select = (
    label: string,
    value: string,
    change: (v: string) => void,
    values: string[],
  ) => (
    <select
      aria-label={t(label)}
      value={value}
      onChange={(e) => change(e.target.value)}
    >
      <option value="">{t(label)}</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {label === "allCategories" ? t(v) : v}
        </option>
      ))}
    </select>
  );
  const filters = (kind: "mistake" | "paper" | "analytics") => (
    <div className="filters">
      {kind !== "analytics" && (
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label={t("search")}
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      {select(
        "allSubjects",
        subject,
        setSubject,
        [...new Set([...mistakes, ...papers].map((r) => r.subject))].sort(),
      )}
      {kind === "mistake" ? (
        select("allCategories", category, setCategory, [...categories])
      ) : (
        <>
          {select(
            "allSchools",
            school,
            setSchool,
            [...new Set(papers.map((r) => r.school))].sort(),
          )}
          {kind === "paper" &&
            select(
              "allYears",
              year,
              setYear,
              [...new Set(papers.map((r) => String(r.year)))].sort().reverse(),
            )}
        </>
      )}
      {kind === "analytics" && (
        <select
          aria-label={t("allTime")}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value="0">{t("allTime")}</option>
          <option value="30">{t("days30")}</option>
          <option value="90">{t("days90")}</option>
        </select>
      )}
    </div>
  );
  const insightCard = (insight: Insight, index: number, full = false) => (
    <article className={"insight " + (full ? "card" : "")} key={insight.kind}>
      <div className="insight-number">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <span className="eyebrow cyan">
          {t("evidence", { count: insight.count })} · {t(insight.source)}
        </span>
        {full ? (
          ["observation", "cause", "action", "nextGoal"].map((key, i) => (
            <div className="advice-part" key={key}>
              <h4>{t(key)}</h4>
              <p>{t(`advice.${insight.kind}.${i}`)}</p>
            </div>
          ))
        ) : (
          <>
            <h3>{t(`advice.${insight.kind}.0`)}</h3>
            <p className="muted">{t(`advice.${insight.kind}.2`)}</p>
          </>
        )}
      </div>
    </article>
  );
  const paperRows = (rows: Paper[]) =>
    rows.length ? (
      <div className="paper-list">
        {rows.map((p) => (
          <button className="paper-row" key={p.id} onClick={() => setDetail(p)}>
            <span className="record-icon">
              <FileText size={20} />
            </span>
            <span className="paper-title">
              <strong>{p.school}</strong>
              <small>
                {p.subject} · {p.year} · {p.date}
              </small>
            </span>
            <span className="paper-score">
              <strong>
                {percentage(p.score, p.maximum)}
                <small>%</small>
              </strong>
              <span>
                {p.score} / {p.maximum}
              </span>
            </span>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
    ) : (
      empty
    );
  const goalsCard = (
    <section className="card">
      <div className="section-heading">
        <h3>{t("goals")}</h3>
        <Target size={18} className="cyan" />
      </div>
      <form
        className="goal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (goalText.trim())
            void safe(async () => {
              await db.goals.put({
                id: crypto.randomUUID(),
                title: goalText.trim(),
                completed: false,
                date: today(),
              });
              setGoalText("");
            });
        }}
      >
        <input
          aria-label={t("addGoal")}
          value={goalText}
          maxLength={500}
          onChange={(e) => setGoalText(e.target.value)}
          placeholder={t("goalPlaceholder")}
          required
        />
        <button className="icon-button primary" aria-label={t("addGoal")}>
          <Plus size={19} />
        </button>
      </form>
      {!goals.length && <p className="muted">{t("noGoal")}</p>}
      {goals.map((g) => (
        <div className="goal-row" key={g.id}>
          <button
            className={"goal-check " + (g.completed ? "checked" : "")}
            onClick={() =>
              void safe(() =>
                db.goals.update(g.id, { completed: !g.completed }),
              )
            }
            aria-label={t(g.completed ? "reopen" : "complete")}
          >
            {g.completed && <Check size={14} />}
          </button>
          <span className={g.completed ? "completed" : ""}>{g.title}</span>
          <button
            className="icon-button"
            aria-label={t("delete")}
            onClick={() =>
              setConfirm({
                text: t("deleteConfirm"),
                run: () => db.goals.delete(g.id),
              })
            }
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </section>
  );
  const pageProps = {
    t,
    heading,
    addButton,
    filters,
    setForm,
    setDetail,
    prefs,
    mistakes,
    papers,
    goals,
    insights,
    insightCard,
    paperRows,
    empty,
    filteredPapers,
    filteredMistakes,
    goalsCard,
  };
  return (
    <MotionConfig reducedMotion="user">
      <div className={"app " + (collapsed ? "collapsed" : "")}>
        <aside className="sidebar">
          <NavLink to="/" className="brand">
            <div className="brand-mark">
              <Activity size={25} />
            </div>
            <span>
              StudyAnalyzer<small>{t("brandSubtitle")}</small>
            </span>
          </NavLink>
          <span className="nav-caption">{t("workspace")}</span>
          <nav aria-label={t("navigation")}>
            {navigation.map(({ path, key, icon: Icon }) => (
              <NavLink key={key} to={path} end title={t(key)}>
                <Icon size={20} />
                <span>{t(key)}</span>
                {key === "coach" && <i className="nav-dot" />}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="privacy-mini">
              <ShieldCheck size={20} />
              <div>
                <strong>{t("private")}</strong>
                <small>{t("local")}</small>
              </div>
            </div>
            <button
              className="collapse-toggle"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={t("navToggle")}
            >
              <ChevronLeft size={17} />
              <span>{t("navToggle")}</span>
            </button>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              {t("workspace")} <span>/</span>{" "}
              {t(
                navigation.find((n) => n.path === location.pathname)?.key ??
                  "home",
              )}
            </div>
            <div className="top-actions">
              <span className="local-indicator">
                <i />
                {t("local")}
              </span>
              <button
                className="command-button"
                onClick={() => setCommand(true)}
                aria-label={t("openCommand")}
              >
                <Search size={16} />
                <span>{t("command")}</span>
                <kbd>⌘ K</kbd>
              </button>
            </div>
          </header>
          <main>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route path="/" element={<HomePage {...pageProps} />} />
                <Route
                  path="/mistakes"
                  element={<MistakesPage {...pageProps} />}
                />
                <Route path="/papers" element={<PapersPage {...pageProps} />} />
                <Route
                  path="/analytics"
                  element={<AnalyticsPage {...pageProps} />}
                />
                <Route path="/coach" element={<CoachPage {...pageProps} />} />
                <Route
                  path="/settings"
                  element={
                    <>
                      {heading("settings", "settingsIntro")}
                      <div className="settings-grid">
                        <section className="card">
                          <h3>{t("appearance")}</h3>
                          <label>
                            {t("name")}
                            <input
                              maxLength={80}
                              value={prefs.name}
                              onChange={(e) =>
                                void setPref({ name: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            {t("language")}
                            <select
                              value={prefs.language}
                              onChange={(e) =>
                                void setPref({
                                  language: e.target.value as "ja" | "en",
                                })
                              }
                            >
                              <option value="en">English</option>
                              <option value="ja">日本語</option>
                            </select>
                          </label>
                          <label>
                            {t("theme")}
                            <select
                              value={prefs.theme}
                              onChange={(e) =>
                                void setPref({
                                  theme: e.target.value as "dark" | "light",
                                })
                              }
                            >
                              <option value="dark">{t("dark")}</option>
                              <option value="light">{t("light")}</option>
                            </select>
                          </label>
                        </section>
                        <section className="card privacy-card">
                          <ShieldCheck size={30} />
                          <h2>{t("privacy")}</h2>
                          <p className="muted">{t("privacyText")}</p>
                        </section>
                        <section className="card">
                          <h3>{t("backup")}</h3>
                          <p className="muted">{t("importHelp")}</p>
                          <div className="button-row">
                            <button
                              className="secondary"
                              onClick={() =>
                                void safe(async () => {
                                  const url = URL.createObjectURL(
                                    new Blob(
                                      [
                                        JSON.stringify(
                                          await exportBackup(),
                                          null,
                                          2,
                                        ),
                                      ],
                                      { type: "application/json" },
                                    ),
                                  );
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `studyanalyzer-${today()}.json`;
                                  a.click();
                                  setTimeout(
                                    () => URL.revokeObjectURL(url),
                                    1000,
                                  );
                                }, "exported")
                              }
                            >
                              <Download size={17} />
                              {t("export")}
                            </button>
                            <label className="secondary import-button">
                              <Upload size={17} />
                              {t("import")}
                              <input
                                type="file"
                                accept=".json,application/json"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (!file) return;
                                  try {
                                    if (file.size > 20 * 1024 * 1024)
                                      throw Error();
                                    const backup = backupSchema.parse(
                                      JSON.parse(await file.text()),
                                    );
                                    setConfirm({
                                      text: t("importConfirm"),
                                      run: async () => {
                                        await importBackup(backup);
                                      },
                                    });
                                  } catch {
                                    setToast(t("invalidBackup"));
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <hr />
                          <button
                            className="danger"
                            onClick={() =>
                              setConfirm({
                                text: t("clearConfirm"),
                                run: clearData,
                              })
                            }
                          >
                            <Trash2 size={16} />
                            {t("deleteAll")}
                          </button>
                        </section>
                        {goalsCard}
                      </div>
                    </>
                  }
                />
                <Route
                  path="*"
                  element={
                    <section className="card">
                      <h1>{t("noRecords")}</h1>
                      <NavLink to="/">{t("home")}</NavLink>
                    </section>
                  }
                />
              </Routes>
            </motion.div>
            <footer>
              <span>{t("footer")}</span>
              <span>
                <LockKeyhole size={12} /> {t("local")}
              </span>
            </footer>
          </main>
        </div>
        <nav className="mobile-nav" aria-label={t("navigation")}>
          {navigation.map(({ path, key, icon: Icon }) => (
            <NavLink key={key} to={path} end>
              <Icon size={19} />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
        {form && (
          <RecordForm
            {...form}
            close={() => setForm(null)}
            done={() => setToast(t("saved"))}
          />
        )}{" "}
        {detail && (
          <Modal title={t("details")} close={() => setDetail(null)}>
            <div className="detail-fields">
              {Object.entries(detail)
                .filter(([key]) => key !== "id")
                .map(([key, value]) => (
                  <div key={key}>
                    <h4>{t(key)}</h4>
                    <p>
                      {key === "category"
                        ? t(String(value))
                        : String(value) || t("emptyValue")}
                    </p>
                  </div>
                ))}
            </div>
            <div className="form-actions">
              <button
                className="danger"
                onClick={() =>
                  setConfirm({
                    text: t("deleteConfirm"),
                    run: async () => {
                      if ("school" in detail) await db.papers.delete(detail.id);
                      else await db.mistakes.delete(detail.id);
                      setDetail(null);
                    },
                  })
                }
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
              <button
                className="primary"
                onClick={() => {
                  setForm({
                    kind: "school" in detail ? "paper" : "mistake",
                    record: detail,
                  });
                  setDetail(null);
                }}
              >
                {t("edit")}
              </button>
            </div>
          </Modal>
        )}
        {confirm && (
          <Modal title={t("details")} close={() => setConfirm(null)}>
            <p>{confirm.text}</p>
            <div className="form-actions">
              <button className="secondary" onClick={() => setConfirm(null)}>
                {t("cancel")}
              </button>
              <button
                className="primary"
                onClick={() => {
                  const run = confirm.run;
                  setConfirm(null);
                  void safe(run);
                }}
              >
                <Check size={17} />
                {t("confirm")}
              </button>
            </div>
          </Modal>
        )}
        {command && (
          <Modal title={t("command")} close={() => setCommand(false)}>
            <input
              autoFocus
              placeholder={t("commandPlaceholder")}
              aria-label={t("command")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="command-results">
              {navigation
                .filter((n) =>
                  t(n.key).toLowerCase().includes(query.toLowerCase()),
                )
                .map(({ path, key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      navigate(path);
                      setCommand(false);
                      setQuery("");
                    }}
                  >
                    <Icon size={20} />
                    {t(key)}
                    <ArrowRight size={16} />
                  </button>
                ))}
              {["mistake", "paper"].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setForm({ kind: k as "mistake" | "paper" });
                    setCommand(false);
                  }}
                >
                  <Plus size={20} />
                  {t(k === "mistake" ? "addMistake" : "addPaper")}
                </button>
              ))}
            </div>
          </Modal>
        )}
        {toast && (
          <div className="toast" role="status">
            <Check size={17} />
            {toast}
            <button aria-label={t("close")} onClick={() => setToast("")}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
