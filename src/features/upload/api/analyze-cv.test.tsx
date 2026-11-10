import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { coachReportQueryKey } from '@/hooks/use-coach-report';
import { sampleReport } from '@/mocks/data/coach-report';
import { CV_TEXT } from '@/testing/fixtures/files';
import { server } from '@/testing/server';
import { createWrapper } from '@/testing/test-utils';
import { analyzeCv, useAnalyzeCv } from './analyze-cv';

describe('analyzeCv', () => {
  it('AC5: posts the CV text to /api/coach/analyze and returns the report', async () => {
    let body: unknown;
    server.use(
      http.post('/api/coach/analyze', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ report: sampleReport, cached: false });
      }),
    );

    await expect(analyzeCv(CV_TEXT)).resolves.toEqual(sampleReport);
    expect(body).toEqual({ cvText: CV_TEXT });
  });
});

describe('useAnalyzeCv', () => {
  it('AC7: stores the report in the coach-report query when it succeeds', async () => {
    const { result } = renderHook(
      () => ({ mutation: useAnalyzeCv(), queryClient: useQueryClient() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.mutation.mutate(CV_TEXT));

    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true));
    expect(result.current.queryClient.getQueryData(coachReportQueryKey)).toEqual(sampleReport);
  });
});
