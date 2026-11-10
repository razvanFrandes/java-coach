/**
 * The JSON the server sends back. Same shapes as server/src/types.ts.
 * The contract is described in docs/api-contract.md: change the three together.
 */

export type SkillArea =
  | 'core-language'
  | 'oop'
  | 'collections'
  | 'concurrency'
  | 'jvm'
  | 'spring'
  | 'testing'
  | 'build-tools'
  | 'databases';

export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillRating {
  area: SkillArea;
  /** 0-100 */
  score: number;
  level: SkillLevel;
  /** Short facts from the CV. Empty when nothing was found. */
  evidence: string[];
}

export interface Gap {
  area: SkillArea;
  severity: 'missing' | 'weak';
  /** One sentence, ready to show. */
  reason: string;
}

export interface LearningStep {
  id: string;
  area: SkillArea;
  title: string;
  goal: string;
  topics: string[];
  exercise: string;
  effortHours: number;
  /** Ids of the steps that come first. */
  prerequisites: string[];
}

export interface CoachReport {
  summary: string;
  /** One per skill area, in display order. */
  skills: SkillRating[];
  /** Most urgent first. */
  gaps: Gap[];
  /** Already in the order to do them. */
  learningPath: LearningStep[];
}

export interface AnalyzeCvResponse {
  report: CoachReport;
  /** True when the server had already analysed this exact CV. */
  cached: boolean;
}

export interface ApiErrorResponse {
  error: { code: string; message: string };
}
