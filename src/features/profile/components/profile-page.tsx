import { NoReportNotice } from '@/features/coach-report/components/no-report-notice';
import { useSkillRatings } from '../hooks/use-skill-ratings';
import { SkillRatingCard } from './skill-rating-card';

export function ProfilePage() {
  const profile = useSkillRatings();
  if (!profile) return <NoReportNotice />;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your Java profile</h1>
        <p className="max-w-3xl text-muted-foreground">{profile.summary}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.ratings.map((rating) => (
          <SkillRatingCard key={rating.area} rating={rating} />
        ))}
      </div>
    </section>
  );
}
