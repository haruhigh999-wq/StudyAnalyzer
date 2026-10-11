import { z } from "zod";
export const categories = [
  "knowledge",
  "calculation",
  "misunderstanding",
  "strategy",
  "time",
  "careless",
  "other",
] as const;
const text = z.string().max(20000);
const required = text.trim().min(1);
const id = z.string().min(1).max(100);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
  );
export const mistakeSchema = z.object({
  id,
  subject: required,
  topic: required,
  question: required,
  studentAnswer: text,
  correctAnswer: required,
  explanation: text,
  category: z.enum(categories),
  notes: text,
  date,
});
export const paperSchema = z
  .object({
    id,
    school: required,
    year: z.number().int().min(1900).max(2200),
    subject: required,
    date,
    score: z.number().min(0),
    maximum: z.number().positive(),
    target: z.number().min(0),
    timeLimit: z.number().positive(),
    actualTime: z.number().min(0),
    wentWell: text,
    wentWrong: text,
    difficult: text,
    improve: text,
    reflection: text,
  })
  .refine((v) => v.score <= v.maximum && v.target <= v.maximum, {
    message: "Score and target must not exceed maximum",
  });
export const goalSchema = z.object({
  id,
  title: required,
  completed: z.boolean(),
  date,
});
export const preferencesSchema = z.object({
  id: z.literal("user"),
  language: z.enum(["en", "ja"]),
  theme: z.enum(["dark", "light"]),
  name: z.string().max(80),
});
export const backupSchema = z
  .object({
    version: z.literal(1),
    mistakes: z.array(mistakeSchema).max(50000),
    papers: z.array(paperSchema).max(50000),
    goals: z.array(goalSchema).max(50000),
    preferences: preferencesSchema.optional(),
  })
  .refine((v) =>
    [v.mistakes, v.papers, v.goals].every(
      (rows) => new Set(rows.map((r) => r.id)).size === rows.length,
    ),
  );
export type Mistake = z.infer<typeof mistakeSchema>;
export type Paper = z.infer<typeof paperSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Backup = z.infer<typeof backupSchema>;
