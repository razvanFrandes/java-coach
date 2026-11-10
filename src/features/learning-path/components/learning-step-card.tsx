import { useId } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SKILL_AREA_LABELS, type LearningStep } from '@/domain/types';
import { cn } from '@/lib/utils';

interface LearningStepCardProps {
  position: number;
  step: LearningStep;
  done: boolean;
  prerequisiteTitles: string[];
  onToggle: (stepId: string) => void;
}

export function LearningStepCard({
  position,
  step,
  done,
  prerequisiteTitles,
  onToggle,
}: LearningStepCardProps) {
  const checkboxId = useId();
  const titleId = useId();

  return (
    <li
      aria-labelledby={titleId}
      className={cn('flex gap-4 rounded-xl border bg-card p-5', done && 'bg-muted/50')}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
          done ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        {position}
      </span>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={titleId}
            className={cn('font-medium', done && 'text-muted-foreground line-through')}
          >
            {step.title}
          </h3>
          <Badge variant="outline">{SKILL_AREA_LABELS[step.area]}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock aria-hidden className="size-3" />
            {step.effortHours} h
          </span>
        </div>
        <p className="text-sm">{step.goal}</p>
        <ul aria-label="Topics" className="flex flex-wrap gap-1.5">
          {step.topics.map((topic) => (
            <li key={topic} className="rounded-md bg-muted px-2 py-0.5 text-xs">
              {topic}
            </li>
          ))}
        </ul>
        <p className="text-sm">
          <span className="font-medium">Exercise: </span>
          {step.exercise}
        </p>
        {prerequisiteTitles.length > 0 && (
          <p className="text-xs text-muted-foreground">After: {prerequisiteTitles.join(', ')}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id={checkboxId}
            checked={done}
            onCheckedChange={() => onToggle(step.id)}
            aria-label={`Mark ${step.title} as done`}
          />
          <label htmlFor={checkboxId} className="text-sm text-muted-foreground" aria-hidden>
            Done
          </label>
        </div>
      </div>
    </li>
  );
}
