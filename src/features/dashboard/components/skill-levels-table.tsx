import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SKILL_AREA_LABELS, SKILL_LEVEL_LABELS } from '@/lib/labels';
import type { SkillRating } from '@/types/api';

interface SkillLevelsTableProps {
  skills: SkillRating[];
}

export function SkillLevelsTable({ skills }: SkillLevelsTableProps) {
  return (
    <Table aria-label="Skill levels">
      <TableHeader>
        <TableRow>
          <TableHead>Area</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skills.map((skill) => {
          const label = SKILL_AREA_LABELS[skill.area];
          return (
            <TableRow key={skill.area}>
              <TableCell>{label}</TableCell>
              <TableCell className="w-1/2">
                <Progress value={skill.score} aria-label={`${label} score`} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {SKILL_LEVEL_LABELS[skill.level]}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
