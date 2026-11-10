import type { CodexAnswer, LearningStep, SkillRating } from '../types';
import { SKILL_AREAS } from '../types';
import {
  AREA_EXAMPLES,
  buildReport,
  detectGaps,
  levelForScore,
  orderLearningPath,
  rateSkills,
} from './report.service';

function rating(overrides: Partial<SkillRating> & Pick<SkillRating, 'area'>): SkillRating {
  return { score: 50, level: 'intermediate', evidence: ['something'], ...overrides };
}

function step(id: string, area: LearningStep['area'], prerequisites: string[] = []): LearningStep {
  return { id, area, title: id, goal: '', topics: [], exercise: '', effortHours: 1, prerequisites };
}

function scores(values: Partial<Record<LearningStep['area'], number>>): SkillRating[] {
  return Object.entries(values).map(([area, score]) => ({
    area: area as LearningStep['area'],
    score,
    level: 'beginner',
    evidence: [],
  }));
}

const ids = (steps: LearningStep[]) => steps.map((s) => s.id);

describe('levelForScore', () => {
  it.each([
    [0, 'none'],
    [1, 'beginner'],
    [39, 'beginner'],
    [39.5, 'beginner'],
    [40, 'intermediate'],
    [64, 'intermediate'],
    [65, 'advanced'],
    [84, 'advanced'],
    [85, 'expert'],
    [100, 'expert'],
  ])('AC1: score %s is %s', (score, level) => {
    expect(levelForScore(score)).toBe(level);
  });

  it('AC1: clamps scores outside 0-100', () => {
    expect(levelForScore(-5)).toBe('none');
    expect(levelForScore(130)).toBe('expert');
  });
});

describe('rateSkills', () => {
  const assessments: CodexAnswer['assessments'] = [
    { area: 'spring', score: 70, evidence: ['Spring Boot'] },
    { area: 'core-language', score: 45, evidence: ['Java 17'] },
    { area: 'spring', score: 10, evidence: ['duplicate'] },
  ];

  it('AC2: returns one skill per area, in display order, with its level', () => {
    const skills = rateSkills(assessments);

    expect(skills.map((s) => s.area)).toEqual([...SKILL_AREAS]);
    expect(skills.find((s) => s.area === 'core-language')).toEqual({
      area: 'core-language',
      score: 45,
      level: 'intermediate',
      evidence: ['Java 17'],
    });
  });

  it('AC2: rates an area Codex did not assess as none', () => {
    expect(rateSkills(assessments).find((s) => s.area === 'jvm')).toEqual({
      area: 'jvm',
      score: 0,
      level: 'none',
      evidence: [],
    });
  });

  it('AC2: uses the first assessment when an area appears twice', () => {
    expect(rateSkills(assessments).find((s) => s.area === 'spring')).toMatchObject({
      score: 70,
      level: 'advanced',
    });
  });
});

describe('detectGaps', () => {
  it('AC3: reports missing and weak areas, not intermediate or better', () => {
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

  it('AC4: explains a missing area with examples', () => {
    const [gap] = detectGaps([rating({ area: 'concurrency', score: 0, level: 'none' })]);

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
  ])('AC5: quotes the evidence of a weak area (%o)', (evidence, reason) => {
    const [gap] = detectGaps([rating({ area: 'testing', score: 20, level: 'beginner', evidence })]);

    expect(gap?.reason).toBe(reason);
  });

  it('AC5: explains a weak area without evidence', () => {
    const [gap] = detectGaps([
      rating({ area: 'testing', score: 20, level: 'beginner', evidence: [] }),
    ]);

    expect(gap?.reason).toBe(
      'Your CV shows little of automated testing, which points to a beginner level.',
    );
  });

  it('AC6: lower scores first, then display order', () => {
    const gaps = detectGaps([
      rating({ area: 'core-language', score: 30, level: 'beginner' }),
      rating({ area: 'oop', score: 10, level: 'beginner' }),
      rating({ area: 'spring', score: 0, level: 'none' }),
      rating({ area: 'collections', score: 30, level: 'beginner' }),
      rating({ area: 'jvm', score: 0, level: 'none' }),
    ]);

    expect(gaps.map((g) => g.area)).toEqual([
      'jvm',
      'spring',
      'oop',
      'core-language',
      'collections',
    ]);
  });

  it('AC4: has at least two examples for every area', () => {
    for (const area of SKILL_AREAS) {
      expect(AREA_EXAMPLES[area].length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('orderLearningPath', () => {
  it('AC7: puts every step after its prerequisites, even when the area is stronger', () => {
    const ordered = orderLearningPath(
      [step('testing-1', 'testing', ['oop-1']), step('oop-1', 'oop')],
      scores({ testing: 0, oop: 50 }),
    );

    expect(ids(ordered)).toEqual(['oop-1', 'testing-1']);
  });

  it('AC7: ignores prerequisites that are not in the path', () => {
    const ordered = orderLearningPath(
      [step('spring-2', 'spring', ['spring-1']), step('jvm-1', 'jvm')],
      scores({ spring: 10, jvm: 20 }),
    );

    expect(ids(ordered)).toEqual(['spring-2', 'jvm-1']);
  });

  it('AC8: weakest area first, Codex order on a tie, missing area counts as 0', () => {
    const ordered = orderLearningPath(
      [
        step('spring-1', 'spring'),
        step('collections-1', 'collections'),
        step('concurrency-1', 'concurrency'),
        step('jvm-1', 'jvm'),
      ],
      scores({ spring: 10, collections: 30, concurrency: 0 }),
    );

    expect(ids(ordered)).toEqual(['concurrency-1', 'jvm-1', 'spring-1', 'collections-1']);
  });

  it('AC9: keeps steps caught in a cycle, at the end in Codex order', () => {
    const ordered = orderLearningPath(
      [step('a', 'oop', ['b']), step('b', 'oop', ['a']), step('c', 'jvm')],
      scores({ oop: 0, jvm: 50 }),
    );

    expect(ids(ordered)).toEqual(['c', 'a', 'b']);
  });

  it('returns an empty path for no steps', () => {
    expect(orderLearningPath([], [])).toEqual([]);
  });
});

describe('buildReport', () => {
  it('AC10: turns a Codex answer into summary, skills, gaps and an ordered path', () => {
    const answer: CodexAnswer = {
      summary: 'You know Spring well.',
      assessments: [
        { area: 'spring', score: 80, evidence: ['Spring Boot'] },
        { area: 'testing', score: 20, evidence: ['JUnit 5'] },
      ],
      steps: [step('testing-2', 'testing', ['testing-1']), step('testing-1', 'testing')],
    };

    const report = buildReport(answer);

    expect(report.summary).toBe('You know Spring well.');
    expect(report.skills).toHaveLength(SKILL_AREAS.length);
    expect(report.skills.find((s) => s.area === 'spring')?.level).toBe('advanced');
    expect(report.gaps[0]).toMatchObject({ area: 'core-language', severity: 'missing' });
    expect(report.gaps.find((g) => g.area === 'testing')?.severity).toBe('weak');
    expect(report.gaps.some((g) => g.area === 'spring')).toBe(false);
    expect(ids(report.learningPath)).toEqual(['testing-1', 'testing-2']);
  });
});
