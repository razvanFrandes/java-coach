import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SKILL_AREA_LABELS, SKILL_LEVEL_LABELS } from '@/lib/labels';
import type { SkillRating } from '@/types/api';

interface SkillCardProps {
  skill: SkillRating;
}

export function SkillCard({ skill }: SkillCardProps) {
  const label = SKILL_AREA_LABELS[skill.area];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardAction>
          <Badge variant={skill.level === 'none' ? 'outline' : 'secondary'}>
            {SKILL_LEVEL_LABELS[skill.level]}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Progress value={skill.score} aria-label={`${label} score`} />
          <span className="text-sm text-muted-foreground">{skill.score}/100</span>
        </div>
        {skill.evidence.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skill.evidence.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing in your CV mentions this yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
