import { useId } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SKILL_AREA_LABELS } from '@/lib/labels';
import type { PathStep } from '../hooks/use-learning-path';

interface LearningStepCardProps {
  position: number;
  pathStep: PathStep;
  onToggle: (stepId: string) => void;
}

export function LearningStepCard({ position, pathStep, onToggle }: LearningStepCardProps) {
  const { step, done, prerequisiteTitles } = pathStep;
  const checkboxId = useId();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Badge variant={done ? 'default' : 'outline'}>{position}</Badge>
          <span>{step.title}</span>
        </CardTitle>
        <CardDescription>{step.goal}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Badge variant="secondary">{SKILL_AREA_LABELS[step.area]}</Badge>
          <Badge variant="outline">
            <Clock />
            {step.effortHours} h
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {step.topics.map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
        <p className="text-sm">
          <span className="font-medium">Exercise: </span>
          {step.exercise}
        </p>
        {prerequisiteTitles.length > 0 && (
          <p className="text-sm text-muted-foreground">After: {prerequisiteTitles.join(', ')}</p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Checkbox
          id={checkboxId}
          checked={done}
          onCheckedChange={() => onToggle(step.id)}
          aria-label={`Mark ${step.title} as done`}
        />
        <Label htmlFor={checkboxId} aria-hidden>
          Done
        </Label>
      </CardFooter>
    </Card>
  );
}
