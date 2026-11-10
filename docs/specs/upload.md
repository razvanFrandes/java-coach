# Upload

The user gives the coach their CV as a PDF, by dragging it onto the page or picking it with a
file browser. The browser checks the file and extracts its text, sends the text to the server
and keeps the report it gets back. While this happens the user sees which stage is running.
When something goes wrong the user sees what went wrong and can try again.

## Acceptance criteria

### File rules (`src/features/upload/utils/validate-cv.ts`)

1. `getCvFileError(file)` accepts a file whose type is `application/pdf`, or whose type is
   empty and whose name ends with `.pdf` (any case). Anything else returns
   "Only PDF files are supported."
2. A file of 0 bytes returns "This file is empty."
3. A file larger than 5 MB (5 × 1024 × 1024 bytes) returns "This file is larger than 5 MB."
   Exactly 5 MB is accepted. A valid file returns `null`.
4. `getCvTextError(text)` returns "We could not find any text in this PDF. Is it a scanned
   image? Export your CV as a text PDF and try again." when the text has fewer than 50
   non-whitespace characters, and `null` otherwise.

### API (`src/lib/api-client.ts`, `src/features/upload/api/analyze-cv.ts`)

5. `analyzeCv(cvText)` sends `POST /api/coach/analyze` with `{ "cvText": "..." }` and returns
   the `report` from the response.
6. When the server answers with an error status, the call fails with the server's
   `error.message`, or with "The server answered with status <status>." when the error body
   is not in the contract's format. When the server cannot be reached it fails with
   "Could not reach the coach server."
7. When `useAnalyzeCv` succeeds, the report is stored in the `['coach-report']` query.

### PDF text (`src/lib/extract-pdf-text.ts`)

8. `extractPdfText` returns the text of a real PDF, one line per text row. It rejects files
   that are not valid PDFs.

### Upload page (`/upload`)

9. The page shows a drop zone with "Drag your CV here" and a "Choose a PDF" file input.
10. Picking or dropping a valid PDF shows the progress, first "Reading your CV" and then
    "The coach is analysing your CV".
11. When the analysis finishes, the user is taken to the dashboard (`/`).
12. An invalid file shows the message from AC1-AC3. Nothing is extracted or sent.
13. A PDF that cannot be read shows "We could not read this PDF. It may be damaged or
    password-protected."
14. A PDF without text shows the message from AC4.
15. A server failure shows "The coach could not analyse your CV: <reason>".
16. After any error, "Try again" clears the message and the user can pick another file.
17. While a file is being processed the file input is disabled.
18. When several files are dropped, only the first one is used.

### Mock mode (`src/mocks/handlers.ts`)

19. With `VITE_ENABLE_API_MOCKING=true` the browser answers `POST /api/coach/analyze` itself
    (MSW) with the sample report from `src/mocks/data/coach-report.ts`, so the frontend runs
    without the server.

## Out of scope

- Several CVs and history (the server keeps every analysis; the UI shows the latest report).
- Formats other than PDF.
