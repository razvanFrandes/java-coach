import { screen, within } from '@testing-library/react';
import { sampleReport } from '@/mocks/data/coach-report';
import { renderWithProviders } from '@/testing/test-utils';
import { ProfileRoute } from './profile';

describe('ProfileRoute', () => {
  it('AC3: without a report, points to the upload page', () => {
    renderWithProviders(<ProfileRoute />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload your CV' })).toHaveAttribute('href', '/upload');
  });

  it("AC4: shows the coach's summary", () => {
    renderWithProviders(<ProfileRoute />, { report: sampleReport });

    expect(screen.getByRole('heading', { name: 'Your Java profile' })).toBeInTheDocument();
    expect(screen.getByText(sampleReport.summary)).toBeInTheDocument();
  });

  it('AC5: shows every area with its level, score and score bar', () => {
    renderWithProviders(<ProfileRoute />, { report: sampleReport });

    const skills = within(screen.getByRole('list', { name: 'Skills' })).getAllByRole('listitem', {
      name: /.+/,
    });
    expect(skills).toHaveLength(9);

    const coreLanguage = screen.getByRole('listitem', { name: 'Core language' });
    expect(within(coreLanguage).getByText('Intermediate')).toBeInTheDocument();
    expect(within(coreLanguage).getByText('55/100')).toBeInTheDocument();
    expect(
      within(coreLanguage).getByRole('progressbar', { name: 'Core language score' }),
    ).toBeInTheDocument();
  });

  it('AC6: lists the evidence, or says that nothing was found', () => {
    renderWithProviders(<ProfileRoute />, { report: sampleReport });

    const spring = screen.getByRole('listitem', { name: 'Spring' });
    expect(within(spring).getByText('Spring Boot')).toBeInTheDocument();
    expect(within(spring).getByText('Spring Data JPA')).toBeInTheDocument();

    const jvm = screen.getByRole('listitem', { name: 'JVM internals' });
    expect(within(jvm).getByText('Not shown')).toBeInTheDocument();
    expect(within(jvm).getByText('Nothing in your CV mentions this yet.')).toBeInTheDocument();
  });
});
