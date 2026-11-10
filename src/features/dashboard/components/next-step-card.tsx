import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LearningStep } from '@/types/api';

interface NextStepCardProps {
  /** The next step, or undefined when there is none left. */
  step: LearningStep | undefined;
  /** Whether the path has steps at all: tells "all done" apart from "nothing to do". */
  hasSteps: boolean;
  onDone: (stepId: string) => void;
}

export function NextStepCard({ step, hasSteps, onDone }: NextStepCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next step</CardTitle>
        {!step && (
          <CardDescription>
            {hasSteps ? 'You have finished every step.' : 'No steps needed.'}
          </CardDescription>
        )}
      </CardHeader>
      {step && (
        <>
          <CardContent className="space-y-2">
            <p className="font-medium">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.goal}</p>
            <Badge variant="outline">
              <Clock />
              {step.effortHours} h
            </Badge>
          </CardContent>
          <CardFooter>
            <Button size="sm" onClick={() => onDone(step.id)}>
              Mark as done
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
