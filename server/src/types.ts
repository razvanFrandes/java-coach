/**
 * The shapes the server works with. The JSON sent to the browser is described in
 * docs/api-contract.md; the frontend has its own copy in src/types/api.ts.
 */

/** The areas of Java knowledge the coach evaluates, in display order. */
export const SKILL_AREAS = [
  'core-language',
  'oop',
  'collections',
  'concurrency',
  'jvm',
  'spring',
  'testing',
  'build-tools',
  'databases',
] as const;

export type SkillArea = (typeof SKILL_AREAS)[number];

export const SKILL_AREA_LABELS: Record<SkillArea, string> = {
  'core-language': 'Core language',
  oop: 'Object-oriented design',
  collections: 'Collections',
  concurrency: 'Concurrency',
  jvm: 'JVM internals',
  spring: 'Spring',
  testing: 'Testing',
  'build-tools': 'Build tools',
  databases: 'Databases',
};

/** Levels from weakest to strongest. */
export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** One step of the learning path. */
export interface LearningStep {
  id: string;
  area: SkillArea;
  title: string;
  goal: string;
  topics: string[];
  exercise: string;
  effortHours: number;
  /** Ids of steps that should be done before this one. */
  prerequisites: string[];
}

/** What Codex answers: raw scores and steps. The server turns it into a CoachReport. */
export interface CodexAnswer {
  summary: string;
  assessments: { area: SkillArea; score: number; evidence: string[] }[];
  steps: LearningStep[];
}

/** One skill area with its score (0-100) and level. */
export interface SkillRating {
  area: SkillArea;
  score: number;
  level: SkillLevel;
  evidence: string[];
}

/** Something missing (nothing in the CV) or weak (only beginner-level evidence). */
export interface Gap {
  area: SkillArea;
  severity: 'missing' | 'weak';
  reason: string;
}

/** The report sent to the browser. */
export interface CoachReport {
  summary: string;
  skills: SkillRating[];
  gaps: Gap[];
  learningPath: LearningStep[];
}

export interface AnalyzeResult {
  report: CoachReport;
  /** True when the report came from the database instead of a new Codex call. */
  cached: boolean;
}
