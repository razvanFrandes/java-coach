import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface UploadProgressProps {
  status: 'reading' | 'analyzing';
}

const LABELS = {
  reading: 'Reading your CV',
  analyzing: 'The coach is analysing your CV',
};

export function UploadProgress({ status }: UploadProgressProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <Spinner />
        <span className="font-medium">{LABELS[status]}</span>
      </CardContent>
    </Card>
  );
}
