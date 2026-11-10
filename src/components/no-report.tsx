import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

/** Shown by every page that needs a report when no CV was analysed yet. */
export function NoReport() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>No CV analysed yet</EmptyTitle>
        <EmptyDescription>
          Upload your CV and the coach will rate your Java skills and build a learning path.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/upload">Upload your CV</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
