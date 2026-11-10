import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UploadErrorProps {
  message: string;
  onRetry: () => void;
}

export function UploadError({ message, onRetry }: UploadErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Upload failed</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
