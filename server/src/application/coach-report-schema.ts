import { z } from 'zod';
import { SKILL_AREAS, type CoachReport } from '@/domain/types';

/**
 * Runtime version of the CoachReport type from src/domain/types.ts.
 * Typed as z.ZodType<CoachReport>, so the compiler fails if the two ever drift apart.
 * Strict objects: unknown fields are errors, which keeps the AI honest.
 */
export const coachReportSchema: z.ZodType<CoachReport> = z.strictObject({
  summary: z.string(),
  assessments: z.array(
    z.strictObject({
      area: z.enum(SKILL_AREAS),
      score: z.number(),
      evidence: z.array(z.string()),
    }),
  ),
  steps: z.array(
    z.strictObject({
      id: z.string(),
      area: z.enum(SKILL_AREAS),
      title: z.string(),
      goal: z.string(),
      topics: z.array(z.string()),
      exercise: z.string(),
      effortHours: z.number(),
      prerequisites: z.array(z.string()),
    }),
  ),
});

/** The same contract as JSON Schema, passed to Codex as its required output format. */
export const coachReportJsonSchema = z.toJSONSchema(coachReportSchema, { target: 'draft-7' });
