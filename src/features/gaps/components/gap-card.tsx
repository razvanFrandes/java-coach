import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SKILL_AREA_LABELS } from '@/lib/labels';
import type { Gap } from '@/types/api';

interface GapCardProps {
  gap: Gap;
}

export function GapCard({ gap }: GapCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{SKILL_AREA_LABELS[gap.area]}</CardTitle>
        <CardAction>
          {gap.severity === 'missing' ? (
            <Badge variant="destructive">Missing</Badge>
          ) : (
            <Badge variant="secondary">Weak</Badge>
          )}
        </CardAction>
        <CardDescription>{gap.reason}</CardDescription>
      </CardHeader>
    </Card>
  );
}
