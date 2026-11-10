import { Progress } from '@/components/ui/progress';
import { SKILL_LEVEL_LABELS } from '@/domain/skill-level';
import { SKILL_AREA_LABELS, type SkillRating } from '@/domain/types';

interface SkillLevelsOverviewProps {
  ratings: SkillRating[];
}

/** A compact table: area, score bar, level. */
export function SkillLevelsOverview({ ratings }: SkillLevelsOverviewProps) {
  return (
    <table className="w-full text-sm">
      <thead className="sr-only">
        <tr>
          <th scope="col">Area</th>
          <th scope="col">Score</th>
          <th scope="col">Level</th>
        </tr>
      </thead>
      <tbody>
        {ratings.map((rating) => {
          const label = SKILL_AREA_LABELS[rating.area];
          return (
            <tr key={rating.area}>
              <th scope="row" className="w-40 py-1.5 pr-3 text-left font-normal">
                {label}
              </th>
              <td className="py-1.5">
                <Progress value={rating.score} aria-label={`${label} score`} />
              </td>
              <td className="w-28 py-1.5 pl-3 text-right text-muted-foreground">
                {SKILL_LEVEL_LABELS[rating.level]}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
