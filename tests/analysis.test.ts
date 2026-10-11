import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  percentage,
  localAnalysis,
  filterRecords,
} from "../src/services/analysis";
import {
  paperSchema,
  mistakeSchema,
  backupSchema,
  type Paper,
  type Mistake,
} from "../src/types";
import { db, clearData, exportBackup, importBackup } from "../src/data/db";
const paper: Paper = {
  id: "p1",
  school: "Example School",
  subject: "Mathematics",
  year: 2025,
  date: "2026-10-01",
  score: 60,
  maximum: 80,
  target: 64,
  timeLimit: 60,
  actualTime: 65,
  wentWell: "Algebra",
  wentWrong: "Ran out of time",
  difficult: "Geometry",
  improve: "Use checkpoints",
  reflection: "詳細な振り返り",
};
const mistake: Mistake = {
  id: "m1",
  subject: "Mathematics",
  topic: "Algebra",
  question: "2x=8",
  studentAnswer: "3",
  correctAnswer: "4",
  explanation: "Divide by 2",
  category: "calculation",
  notes: "Check work",
  date: "2026-10-01",
};
describe("scores and rules", () => {
  it("normalizes different maximum scores", () => {
    expect(percentage(60, 80)).toBe(75);
    expect(percentage(90, 120)).toBe(75);
    expect(percentage(1, 3)).toBe(33.3);
    expect(percentage(0, 0)).toBe(0);
  });
  it("does not invent patterns with no or one record", () => {
    expect(localAnalysis.analyze([], [], [])).toEqual([]);
    expect(localAnalysis.analyze([mistake], [paper], [])).toEqual([]);
  });
  it("counts each time-affected paper only once", () => {
    expect(
      localAnalysis
        .analyze([], [paper, { ...paper, id: "p2" }], [])
        .find((i) => i.kind === "timing")?.count,
    ).toBe(2);
  });
  it("recognizes Japanese reflections", () => {
    const p = { ...paper, actualTime: 50, wentWrong: "時間が足りなかった" };
    expect(
      localAnalysis
        .analyze([], [p, { ...p, id: "2" }], [])
        .some((i) => i.kind === "timing"),
    ).toBe(true);
  });
  it("identifies repeated calculation errors", () =>
    expect(
      localAnalysis.analyze([mistake, { ...mistake, id: "2" }], [], []),
    ).toContainEqual({ kind: "calculation", count: 2, source: "mistakes" }));
  it("filters subjects and dates", () => {
    expect(filterRecords([mistake], "English", 0)).toEqual([]);
    expect(filterRecords([{ ...mistake, date: "2000-01-01" }], "", 30)).toEqual(
      [],
    );
  });
});
describe("validation", () => {
  it("rejects scores exceeding maximum and invalid dates", () => {
    expect(paperSchema.safeParse({ ...paper, score: 81 }).success).toBe(false);
    expect(paperSchema.safeParse({ ...paper, maximum: 0 }).success).toBe(false);
    expect(paperSchema.safeParse({ ...paper, target: 90 }).success).toBe(false);
    expect(
      mistakeSchema.safeParse({ ...mistake, date: "2026-02-30" }).success,
    ).toBe(false);
  });
  it("rejects missing fields, duplicates, unknown version and invalid categories", () => {
    expect(mistakeSchema.safeParse({ ...mistake, question: "" }).success).toBe(
      false,
    );
    expect(
      mistakeSchema.safeParse({ ...mistake, category: "invented" }).success,
    ).toBe(false);
    expect(
      backupSchema.safeParse({
        version: 2,
        mistakes: [],
        papers: [],
        goals: [],
      }).success,
    ).toBe(false);
    expect(
      backupSchema.safeParse({
        version: 1,
        mistakes: [mistake, mistake],
        papers: [],
        goals: [],
      }).success,
    ).toBe(false);
  });
});
describe("IndexedDB persistence and backup", () => {
  beforeEach(async () => {
    await clearData();
  });
  it("round-trips all fields, goals and preferences", async () => {
    await db.mistakes.put(mistake);
    await db.papers.put(paper);
    await db.goals.put({
      id: "g1",
      title: "Practice for 10 minutes",
      date: "2026-10-01",
      completed: false,
    });
    await db.preferences.put({
      id: "user",
      theme: "light",
      language: "ja",
      name: "Test",
    });
    const backup = await exportBackup();
    await clearData();
    await importBackup(JSON.parse(JSON.stringify(backup)));
    expect(await exportBackup()).toEqual(backup);
  });
  it("merges matching IDs and keeps unrelated data", async () => {
    await db.mistakes.put(mistake);
    await importBackup({
      version: 1,
      mistakes: [{ ...mistake, topic: "Updated" }],
      papers: [paper],
      goals: [],
    });
    expect(await db.mistakes.count()).toBe(1);
    expect((await db.mistakes.get("m1"))?.topic).toBe("Updated");
    expect(await db.papers.count()).toBe(1);
  });
  it("invalid import leaves existing records unchanged", async () => {
    await db.papers.put(paper);
    await expect(
      importBackup({
        version: 1,
        mistakes: [mistake],
        papers: [{ ...paper, maximum: 0 }],
        goals: [],
      }),
    ).rejects.toThrow();
    expect(await db.mistakes.count()).toBe(0);
    expect(await db.papers.toArray()).toEqual([paper]);
  });
  it("edits and deletes records", async () => {
    await db.mistakes.put(mistake);
    await db.mistakes.update(mistake.id, { notes: "Revised" });
    expect((await db.mistakes.get(mistake.id))?.notes).toBe("Revised");
    await db.mistakes.delete(mistake.id);
    expect(await db.mistakes.count()).toBe(0);
  });
});

describe("conservative reflection interpretation", () => {
  it("does not treat positive time-allocation language as difficulty", () => {
    const p = {
      ...paper,
      actualTime: 50,
      wentWrong: "",
      reflection: "時間配分がうまくできた。No time management issues.",
      improve: "",
    };
    expect(
      localAnalysis
        .analyze([], [p, { ...p, id: "2" }], [])
        .some((i) => i.kind === "timing"),
    ).toBe(false);
  });
  it("does not count negated difficulty statements", () => {
    const p = {
      ...paper,
      actualTime: 50,
      wentWrong: "I never ran out of time.",
      reflection: "時間不足ではなかった。",
      improve: "",
    };
    expect(
      localAnalysis
        .analyze([], [p, { ...p, id: "2" }], [])
        .some((i) => i.kind === "timing"),
    ).toBe(false);
  });
});
