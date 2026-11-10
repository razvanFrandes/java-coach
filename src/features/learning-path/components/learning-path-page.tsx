import { Progress } from '@/components/ui/progress';
import { NoReportNotice } from '@/features/coach-report/components/no-report-notice';
import { useLearningPath } from '../hooks/use-learning-path';
import { LearningStepCard } from './learning-step-card';

export function LearningPathPage() {
  const path = useLearningPath();
  if (!path) return <NoReportNotice />;

  const { steps, progress, toggleStep } = path;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your learning path</h1>
        <p className="text-muted-foreground">
          Prerequisites first, then your weakest areas. Tick a step when you have finished it.
        </p>
      </header>

      {steps.length === 0 ? (
        <p className="rounded-xl border bg-card p-6">
          No steps needed. Every area is already advanced.
        </p>
      ) : (
        <>
          <div className="space-y-2 rounded-xl border bg-card p-5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {progress.completed} of {progress.total} steps done
              </span>
              <span className="text-muted-foreground">{progress.remainingHours} h to go</span>
            </div>
            <Progress value={progress.percent} aria-label="Learning path progress" />
          </div>
          <ol aria-label="Learning path" className="space-y-3">
            {steps.map(({ step, done, prerequisiteTitles }, index) => (
              <LearningStepCard
                key={step.id}
                position={index + 1}
                step={step}
                done={done}
                prerequisiteTitles={prerequisiteTitles}
                onToggle={toggleStep}
              />
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
