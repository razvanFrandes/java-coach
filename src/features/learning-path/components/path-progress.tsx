import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PathProgressProps {
  completed: number;
  total: number;
  percent: number;
  remainingHours: number;
}

export function PathProgress({ completed, total, percent, remainingHours }: PathProgressProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {completed} of {total} steps done
          </span>
          <span className="text-muted-foreground">{remainingHours} h to go</span>
        </div>
        <Progress value={percent} aria-label="Learning path progress" />
      </CardContent>
    </Card>
  );
}
