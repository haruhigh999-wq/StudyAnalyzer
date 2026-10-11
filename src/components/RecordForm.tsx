import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { db } from "../data/db";
import {
  categories,
  mistakeSchema,
  paperSchema,
  type Mistake,
  type Paper,
} from "../types";
import { Modal } from "./Modal";
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function RecordForm({
  kind,
  record,
  close,
  done,
}: {
  kind: "mistake" | "paper";
  record?: Mistake | Paper;
  close: () => void;
  done: () => void;
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const value = (key: string) =>
    record
      ? ((record as unknown as Record<string, string | number>)[key] ?? "")
      : key === "date"
        ? today()
        : key === "year"
          ? new Date().getFullYear()
          : key === "maximum" || key === "timeLimit"
            ? 100
            : key === "target"
              ? 80
              : "";
  const field = (key: string, type = "text", required = false) => (
    <label key={key} className={type === "textarea" ? "full" : ""}>
      {t(key)} {required ? "*" : <small>{t("optional")}</small>}
      {type === "textarea" ? (
        <textarea
          name={key}
          defaultValue={value(key)}
          required={required}
          maxLength={20000}
          rows={key === "reflection" || key === "question" ? 4 : 2}
        />
      ) : (
        <input
          name={key}
          type={type}
          defaultValue={value(key)}
          required={required}
          maxLength={20000}
          min={
            type === "number"
              ? key === "year"
                ? 1900
                : key === "maximum" || key === "timeLimit"
                  ? 0.01
                  : 0
              : undefined
          }
          max={key === "year" ? 2200 : undefined}
          step={key === "year" ? 1 : "any"}
        />
      )}
    </label>
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (kind === "mistake") {
        await db.mistakes.put(
          mistakeSchema.parse({
            ...data,
            id: record?.id ?? crypto.randomUUID(),
          }),
        );
      } else {
        for (const key of [
          "year",
          "score",
          "maximum",
          "target",
          "timeLimit",
          "actualTime",
        ])
          data[key] = Number(data[key]) as unknown as string;
        await db.papers.put(
          paperSchema.parse({ ...data, id: record?.id ?? crypto.randomUUID() }),
        );
      }
      done();
      close();
    } catch {
      setError(t("invalid"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={t(
        record ? "edit" : kind === "mistake" ? "addMistake" : "addPaper",
      )}
      close={close}
    >
      <p className="muted">{t("required")}</p>
      <form onSubmit={submit}>
        <div className="form-grid">
          {kind === "mistake" ? (
            <>
              {field("subject", "text", true)}
              {field("topic", "text", true)}
              {field("date", "date", true)}
              <label>
                {t("category")} *
                <select
                  name="category"
                  defaultValue={value("category") || "knowledge"}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
                </select>
              </label>
              {field("question", "textarea", true)}
              {field("studentAnswer", "textarea")}
              {field("correctAnswer", "textarea", true)}
              {field("explanation", "textarea")}
              {field("notes", "textarea")}
            </>
          ) : (
            <>
              {field("school", "text", true)}
              {field("subject", "text", true)}
              {field("year", "number", true)}
              {field("date", "date", true)}
              {["score", "maximum", "target", "timeLimit", "actualTime"].map(
                (k) => field(k, "number", true),
              )}
              <div className="full reflection-title">
                <h3>{t("reflection")}</h3>
                <p className="muted">{t("reflectionHint")}</p>
              </div>
              {[
                "wentWell",
                "wentWrong",
                "difficult",
                "improve",
                "reflection",
              ].map((k) => field(k, "textarea"))}
            </>
          )}
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="secondary" onClick={close}>
            {t("cancel")}
          </button>
          <button className="primary" disabled={busy}>
            {t("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
