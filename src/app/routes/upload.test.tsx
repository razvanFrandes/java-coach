import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { useCoachReport } from '@/hooks/use-coach-report';
import { extractPdfText } from '@/lib/extract-pdf-text';
import { sampleReport } from '@/mocks/data/coach-report';
import { deferred } from '@/testing/deferred';
import { CV_TEXT, makeFile } from '@/testing/fixtures/files';
import { server } from '@/testing/server';
import { renderWithProviders } from '@/testing/test-utils';
import { UploadRoute } from './upload';

// Reading a real PDF is tested in src/lib/extract-pdf-text.test.ts. Here we decide what it returns.
vi.mock('@/lib/extract-pdf-text', () => ({ extractPdfText: vi.fn() }));
const extractPdfTextMock = vi.mocked(extractPdfText);

function DashboardStandIn() {
  const report = useCoachReport();
  return <p>Dashboard for: {report?.summary}</p>;
}

function renderPage() {
  // applyAccept: false lets the test pick files the input's `accept` would hide,
  // as a user can do with "All files" in the browser dialog.
  const user = userEvent.setup({ applyAccept: false });
  renderWithProviders(
    <Routes>
      <Route path="/upload" element={<UploadRoute />} />
      <Route path="/" element={<DashboardStandIn />} />
    </Routes>,
    { route: '/upload' },
  );
  const pick = (file: File) => user.upload(screen.getByLabelText('Choose a PDF'), file);
  return { user, pick };
}

describe('UploadRoute', () => {
  beforeEach(() => {
    extractPdfTextMock.mockReset();
    extractPdfTextMock.mockResolvedValue(CV_TEXT);
  });

  it('AC9: shows the drop zone and the file input', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Upload your CV' })).toBeInTheDocument();
    expect(screen.getByText('Drag your CV here')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF')).toBeEnabled();
  });

  it('AC10/AC11/AC17: shows each stage, disables the input, then opens the dashboard', async () => {
    const text = deferred<string>();
    const answer = deferred<null>();
    extractPdfTextMock.mockReturnValue(text.promise);
    server.use(
      http.post('/api/coach/analyze', async () => {
        await answer.promise;
        return HttpResponse.json({ report: sampleReport, cached: false });
      }),
    );
    const { pick } = renderPage();

    await pick(makeFile());

    expect(await screen.findByText('Reading your CV')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF')).toBeDisabled();

    text.resolve(CV_TEXT);
    expect(await screen.findByText('The coach is analysing your CV')).toBeInTheDocument();

    answer.resolve(null);
    expect(await screen.findByText(`Dashboard for: ${sampleReport.summary}`)).toBeInTheDocument();
  });

  it.each([
    [makeFile({ name: 'cv.docx', type: 'application/msword' }), 'Only PDF files are supported.'],
    [makeFile({ sizeBytes: 6 * 1024 * 1024 }), 'This file is larger than 5 MB.'],
    [makeFile({ sizeBytes: 0 }), 'This file is empty.'],
  ])('AC12: explains why %o is refused and does not read it', async (file, message) => {
    const { pick } = renderPage();

    await pick(file);

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(extractPdfTextMock).not.toHaveBeenCalled();
  });

  it('AC13: explains when the PDF cannot be read', async () => {
    extractPdfTextMock.mockRejectedValue(new Error('InvalidPDFException'));
    const { pick } = renderPage();

    await pick(makeFile());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not read this PDF. It may be damaged or password-protected.',
    );
  });

  it('AC14: explains when the PDF has no text', async () => {
    extractPdfTextMock.mockResolvedValue('');
    const { pick } = renderPage();

    await pick(makeFile());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.',
    );
  });

  it('AC15/AC16: shows the server failure, and "Try again" lets the user pick another file', async () => {
    server.use(
      http.post(
        '/api/coach/analyze',
        () =>
          HttpResponse.json(
            { error: { code: 'COACH_TIMEOUT', message: 'Codex timed out.' } },
            { status: 504 },
          ),
        { once: true },
      ),
    );
    const { user, pick } = renderPage();

    await pick(makeFile());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The coach could not analyse your CV: Codex timed out.',
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await pick(makeFile());
    expect(await screen.findByText(`Dashboard for: ${sampleReport.summary}`)).toBeInTheDocument();
  });

  it('AC18: uses only the first of several dropped files', async () => {
    renderPage();

    fireEvent.drop(screen.getByText('Drag your CV here'), {
      dataTransfer: { files: [makeFile({ name: 'first.pdf' }), makeFile({ name: 'second.pdf' })] },
    });

    expect(await screen.findByText(`Dashboard for: ${sampleReport.summary}`)).toBeInTheDocument();
    expect(extractPdfTextMock).toHaveBeenCalledTimes(1);
    expect(extractPdfTextMock.mock.calls[0]?.[0].name).toBe('first.pdf');
  });
});
