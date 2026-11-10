import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SKILL_LEVEL_LABELS } from '@/domain/skill-level';
import { SKILL_AREA_LABELS, type SkillRating } from '@/domain/types';

interface SkillRatingCardProps {
  rating: SkillRating;
}

export function SkillRatingCard({ rating }: SkillRatingCardProps) {
  const titleId = useId();
  const evidenceId = useId();
  const label = SKILL_AREA_LABELS[rating.area];

  return (
    <article aria-labelledby={titleId} className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 id={titleId} className="font-medium">
          {label}
        </h3>
        <Badge variant={rating.level === 'none' ? 'outline' : 'secondary'}>
          {SKILL_LEVEL_LABELS[rating.level]}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={rating.score} aria-label={`${label} score`} className="flex-1" />
        <span className="text-sm tabular-nums text-muted-foreground">{rating.score}/100</span>
      </div>
      {rating.evidence.length > 0 ? (
        <div className="space-y-1">
          <p
            id={evidenceId}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Evidence
          </p>
          <ul aria-labelledby={evidenceId} className="flex flex-wrap gap-1.5">
            {rating.evidence.map((item) => (
              <li key={item} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing in your CV mentions this yet.</p>
      )}
    </article>
  );
}
