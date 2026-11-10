import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  status: 'reading' | 'analyzing';
}

const STAGES = {
  reading: { label: 'Reading your CV', value: 30 },
  analyzing: { label: 'The coach is analysing your CV', value: 70 },
};

export function UploadProgress({ status }: UploadProgressProps) {
  const stage = STAGES[status];
  return (
    <div className="space-y-3 rounded-xl border bg-card p-6">
      <p role="status" className="flex items-center gap-2 font-medium">
        <Loader2 aria-hidden className="size-4 animate-spin text-primary" />
        {stage.label}
      </p>
      <Progress value={stage.value} aria-label="Upload progress" />
    </div>
  );
}
