import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/app/services';
import { validateCvFile, validateCvText } from '@/domain/cv-file-rules';
import type { CoachReport } from '@/domain/types';
import { coachReportQueryKey } from '@/features/coach-report/api/coach-report-query';
import { UploadError } from '../model/upload-error';
import type { UploadStatus } from '../model/upload-status';

/**
 * Runs one CV through the pipeline: validate -> extract text -> ask the coach -> store the report.
 * The mutation tracks success/error; `stage` only says which of the two slow steps is running.
 */
export function useAnalyzeCv() {
  const { coach, extractCvText } = useServices();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<'reading' | 'analyzing'>('reading');

  const mutation = useMutation<CoachReport, UploadError, File>({
    mutationFn: async (file) => {
      const fileProblem = validateCvFile(file);
      if (fileProblem) throw new UploadError(fileProblem);

      setStage('reading');
      const text = await extractCvText(file).catch((cause: unknown) => {
        throw new UploadError('unreadable-pdf', cause);
      });
      const textProblem = validateCvText(text);
      if (textProblem) throw new UploadError(textProblem);

      setStage('analyzing');
      return coach.analyzeCv(text).catch((cause: unknown) => {
        throw new UploadError('coach-failed', cause);
      });
    },
    onSuccess: (report) => queryClient.setQueryData(coachReportQueryKey, report),
  });

  const status: UploadStatus = mutation.isPending ? stage : mutation.status;

  return {
    analyze: (file: File) => mutation.mutate(file),
    status,
    errorMessage: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}
