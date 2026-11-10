import { useCoachReport } from '@/hooks/use-coach-report';
import type { LearningStep } from '@/types/api';
import { useProgressStore } from '../stores/progress-store';

export interface PathStep {
  step: LearningStep;
  done: boolean;
  prerequisiteTitles: string[];
}

/**
 * The learning path for the current report, joined with the user's saved progress.
 * Server state (the report) + client state (which steps are done) = what the page shows.
 * Returns undefined before any CV was analysed.
 */
export function useLearningPath() {
  const report = useCoachReport();
  const completedStepIds = useProgressStore((state) => state.completedStepIds);
  const toggleStep = useProgressStore((state) => state.toggleStep);

  if (!report) return undefined;

  const titleById = new Map(report.learningPath.map((step) => [step.id, step.title]));
  const steps: PathStep[] = report.learningPath.map((step) => ({
    step,
    done: completedStepIds.includes(step.id),
    prerequisiteTitles: step.prerequisites.flatMap((id) => titleById.get(id) ?? []),
  }));

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const remainingHours = steps
    .filter((s) => !s.done)
    .reduce((hours, s) => hours + s.step.effortHours, 0);

  return {
    steps,
    progress: {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      remainingHours,
    },
    nextStep: steps.find((s) => !s.done)?.step,
    toggleStep,
  };
}
