import { screen, within } from '@testing-library/react';
import { sampleReport } from '@/mocks/data/coach-report';
import { renderWithProviders } from '@/testing/test-utils';
import { GapsRoute } from './gaps';

describe('GapsRoute', () => {
  it('AC1: without a report, shows the "No CV analysed yet" notice', () => {
    renderWithProviders(<GapsRoute />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
  });

  it('AC2: lists the gaps in the server order with area, badge and reason', () => {
    renderWithProviders(<GapsRoute />, { report: sampleReport });

    const items = within(screen.getByRole('list', { name: 'Gaps' })).getAllByRole('listitem');
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual([
      'Concurrency',
      'JVM internals',
      'Collections',
      'Testing',
    ]);

    const [concurrency, , collections] = items;
    expect(within(concurrency as HTMLElement).getByText('Missing')).toBeInTheDocument();
    expect(
      within(concurrency as HTMLElement).getByText(sampleReport.gaps[0]?.reason ?? ''),
    ).toBeInTheDocument();
    expect(within(collections as HTMLElement).getByText('Weak')).toBeInTheDocument();
  });

  it('AC3: says when there are no gaps', () => {
    renderWithProviders(<GapsRoute />, { report: { ...sampleReport, gaps: [] } });

    expect(
      screen.getByText('No gaps found. Every area is at least intermediate.'),
    ).toBeInTheDocument();
  });

  it('AC4: links to the learning path', () => {
    renderWithProviders(<GapsRoute />, { report: sampleReport });

    expect(screen.getByRole('link', { name: 'See your learning path' })).toHaveAttribute(
      'href',
      '/path',
    );
  });
});
