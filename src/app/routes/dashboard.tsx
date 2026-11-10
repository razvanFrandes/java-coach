import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { NextStepCard } from '@/features/dashboard/components/next-step-card';
import { SkillLevelsTable } from '@/features/dashboard/components/skill-levels-table';
import { useLearningPath } from '@/features/learning-path/hooks/use-learning-path';
import { useCoachReport } from '@/hooks/use-coach-report';

export function DashboardRoute() {
  const report = useCoachReport();
  const path = useLearningPath();
  if (!report || !path) return <Welcome />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={report.summary}
        actions={
          <Button asChild variant="outline">
            <Link to="/upload">Analyse another CV</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 lg:row-span-3">
          <CardHeader>
            <CardTitle>Skill levels</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillLevelsTable skills={report.skills} />
          </CardContent>
        </Card>

        <NextStepCard
          step={path.nextStep}
          hasSteps={path.steps.length > 0}
          onDone={path.toggleStep}
        />

        <Card>
          <CardHeader>
            <CardTitle>Learning path</CardTitle>
            <CardDescription>
              {path.progress.completed} of {path.progress.total} steps done
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={path.progress.percent} aria-label="Learning path progress" />
            <p className="text-sm text-muted-foreground">{path.progress.remainingHours} h to go</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="link" className="px-0">
              <Link to="/path">Open learning path</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gaps</CardTitle>
            <CardDescription>{describeGapCount(report.gaps.length)}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="link" className="px-0">
              <Link to="/gaps">See all gaps</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function describeGapCount(count: number): string {
  if (count === 0) return 'No gaps';
  return count === 1 ? '1 gap to work on' : `${count} gaps to work on`;
}

function Welcome() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GraduationCap />
        </EmptyMedia>
        <EmptyTitle>Welcome to Java Coach</EmptyTitle>
        <EmptyDescription>
          Upload your CV and an AI coach will rate your Java skills in nine areas, point out the
          gaps and give you an ordered learning path with exercises.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button asChild>
          <Link to="/upload">Upload your CV</Link>
        </Button>
        <Button asChild variant="outline">
          <a href="/sample-cv.pdf" download>
            Download a sample CV
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
