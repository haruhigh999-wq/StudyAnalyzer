import { ArrowRight } from "lucide-react";
import type { WorkspacePageProps } from "./types";
export function MistakesPage({
  t,
  heading,
  addButton,
  filters,
  filteredMistakes,
  setDetail,
  empty,
}: WorkspacePageProps) {
  return (
    <>
      {heading("mistakes", "mistakesIntro", addButton("mistake"))}
      {filters("mistake")}
      <div className="record-grid">
        {filteredMistakes.length
          ? filteredMistakes.map((m) => (
              <button
                className="card mistake-card"
                key={m.id}
                onClick={() => setDetail(m)}
              >
                <div className="section-heading">
                  <span className="badge">{m.subject}</span>
                  <span className="muted">{m.date}</span>
                </div>
                <h3>{m.topic}</h3>
                <p>{m.question}</p>
                <div className="mistake-bottom">
                  <span className="category">
                    <i />
                    {t(m.category)}
                  </span>
                  <ArrowRight size={17} />
                </div>
              </button>
            ))
          : empty}
      </div>
    </>
  );
}
