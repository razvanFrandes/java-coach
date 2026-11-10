import { rateSkills } from './rate-skills';
import { SKILL_AREAS, type CoachReport } from './types';

const report: CoachReport = {
  summary: 'A summary',
  assessments: [
    { area: 'spring', score: 70, evidence: ['Spring Boot'] },
    { area: 'core-language', score: 45, evidence: ['Java 17'] },
    { area: 'spring', score: 10, evidence: ['duplicate'] },
  ],
  steps: [],
};

describe('rateSkills', () => {
  it('AC4: returns one rating per area, in display order', () => {
    expect(rateSkills(report).map((r) => r.area)).toEqual([...SKILL_AREAS]);
  });

  it('AC4: derives the level from the score', () => {
    const ratings = rateSkills(report);

    expect(ratings.find((r) => r.area === 'core-language')).toEqual({
      area: 'core-language',
      score: 45,
      level: 'intermediate',
      evidence: ['Java 17'],
    });
  });

  it('AC5: rates an area the report does not mention as none', () => {
    expect(rateSkills(report).find((r) => r.area === 'jvm')).toEqual({
      area: 'jvm',
      score: 0,
      level: 'none',
      evidence: [],
    });
  });

  it('AC6: uses the first assessment when an area appears twice', () => {
    expect(rateSkills(report).find((r) => r.area === 'spring')).toMatchObject({
      score: 70,
      level: 'advanced',
      evidence: ['Spring Boot'],
    });
  });
});
