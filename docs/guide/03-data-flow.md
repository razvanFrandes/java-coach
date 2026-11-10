# Data flow

This page follows one CV from the moment it is dropped on the page to the moment the dashboard
shows the result.

```text
CvDropzone ──file──> useCvUpload ──text──> useAnalyzeCv ──POST /api/coach/analyze──> server
                        │                                                                │
                  extractPdfText                                   routes -> controller -> service
                  (pdf.js, in the browser)                         (SQLite cache, Codex, rules)
                                                                                         │
DashboardRoute <── useCoachReport <── TanStack Query cache ['coach-report'] <── report ──┘
```

## 1. The view hands over the file

`CvDropzone` only knows how to receive a file, by drag-and-drop or the file input. It calls
`onFile` and that is all: checking the file is not its job.

```tsx
// src/features/upload/components/cv-dropzone.tsx
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  }
```

## 2. The controller hook runs the steps

`useCvUpload` is the controller. It checks the file, reads the text, sends it, and moves to the
dashboard. Every failure becomes a message the page can show.

```ts
// src/features/upload/hooks/use-cv-upload.ts
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
```

The PDF itself never leaves the browser: `extractPdfText` (in `src/lib`) uses pdf.js to read
the text, and only the text is sent.

## 3. The API call

The feature's `api/` folder holds the request and its TanStack Query mutation. When the server
answers, the report is put in the query cache under `['coach-report']`.

```ts
// src/features/upload/api/analyze-cv.ts
export async function analyzeCv(cvText: string): Promise<CoachReport> {
  const { report } = await apiPost<AnalyzeCvResponse>('/api/coach/analyze', { cvText });
  return report;
}

/** The same call as a TanStack Query mutation. On success the report goes into the cache. */
export function useAnalyzeCv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeCv,
    onSuccess: (report) => queryClient.setQueryData(coachReportQueryKey, report),
  });
}
```

`apiPost` in `src/lib/api-client.ts` is the only place that calls `fetch`. It turns the server's
`{ error: { code, message } }` into a normal `Error` with that message.

## 4. On the server

In development Vite forwards `/api/...` to the Express server on port 3001. There the request
goes **route -> controller -> service -> model** (see [Backend](/docs/backend)):

```ts
// server/src/services/coach.service.ts
export async function analyzeCv(cvText: string): Promise<AnalyzeResult> {
  const text = cvText.trim();
  const cvHash = createHash('sha256').update(text).digest('hex');

  const saved = findAnalysisByHash(cvHash);
  if (saved) return { report: saved.report, cached: true };

  const report = buildReport(await askCodex(text));
  saveAnalysis({ cvHash, report, createdAt: new Date().toISOString() });
  return { report, cached: false };
}
```

The server sends back a report that is ready to show: the levels, the gaps and the order of the
learning path are already computed. The browser does not repeat those rules.

## 5. Every page reads the same cache

Pages read the report with one shared hook. It never fetches: the report only gets into the
cache through the upload.

```ts
// src/hooks/use-coach-report.ts
export function useCoachReport(): CoachReport | undefined {
  const { data } = useQuery<CoachReport>({ queryKey: coachReportQueryKey, queryFn: skipToken });
  return data;
}
```

A page then decides what to show:

```tsx
// src/app/routes/profile.tsx
export function ProfileRoute() {
  const report = useCoachReport();
  if (!report) return <NoReport />;
```

## Mock mode

With `VITE_ENABLE_API_MOCKING=true`, `src/main.tsx` starts MSW before the app. MSW catches
`POST /api/coach/analyze` in the browser and answers with `src/mocks/data/coach-report.ts`.
Nothing else changes: the same hooks, the same `fetch`. The tests use the very same handlers.

```ts
// src/mocks/handlers.ts
export const handlers = [
  http.post('/api/coach/analyze', async () => {
    await delay(); // a realistic pause in the browser, none in tests
    return HttpResponse.json<AnalyzeCvResponse>({ report: sampleReport, cached: false });
  }),
];
```
