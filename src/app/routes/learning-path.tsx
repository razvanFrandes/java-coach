import { NoReport } from '@/components/no-report';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningStepCard } from '@/features/learning-path/components/learning-step-card';
import { PathProgress } from '@/features/learning-path/components/path-progress';
import { useLearningPath } from '@/features/learning-path/hooks/use-learning-path';

export function LearningPathRoute() {
  const path = useLearningPath();
  if (!path) return <NoReport />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your learning path"
        description="Prerequisites first, then your weakest areas. Tick a step when you have finished it."
      />
      {path.steps.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No steps needed. Every area is already advanced.</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <>
          <PathProgress {...path.progress} />
          <ol aria-label="Learning path" className="space-y-4">
            {path.steps.map((pathStep, index) => (
              <li key={pathStep.step.id} aria-label={pathStep.step.title}>
                <LearningStepCard
                  position={index + 1}
                  pathStep={pathStep}
                  onToggle={path.toggleStep}
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
