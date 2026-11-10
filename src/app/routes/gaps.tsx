import { Link } from 'react-router';
import { NoReport } from '@/components/no-report';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { GapCard } from '@/features/gaps/components/gap-card';
import { useCoachReport } from '@/hooks/use-coach-report';
import { SKILL_AREA_LABELS } from '@/lib/labels';

export function GapsRoute() {
  const report = useCoachReport();
  if (!report) return <NoReport />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gaps to work on"
        description="Areas your CV does not show yet, or only at a beginner level. Most urgent first."
        actions={
          <Button asChild variant="outline">
            <Link to="/path">See your learning path</Link>
          </Button>
        }
      />
      {report.gaps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No gaps found. Every area is at least intermediate.</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <ul aria-label="Gaps" className="grid gap-4 md:grid-cols-2">
          {report.gaps.map((gap) => (
            <li key={gap.area} aria-label={SKILL_AREA_LABELS[gap.area]}>
              <GapCard gap={gap} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
