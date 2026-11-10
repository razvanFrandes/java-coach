import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { NoReportNotice } from '@/features/coach-report/components/no-report-notice';
import { useGaps } from '../hooks/use-gaps';
import { GapItem } from './gap-item';

export function GapsPage() {
  const gaps = useGaps();
  if (!gaps) return <NoReportNotice />;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Gaps to work on</h1>
          <p className="text-muted-foreground">
            Areas your CV does not show yet, or only at a beginner level. Most urgent first.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/path">See your learning path</Link>
        </Button>
      </header>

      {gaps.length === 0 ? (
        <p className="rounded-xl border bg-card p-6">
          No gaps found. Every area is at least intermediate.
        </p>
      ) : (
        <ul aria-label="Gaps" className="grid gap-3 md:grid-cols-2">
          {gaps.map((gap) => (
            <GapItem key={gap.area} gap={gap} />
          ))}
        </ul>
      )}
    </section>
  );
}
