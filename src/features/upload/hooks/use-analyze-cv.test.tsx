import { act, renderHook, waitFor } from '@testing-library/react';
import type { Services } from '@/app/services';
import type { CoachReport } from '@/domain/types';
import { useCoachReport } from '@/features/coach-report/hooks/use-coach-report';
import { sampleReport } from '@/test/fixtures/coach-report';
import { CV_TEXT, makeFile } from '@/test/fixtures/files';
import { deferred } from '@/test/deferred';
import { createWrapper } from '@/test/render';
import { useAnalyzeCv } from './use-analyze-cv';

function renderUploadHook(services: Partial<Services>) {
  return renderHook(() => ({ upload: useAnalyzeCv(), report: useCoachReport() }), {
    wrapper: createWrapper({ services }),
  });
}

describe('useAnalyzeCv', () => {
  it('AC14/AC15: reads, analyses and stores the report, reporting each stage', async () => {
    const text = deferred<string>();
    const report = deferred<CoachReport>();
    const extractCvText = vi.fn(() => text.promise);
    const analyzeCv = vi.fn(() => report.promise);
    const { result } = renderUploadHook({ extractCvText, coach: { analyzeCv } });
    const file = makeFile();

    expect(result.current.upload.status).toBe('idle');
    act(() => result.current.upload.analyze(file));

    await waitFor(() => expect(result.current.upload.status).toBe('reading'));
    expect(extractCvText).toHaveBeenCalledWith(file);

    act(() => text.resolve(CV_TEXT));
    await waitFor(() => expect(result.current.upload.status).toBe('analyzing'));
    expect(analyzeCv).toHaveBeenCalledWith(CV_TEXT);

    act(() => report.resolve(sampleReport));
    await waitFor(() => expect(result.current.upload.status).toBe('success'));
    expect(result.current.report).toEqual(sampleReport);
  });

  it('AC16: rejects an invalid file without reading it', async () => {
    const extractCvText = vi.fn();
    const { result } = renderUploadHook({ extractCvText });

    act(() => result.current.upload.analyze(makeFile({ name: 'cv.png', type: 'image/png' })));

    await waitFor(() => expect(result.current.upload.status).toBe('error'));
    expect(result.current.upload.errorMessage).toBe('Only PDF files are supported.');
    expect(extractCvText).not.toHaveBeenCalled();
  });

  it('AC18: rejects a PDF without text without calling the coach', async () => {
    const analyzeCv = vi.fn();
    const { result } = renderUploadHook({
      extractCvText: () => Promise.resolve('   '),
      coach: { analyzeCv },
    });

    act(() => result.current.upload.analyze(makeFile()));

    await waitFor(() => expect(result.current.upload.status).toBe('error'));
    expect(result.current.upload.errorMessage).toMatch(/could not find any text/);
    expect(analyzeCv).not.toHaveBeenCalled();
  });

  it('AC20: reset clears the error', async () => {
    const { result } = renderUploadHook({});

    act(() => result.current.upload.analyze(makeFile({ sizeBytes: 0 })));
    await waitFor(() => expect(result.current.upload.status).toBe('error'));

    act(() => result.current.upload.reset());

    await waitFor(() => expect(result.current.upload.status).toBe('idle'));
    expect(result.current.upload.errorMessage).toBeNull();
  });
});
