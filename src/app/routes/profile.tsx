import { NoReport } from '@/components/no-report';
import { PageHeader } from '@/components/page-header';
import { SkillCard } from '@/features/profile/components/skill-card';
import { useCoachReport } from '@/hooks/use-coach-report';
import { SKILL_AREA_LABELS } from '@/lib/labels';

export function ProfileRoute() {
  const report = useCoachReport();
  if (!report) return <NoReport />;

  return (
    <div className="space-y-6">
      <PageHeader title="Your Java profile" description={report.summary} />
      <ul aria-label="Skills" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {report.skills.map((skill) => (
          <li key={skill.area} aria-label={SKILL_AREA_LABELS[skill.area]}>
            <SkillCard skill={skill} />
          </li>
        ))}
      </ul>
    </div>
  );
}
