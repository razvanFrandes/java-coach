import type { LearningStep, SkillRating } from './types';

/**
 * Orders the coach's steps into a path:
 * 1. a step comes after its prerequisites (those that are in the path),
 * 2. among the steps that are ready, the weakest area (lowest score) goes first,
 * 3. on equal scores the coach's own order wins.
 * Steps stuck in a prerequisite cycle are appended at the end instead of being lost.
 */
export function orderLearningPath(steps: LearningStep[], ratings: SkillRating[]): LearningStep[] {
  const stepIds = new Set(steps.map((s) => s.id));
  const scoreOf = (step: LearningStep) => ratings.find((r) => r.area === step.area)?.score ?? 0;

  const placedIds = new Set<string>();
  const ordered: LearningStep[] = [];
  let remaining = [...steps];

  while (remaining.length > 0) {
    const ready = remaining.filter((step) =>
      step.prerequisites.every((id) => !stepIds.has(id) || placedIds.has(id)),
    );
    if (ready.length === 0) {
      ordered.push(...remaining); // a cycle: nothing can become ready any more
      break;
    }

    // `ready` keeps the coach's order, and `<` keeps the earlier step on a tie.
    const next = ready.reduce((best, step) => (scoreOf(step) < scoreOf(best) ? step : best));
    ordered.push(next);
    placedIds.add(next.id);
    remaining = remaining.filter((step) => step !== next);
  }

  return ordered;
}
