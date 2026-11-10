/**
 * Domain vocabulary for Java Coach.
 * Pure TypeScript: no React, no I/O. Every other layer speaks in these types.
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

/** Levels from weakest to strongest. The order matters: it is used for comparisons. */
export const SKILL_LEVELS = ['none', 'beginner', 'intermediate', 'advanced', 'expert'] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

/** What the coach found in the CV for one area. `score` is 0-100. */
export interface AreaAssessment {
  area: SkillArea;
  score: number;
  /** Short quotes or facts from the CV that justify the score. Empty when nothing was found. */
  evidence: string[];
}

/** One step of the learning path, as suggested by the coach. */
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

/**
 * The coach's answer for one CV.
 * It is raw material: levels, gaps and the path order are derived from it by domain functions,
 * so those rules live (and are tested) in one place instead of in every backend.
 */
export interface CoachReport {
  summary: string;
  assessments: AreaAssessment[];
  steps: LearningStep[];
}

/** An area with its derived level. Produced by `rateSkills`. */
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
