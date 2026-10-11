import Dexie, { type Table } from "dexie";
import {
  backupSchema,
  type Goal,
  type Mistake,
  type Paper,
  type Preferences,
} from "../types";
class StudyDatabase extends Dexie {
  mistakes!: Table<Mistake, string>;
  papers!: Table<Paper, string>;
  goals!: Table<Goal, string>;
  preferences!: Table<Preferences, string>;
  constructor() {
    super("StudyAnalyzer");
    this.version(1).stores({
      mistakes: "id,subject,category,date",
      papers: "id,school,subject,year,date",
      goals: "id,date",
      preferences: "id",
    });
  }
}
export const db = new StudyDatabase();
export async function exportBackup() {
  return db.transaction(
    "r",
    [db.mistakes, db.papers, db.goals, db.preferences],
    async () => ({
      version: 1 as const,
      mistakes: await db.mistakes.toArray(),
      papers: await db.papers.toArray(),
      goals: await db.goals.toArray(),
      preferences: await db.preferences.get("user"),
    }),
  );
}
export async function importBackup(raw: unknown) {
  const data = backupSchema.parse(raw);
  await db.transaction(
    "rw",
    [db.mistakes, db.papers, db.goals, db.preferences],
    async () => {
      await db.mistakes.bulkPut(data.mistakes);
      await db.papers.bulkPut(data.papers);
      await db.goals.bulkPut(data.goals);
      if (data.preferences) await db.preferences.put(data.preferences);
    },
  );
}
export async function clearData() {
  await db.transaction(
    "rw",
    [db.mistakes, db.papers, db.goals, db.preferences],
    async () => {
      await Promise.all([
        db.mistakes.clear(),
        db.papers.clear(),
        db.goals.clear(),
        db.preferences.clear(),
      ]);
    },
  );
}
