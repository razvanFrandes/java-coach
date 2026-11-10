import { screen, within } from '@testing-library/react';
import type { CoachReport } from '@/domain/types';
import { SKILL_AREAS } from '@/domain/types';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { GapsPage } from './gaps-page';

describe('GapsPage', () => {
  it('AC6: shows the no-report notice without a report', () => {
    renderWithProviders(<GapsPage />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
  });

  it('AC7: lists the gaps in priority order with their reasons', () => {
    renderWithProviders(<GapsPage />, { report: sampleReport });

    const items = within(screen.getByRole('list', { name: 'Gaps' })).getAllByRole('listitem');
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual([
      'Concurrency',
      'JVM internals',
      'Collections',
      'Testing',
    ]);
    expect(items[3]).toHaveTextContent(
      'Your CV only mentions JUnit 5 and Mockito, which points to a beginner level.',
    );
  });

  it('AC8: says so when there are no gaps', () => {
    const strongReport: CoachReport = {
      ...sampleReport,
      assessments: SKILL_AREAS.map((area) => ({ area, score: 70, evidence: ['plenty'] })),
    };
    renderWithProviders(<GapsPage />, { report: strongReport });

    expect(
      screen.getByText('No gaps found. Every area is at least intermediate.'),
    ).toBeInTheDocument();
  });

  it('AC9: links to the learning path', () => {
    renderWithProviders(<GapsPage />, { report: sampleReport });

    expect(screen.getByRole('link', { name: 'See your learning path' })).toHaveAttribute(
      'href',
      '/path',
    );
  });
});
