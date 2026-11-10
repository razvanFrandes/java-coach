import { screen } from '@testing-library/react';
import { rateSkills } from '@/domain/rate-skills';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { SkillLevelsOverview } from './skill-levels-overview';

describe('SkillLevelsOverview', () => {
  it('AC2: shows a level and a score bar for every area', () => {
    renderWithProviders(<SkillLevelsOverview ratings={rateSkills(sampleReport)} />);

    expect(screen.getAllByRole('progressbar')).toHaveLength(9);
    expect(screen.getByRole('progressbar', { name: 'Spring score' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
    expect(screen.getByRole('row', { name: /Concurrency/ })).toHaveTextContent('Not shown');
    expect(screen.getByRole('row', { name: /Spring/ })).toHaveTextContent('Intermediate');
  });
});
