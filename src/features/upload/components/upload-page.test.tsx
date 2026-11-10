import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import type { Services } from '@/app/services';
import type { CoachReport } from '@/domain/types';
import { useCoachReport } from '@/features/coach-report/hooks/use-coach-report';
import { sampleReport } from '@/test/fixtures/coach-report';
import { CV_TEXT, makeFile } from '@/test/fixtures/files';
import { deferred } from '@/test/deferred';
import { renderWithProviders } from '@/test/render';
import { UploadPage } from './upload-page';

function DashboardStandIn() {
  const report = useCoachReport();
  return <p>Dashboard for: {report?.summary}</p>;
}

function renderPage(services: Partial<Services>) {
  // applyAccept: false lets the test pick files the input's `accept` would hide,
  // as a user can do with "All files" in the browser dialog.
  const user = userEvent.setup({ applyAccept: false });
  renderWithProviders(
    <Routes>
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/" element={<DashboardStandIn />} />
    </Routes>,
    { route: '/upload', services },
  );
  const pick = (file: File) => user.upload(screen.getByLabelText('Choose a PDF'), file);
  return { user, pick };
}

describe('UploadPage', () => {
  it('AC13: shows the drop zone', () => {
    renderPage({});

    expect(screen.getByRole('heading', { name: 'Upload your CV' })).toBeInTheDocument();
    expect(screen.getByText(/drag your cv here/i)).toBeInTheDocument();
  });

  it('AC14/AC15/AC21: shows each stage, disables the input, then opens the dashboard', async () => {
    const text = deferred<string>();
    const report = deferred<CoachReport>();
    const { pick } = renderPage({
      extractCvText: () => text.promise,
      coach: { analyzeCv: () => report.promise },
    });

    await pick(makeFile());

    expect(await screen.findByText('Reading your CV')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF')).toBeDisabled();

    text.resolve(CV_TEXT);
    expect(await screen.findByText('The coach is analysing your CV')).toBeInTheDocument();

    report.resolve(sampleReport);
    expect(await screen.findByText(`Dashboard for: ${sampleReport.summary}`)).toBeInTheDocument();
  });

  it.each([
    [makeFile({ name: 'cv.docx', type: 'application/msword' }), 'Only PDF files are supported.'],
    [makeFile({ sizeBytes: 6 * 1024 * 1024 }), 'This file is larger than 5 MB.'],
    [makeFile({ sizeBytes: 0 }), 'This file is empty.'],
  ])('AC16: explains why %o is refused and does not read it', async (file, message) => {
    const extractCvText = vi.fn();
    const { pick } = renderPage({ extractCvText });

    await pick(file);

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(extractCvText).not.toHaveBeenCalled();
  });

  it('AC17: explains when the PDF cannot be read', async () => {
    const { pick } = renderPage({
      extractCvText: () => Promise.reject(new Error('InvalidPDFException')),
    });

    await pick(makeFile());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not read this PDF. It may be damaged or password-protected.',
    );
  });

  it('AC18: explains when the PDF has no text', async () => {
    const { pick } = renderPage({ extractCvText: () => Promise.resolve('') });

    await pick(makeFile());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.',
    );
  });

  it('AC19/AC20: shows the coach failure, and "Try again" lets the user pick another file', async () => {
    const analyzeCv = vi
      .fn<(text: string) => Promise<CoachReport>>()
      .mockRejectedValueOnce(new Error('Codex timed out.'))
      .mockResolvedValueOnce(sampleReport);
    const { user, pick } = renderPage({
      extractCvText: () => Promise.resolve(CV_TEXT),
      coach: { analyzeCv },
    });

    await pick(makeFile());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The coach could not analyse your CV: Codex timed out.',
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await pick(makeFile());
    expect(await screen.findByText(`Dashboard for: ${sampleReport.summary}`)).toBeInTheDocument();
  });
});
