import { PageHeader } from '@/components/page-header';
import { CvDropzone } from '@/features/upload/components/cv-dropzone';
import { UploadError } from '@/features/upload/components/upload-error';
import { UploadProgress } from '@/features/upload/components/upload-progress';
import { useCvUpload } from '@/features/upload/hooks/use-cv-upload';

export function UploadRoute() {
  const { upload, reset, status, error, isBusy } = useCvUpload();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Upload your CV"
        description="The coach reads your CV, rates your Java skills by area and builds a learning path."
      />
      <CvDropzone onFile={upload} disabled={isBusy} />
      {(status === 'reading' || status === 'analyzing') && <UploadProgress status={status} />}
      {error && <UploadError message={error} onRetry={reset} />}
    </div>
  );
}
