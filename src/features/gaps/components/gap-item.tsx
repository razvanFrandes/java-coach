import { Badge } from '@/components/ui/badge';
import { SKILL_AREA_LABELS, type Gap } from '@/domain/types';

interface GapItemProps {
  gap: Gap;
}

const SEVERITY_LABELS: Record<Gap['severity'], string> = { missing: 'Missing', weak: 'Weak' };

export function GapItem({ gap }: GapItemProps) {
  return (
    <li className="space-y-1.5 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{SKILL_AREA_LABELS[gap.area]}</h3>
        <Badge variant={gap.severity === 'missing' ? 'destructive' : 'secondary'}>
          {SEVERITY_LABELS[gap.severity]}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{gap.reason}</p>
    </li>
  );
}
