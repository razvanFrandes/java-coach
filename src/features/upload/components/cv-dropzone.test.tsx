import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeFile } from '@/test/fixtures/files';
import { renderWithProviders } from '@/test/render';
import { CvDropzone } from './cv-dropzone';

describe('CvDropzone', () => {
  it('AC13: invites the user to drag a CV or choose a PDF', () => {
    renderWithProviders(<CvDropzone onFile={vi.fn()} disabled={false} />);

    expect(screen.getByText(/drag your cv here/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF')).toHaveAttribute('type', 'file');
  });

  it('AC13: passes a picked file to onFile', async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const file = makeFile();
    renderWithProviders(<CvDropzone onFile={onFile} disabled={false} />);

    await user.upload(screen.getByLabelText('Choose a PDF'), file);

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('AC22: passes only the first of several dropped files', () => {
    const onFile = vi.fn();
    const first = makeFile({ name: 'first.pdf' });
    const second = makeFile({ name: 'second.pdf' });
    renderWithProviders(<CvDropzone onFile={onFile} disabled={false} />);

    // user-event cannot drag files from the desktop, so the drop is simulated with fireEvent.
    fireEvent.drop(screen.getByTestId('cv-dropzone'), {
      dataTransfer: { files: [first, second] },
    });

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(first);
  });

  it('AC21: ignores picks and drops while disabled', () => {
    const onFile = vi.fn();
    renderWithProviders(<CvDropzone onFile={onFile} disabled />);

    expect(screen.getByLabelText('Choose a PDF')).toBeDisabled();
    fireEvent.drop(screen.getByTestId('cv-dropzone'), {
      dataTransfer: { files: [makeFile()] },
    });
    expect(onFile).not.toHaveBeenCalled();
  });
});
