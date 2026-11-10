import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAnalyzeCv } from '../hooks/use-analyze-cv';
import { CvDropzone } from './cv-dropzone';
import { UploadProgress } from './upload-progress';

export function UploadPage() {
  const { analyze, status, errorMessage, reset } = useAnalyzeCv();
  const navigate = useNavigate();
  const isBusy = status === 'reading' || status === 'analyzing';

  useEffect(() => {
    if (status === 'success') void navigate('/');
  }, [status, navigate]);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Upload your CV</h1>
        <p className="text-muted-foreground">
          The coach reads your CV, rates your Java skills by area and builds a learning path.
        </p>
      </header>

      <CvDropzone onFile={analyze} disabled={isBusy} />

      {isBusy && <UploadProgress status={status} />}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>
            <p>{errorMessage}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
