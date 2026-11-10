import { AREA_EXAMPLES, detectGaps } from './gaps';
import { SKILL_AREAS, type SkillRating } from './types';

function rating(overrides: Partial<SkillRating> & Pick<SkillRating, 'area'>): SkillRating {
  return { score: 50, level: 'intermediate', evidence: ['something'], ...overrides };
}

describe('detectGaps', () => {
  it('AC1: reports missing and weak areas, not intermediate or better', () => {
    const gaps = detectGaps([
      rating({ area: 'core-language', score: 70, level: 'advanced' }),
      rating({ area: 'oop', score: 45, level: 'intermediate' }),
      rating({ area: 'testing', score: 30, level: 'beginner', evidence: ['JUnit 5'] }),
      rating({ area: 'jvm', score: 0, level: 'none', evidence: [] }),
    ]);

    expect(gaps.map((g) => [g.area, g.severity])).toEqual([
      ['jvm', 'missing'],
      ['testing', 'weak'],
    ]);
  });

  it('AC2: explains a missing area with examples', () => {
    const [gap] = detectGaps([
      rating({ area: 'concurrency', score: 0, level: 'none', evidence: [] }),
    ]);

    expect(gap?.reason).toBe(
      'Your CV does not mention concurrency, for example threads, ExecutorService or CompletableFuture.',
    );
  });

  it.each([
    [['JUnit 5'], 'Your CV only mentions JUnit 5, which points to a beginner level.'],
    [
      ['JUnit 5', 'Mockito'],
      'Your CV only mentions JUnit 5 and Mockito, which points to a beginner level.',
    ],
    [
      ['JUnit 5', 'Mockito', 'AssertJ'],
      'Your CV only mentions JUnit 5, Mockito and AssertJ, which points to a beginner level.',
    ],
  ])('AC3: quotes the evidence of a weak area (%o)', (evidence, reason) => {
    const [gap] = detectGaps([rating({ area: 'testing', score: 20, level: 'beginner', evidence })]);

    expect(gap?.reason).toBe(reason);
  });

  it('AC3: explains a weak area that has a score but no evidence', () => {
    const [gap] = detectGaps([
      rating({ area: 'testing', score: 20, level: 'beginner', evidence: [] }),
    ]);

    expect(gap?.reason).toBe(
      'Your CV shows little of automated testing, which points to a beginner level.',
    );
  });

  it('AC4: missing first, then lower scores first, then display order', () => {
    const gaps = detectGaps([
      rating({ area: 'core-language', score: 30, level: 'beginner' }),
      rating({ area: 'oop', score: 10, level: 'beginner' }),
      rating({ area: 'spring', score: 0, level: 'none', evidence: [] }),
      rating({ area: 'collections', score: 30, level: 'beginner' }),
      rating({ area: 'jvm', score: 0, level: 'none', evidence: [] }),
    ]);

    expect(gaps.map((g) => g.area)).toEqual([
      'jvm',
      'spring',
      'oop',
      'core-language',
      'collections',
    ]);
  });

  it('AC4: keeps display order even when ratings arrive shuffled', () => {
    const gaps = detectGaps([
      rating({ area: 'databases', score: 0, level: 'none', evidence: [] }),
      rating({ area: 'core-language', score: 0, level: 'none', evidence: [] }),
    ]);

    expect(gaps.map((g) => g.area)).toEqual(['core-language', 'databases']);
  });
});

describe('AREA_EXAMPLES', () => {
  it('AC5: has at least two examples for every area', () => {
    for (const area of SKILL_AREAS) {
      expect(AREA_EXAMPLES[area].length).toBeGreaterThanOrEqual(2);
    }
  });
});
