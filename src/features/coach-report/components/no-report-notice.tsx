import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

/** Shown by every page that needs a CoachReport when none exists yet. */
export function NoReportNotice() {
  return (
    <div className="mx-auto max-w-md space-y-3 rounded-xl border bg-card p-8 text-center">
      <h2 className="text-lg font-semibold">No CV analysed yet</h2>
      <p className="text-sm text-muted-foreground">
        Upload your CV and the coach will rate your Java skills and build a learning path.
      </p>
      <Button asChild>
        <Link to="/upload">Upload your CV</Link>
      </Button>
    </div>
  );
}
