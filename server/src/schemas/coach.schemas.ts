import { z } from 'zod';
import { SKILL_AREAS, type CodexAnswer } from '../types';

/** Body of POST /api/coach/analyze. */
export const analyzeRequestSchema = z.object({
  cvText: z.string().min(50).max(100_000),
});

/**
 * What Codex must answer. Typed as z.ZodType<CodexAnswer>, so the compiler fails if this
 * schema and the type in types.ts drift apart. Strict objects: unknown fields are errors.
 */
export const codexAnswerSchema: z.ZodType<CodexAnswer> = z.strictObject({
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

/** The same schema as JSON Schema, passed to Codex as its required output format. */
export const codexAnswerJsonSchema = z.toJSONSchema(codexAnswerSchema, { target: 'draft-7' });
