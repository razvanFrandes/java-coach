import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LearningStep } from '@/domain/types';

interface NextStepCardProps {
  /** The next step, or undefined when there is none left. */
  step: LearningStep | undefined;
  /** Whether the path has any steps at all (distinguishes "all done" from "nothing to do"). */
  hasSteps: boolean;
  onDone: (stepId: string) => void;
}

export function NextStepCard({ step, hasSteps, onDone }: NextStepCardProps) {
  if (!step) {
    return (
      <p className="text-muted-foreground">
        {hasSteps ? 'You have finished every step.' : 'No steps needed.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{step.title}</h3>
        <p className="text-sm text-muted-foreground">{step.goal}</p>
      </div>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock aria-hidden className="size-3.5" />
        <span>{step.effortHours} h</span>
      </p>
      <Button size="sm" onClick={() => onDone(step.id)}>
        Mark as done
      </Button>
    </div>
  );
}
