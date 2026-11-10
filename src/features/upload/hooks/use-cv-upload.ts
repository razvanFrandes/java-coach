import { useState } from 'react';
import { useNavigate } from 'react-router';
import { extractPdfText } from '@/lib/extract-pdf-text';
import { useAnalyzeCv } from '../api/analyze-cv';
import { getCvFileError, getCvTextError } from '../utils/validate-cv';

export type UploadStatus = 'idle' | 'reading' | 'analyzing' | 'error';

/**
 * Everything that happens after the user picks a CV:
 * check the file -> read its text -> send it to the server -> open the dashboard.
 * The page only shows `status` and `error`; it makes no decisions itself.
 */
export function useCvUpload() {
  const navigate = useNavigate();
  const analyzeCv = useAnalyzeCv();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  function fail(message: string) {
    setError(message);
    setStatus('error');
  }

  async function upload(file: File) {
    const fileError = getCvFileError(file);
    if (fileError) return fail(fileError);

    setStatus('reading');
    let text: string;
    try {
      text = await extractPdfText(file);
    } catch {
      return fail('We could not read this PDF. It may be damaged or password-protected.');
    }
    const textError = getCvTextError(text);
    if (textError) return fail(textError);

    setStatus('analyzing');
    analyzeCv.mutate(text, {
      onSuccess: () => navigate('/'),
      onError: (error) => fail(`The coach could not analyse your CV: ${error.message}`),
    });
  }

  function reset() {
    setError(null);
    setStatus('idle');
  }

  return {
    upload,
    reset,
    status,
    error,
    isBusy: status === 'reading' || status === 'analyzing',
  };
}
