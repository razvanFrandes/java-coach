import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { UploadProgress } from './upload-progress';

function progressValue() {
  return Number(
    screen.getByRole('progressbar', { name: 'Upload progress' }).getAttribute('aria-valuenow'),
  );
}

describe('UploadProgress', () => {
  it('AC14: describes the reading stage', () => {
    renderWithProviders(<UploadProgress status="reading" />);

    expect(screen.getByRole('status')).toHaveTextContent('Reading your CV');
    expect(progressValue()).toBeGreaterThan(0);
  });

  it('AC14: describes the analysing stage, further along than reading', () => {
    const { unmount } = renderWithProviders(<UploadProgress status="reading" />);
    const readingValue = progressValue();
    unmount();

    renderWithProviders(<UploadProgress status="analyzing" />);

    expect(screen.getByRole('status')).toHaveTextContent('The coach is analysing your CV');
    expect(progressValue()).toBeGreaterThan(readingValue);
  });
});
