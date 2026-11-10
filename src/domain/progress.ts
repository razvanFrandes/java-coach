import type { LearningStep } from './types';

export interface ProgressSummary {
  completed: number;
  total: number;
  /** 0-100, rounded to a whole number. */
  percent: number;
  remainingHours: number;
}

export function summarizeProgress(steps: LearningStep[], completedIds: string[]): ProgressSummary {
  const done = new Set(completedIds);
  const completed = steps.filter((s) => done.has(s.id)).length;
  const remainingHours = steps
    .filter((s) => !done.has(s.id))
    .reduce((hours, s) => hours + s.effortHours, 0);

  return {
    completed,
    total: steps.length,
    percent: steps.length === 0 ? 0 : Math.round((completed / steps.length) * 100),
    remainingHours,
  };
}

/** The first step of the path that is not done yet. */
export function findNextStep(
  orderedSteps: LearningStep[],
  completedIds: string[],
): LearningStep | undefined {
  return orderedSteps.find((step) => !completedIds.includes(step.id));
}
