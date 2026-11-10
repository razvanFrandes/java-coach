import { orderLearningPath } from './learning-path';
import { rateSkills } from './rate-skills';
import type { LearningStep, SkillRating } from './types';
import { sampleReport } from '@/test/fixtures/coach-report';

function step(id: string, area: LearningStep['area'], prerequisites: string[] = []): LearningStep {
  return { id, area, title: id, goal: '', topics: [], exercise: '', effortHours: 1, prerequisites };
}

function ratings(scores: Partial<Record<LearningStep['area'], number>>): SkillRating[] {
  return Object.entries(scores).map(([area, score]) => ({
    area: area as LearningStep['area'],
    score,
    level: 'beginner',
    evidence: [],
  }));
}

const ids = (steps: LearningStep[]) => steps.map((s) => s.id);

describe('orderLearningPath', () => {
  it('AC1/AC3: orders the sample report (worked example)', () => {
    // Scores: concurrency 0, jvm 0, collections 30, testing 35.
    // Ready at start: concurrency-1 (0), collections-1 (30), jvm-1 (0) -> concurrency-1 (coach order wins the tie with jvm-1)
    // Then concurrency-2 is ready (0) and comes before jvm-1 (0) in the coach's list.
    const ordered = orderLearningPath(sampleReport.steps, rateSkills(sampleReport));

    expect(ids(ordered)).toEqual([
      'concurrency-1',
      'concurrency-2',
      'jvm-1',
      'collections-1',
      'testing-1',
    ]);
  });

  it('AC1: puts every step after its prerequisites, even when the area is stronger', () => {
    const ordered = orderLearningPath(
      [step('testing-1', 'testing', ['oop-1']), step('oop-1', 'oop')],
      ratings({ testing: 0, oop: 50 }),
    );

    expect(ids(ordered)).toEqual(['oop-1', 'testing-1']);
  });

  it('AC2: ignores prerequisites that are not in the path', () => {
    const ordered = orderLearningPath(
      [step('spring-2', 'spring', ['spring-1']), step('jvm-1', 'jvm')],
      ratings({ spring: 10, jvm: 20 }),
    );

    expect(ids(ordered)).toEqual(['spring-2', 'jvm-1']);
  });

  it('AC3: treats an area without a rating as score 0', () => {
    const ordered = orderLearningPath(
      [step('spring-1', 'spring'), step('jvm-1', 'jvm')],
      ratings({ spring: 10 }),
    );

    expect(ids(ordered)).toEqual(['jvm-1', 'spring-1']);
  });

  it('AC4: keeps steps caught in a cycle, at the end in coach order', () => {
    const ordered = orderLearningPath(
      [step('a', 'oop', ['b']), step('b', 'oop', ['a']), step('c', 'jvm')],
      ratings({ oop: 0, jvm: 50 }),
    );

    expect(ids(ordered)).toEqual(['c', 'a', 'b']);
  });

  it('returns an empty path for no steps', () => {
    expect(orderLearningPath([], [])).toEqual([]);
  });
});
