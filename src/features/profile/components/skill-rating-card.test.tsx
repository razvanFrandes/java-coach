import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { SkillRatingCard } from './skill-rating-card';

describe('SkillRatingCard', () => {
  it('AC10/AC11: shows the area, level, score and evidence', () => {
    renderWithProviders(
      <SkillRatingCard
        rating={{
          area: 'spring',
          score: 60,
          level: 'intermediate',
          evidence: ['Spring Boot', 'JPA'],
        }}
      />,
    );

    const card = screen.getByRole('article', { name: 'Spring' });
    expect(within(card).getByText('Intermediate')).toBeInTheDocument();
    expect(within(card).getByText('60/100')).toBeInTheDocument();
    expect(within(card).getByRole('list', { name: 'Evidence' })).toHaveTextContent('Spring Boot');
    expect(within(card).getByRole('list', { name: 'Evidence' })).toHaveTextContent('JPA');
  });

  it('AC11: says so when the CV has no evidence for the area', () => {
    renderWithProviders(
      <SkillRatingCard rating={{ area: 'jvm', score: 0, level: 'none', evidence: [] }} />,
    );

    const card = screen.getByRole('article', { name: 'JVM internals' });
    expect(within(card).getByText('Not shown')).toBeInTheDocument();
    expect(within(card).getByText('Nothing in your CV mentions this yet.')).toBeInTheDocument();
  });
});
