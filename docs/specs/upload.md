# Upload

The user gives the coach their CV as a PDF, by dragging it onto the page or picking it with a
file browser. The app checks the file, extracts its text in the browser, sends the text to the
coach and stores the resulting `CoachReport`. While this happens the user sees which stage is
running. When something goes wrong the user sees what went wrong and can try again.

## Acceptance criteria

### File rules (domain: `src/domain/cv-file-rules.ts`)

1. A file is accepted when its type is `application/pdf`, or when the type is empty and the
   name ends with `.pdf` (any case). Anything else is `not-pdf`.
2. A file of 0 bytes is `empty-file`.
3. A file larger than 5 MB (`MAX_CV_SIZE_BYTES` = 5 × 1024 × 1024) is `too-large`.
   Exactly 5 MB is accepted.
4. Extracted text with fewer than 50 non-whitespace characters is `no-text`
   (usually a scanned image).

### Coach services (infrastructure)

5. `MockCoachService.analyzeCv` returns a report with one assessment per skill area, scored
   from the keywords in the CV. The same text always gives the same report.
6. An area with no matching keywords has score 0 and no evidence. A matching keyword
   appears in that area's evidence.
7. The mock suggests learning steps only for areas below the advanced level, and every
   prerequisite refers to a step in the same report, or to a step the coach left out
   because that area is already covered.
8. The mock waits `latencyMs` (default 1200 ms) before answering, to feel like a real call.
9. `HttpCoachService.analyzeCv` sends `POST /api/coach/analyze` with `{ "cvText": "..." }` and
   returns the `report` from the response body.
10. When the server answers with an error status, `HttpCoachService` throws an error with the
    server's `error.message`. When the server cannot be reached, it throws
    "Could not reach the coach server."
11. `createServices('mock')` uses the mock coach and `createServices('http')` the HTTP coach.
    An unknown mode throws.

### PDF extraction (infrastructure)

12. `extractPdfText` returns the text of a real PDF, one line per text row. It rejects files
    that are not valid PDFs.

### Upload page (`/upload`)

13. The page shows a drop zone with "Drag your CV here" and a "Choose a PDF" file input.
14. Picking or dropping a valid PDF shows the progress, first "Reading your CV" and then
    "The coach is analysing your CV", with a progress bar.
15. When the analysis finishes the report is stored (the `['coach-report']` query) and the
    user is taken to the dashboard (`/`).
16. An invalid file shows a message saying why ("Only PDF files are supported.",
    "This file is larger than 5 MB.", "This file is empty."). Nothing is extracted or analysed.
17. A PDF that cannot be read shows "We could not read this PDF. It may be damaged or
    password-protected."
18. A PDF without text shows "We could not find any text in this PDF. Is it a scanned image?
    Export your CV as a text PDF and try again."
19. A coach failure shows "The coach could not analyse your CV: <reason>".
20. After any error, "Try again" clears the message and the user can pick another file.
21. While a file is being processed the file input is disabled.
22. When several files are dropped, only the first one is used.

## Out of scope

- Multiple CVs and history (the backend keeps history; the UI shows the latest report).
- Formats other than PDF.
