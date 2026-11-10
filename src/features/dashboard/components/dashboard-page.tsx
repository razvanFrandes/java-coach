import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGaps } from '@/features/gaps/hooks/use-gaps';
import { useLearningPath } from '@/features/learning-path/hooks/use-learning-path';
import { useSkillRatings } from '@/features/profile/hooks/use-skill-ratings';
import { cn } from '@/lib/utils';
import { NextStepCard } from './next-step-card';
import { SkillLevelsOverview } from './skill-levels-overview';

export function DashboardPage() {
  const profile = useSkillRatings();
  const gaps = useGaps();
  const path = useLearningPath();

  if (!profile || !gaps || !path) return <Welcome />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-3xl text-muted-foreground">{profile.summary}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/upload">Analyse another CV</Link>
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Skill levels" className="lg:col-span-2 lg:row-span-3">
          <SkillLevelsOverview ratings={profile.ratings} />
        </Panel>

        <Panel title="Next step">
          <NextStepCard
            step={path.nextStep}
            hasSteps={path.steps.length > 0}
            onDone={path.toggleStep}
          />
        </Panel>

        <Panel title="Learning path">
          <p className="text-sm font-medium">
            {path.progress.completed} of {path.progress.total} steps done
          </p>
          <Progress value={path.progress.percent} aria-label="Learning path progress" />
          <p className="text-sm text-muted-foreground">{path.progress.remainingHours} h to go</p>
          <Link to="/path" className="text-sm font-medium text-primary hover:underline">
            Open learning path
          </Link>
        </Panel>

        <Panel title="Gaps">
          <p className="text-sm font-medium">{describeGapCount(gaps.length)}</p>
          <Link to="/gaps" className="text-sm font-medium text-primary hover:underline">
            See all gaps
          </Link>
        </Panel>
      </div>
    </div>
  );
}

function describeGapCount(count: number): string {
  if (count === 0) return 'No gaps';
  return count === 1 ? '1 gap to work on' : `${count} gaps to work on`;
}

function Panel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn('space-y-3 rounded-xl border bg-card p-5', className)}
    >
      <h2
        id={headingId}
        className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Welcome() {
  return (
    <section className="mx-auto max-w-2xl space-y-6 py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome to Java Coach</h1>
      <p className="text-lg text-muted-foreground">
        Upload your CV and an AI coach will rate your Java skills in nine areas, point out the gaps
        and give you an ordered learning path with exercises.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/upload">Upload your CV</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="/sample-cv.pdf" download>
            Download a sample CV
          </a>
        </Button>
      </div>
    </section>
  );
}
