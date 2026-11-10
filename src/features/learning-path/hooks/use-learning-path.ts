import { useMemo } from 'react';
import { orderLearningPath } from '@/domain/learning-path';
import { findNextStep, summarizeProgress } from '@/domain/progress';
import { rateSkills } from '@/domain/rate-skills';
import type { LearningStep } from '@/domain/types';
import { useCoachReport } from '@/features/coach-report/hooks/use-coach-report';
import { useLearningProgressStore } from '../model/learning-progress-store';

export interface PathStepView {
  step: LearningStep;
  done: boolean;
  prerequisiteTitles: string[];
}

/**
 * The learning path for the current report: ordered steps, progress and the next step.
 * Combines server state (the report, TanStack Query) with client state (progress, Zustand).
 */
export function useLearningPath() {
  const report = useCoachReport();
  const completedStepIds = useLearningProgressStore((state) => state.completedStepIds);
  const toggleStep = useLearningProgressStore((state) => state.toggleStep);

  const orderedSteps = useMemo(
    () => (report ? orderLearningPath(report.steps, rateSkills(report)) : undefined),
    [report],
  );

  return useMemo(() => {
    if (!orderedSteps) return undefined;
    const titleById = new Map(orderedSteps.map((s) => [s.id, s.title]));
    const steps: PathStepView[] = orderedSteps.map((step) => ({
      step,
      done: completedStepIds.includes(step.id),
      prerequisiteTitles: step.prerequisites.flatMap((id) => titleById.get(id) ?? []),
    }));
    return {
      steps,
      progress: summarizeProgress(orderedSteps, completedStepIds),
      nextStep: findNextStep(orderedSteps, completedStepIds),
      toggleStep,
    };
  }, [orderedSteps, completedStepIds, toggleStep]);
}
