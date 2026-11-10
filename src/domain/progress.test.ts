import { findNextStep, summarizeProgress } from './progress';
import type { LearningStep } from './types';

function step(id: string, effortHours: number): LearningStep {
  return {
    id,
    area: 'oop',
    title: id,
    goal: '',
    topics: [],
    exercise: '',
    effortHours,
    prerequisites: [],
  };
}

const path = [step('a', 4), step('b', 6), step('c', 5)];

describe('summarizeProgress', () => {
  it('AC5: counts completed steps, percentage and remaining hours', () => {
    expect(summarizeProgress(path, ['b'])).toEqual({
      completed: 1,
      total: 3,
      percent: 33,
      remainingHours: 9,
    });
  });

  it('AC5: ignores completed ids that are not in this path', () => {
    expect(summarizeProgress(path, ['a', 'old-step']).completed).toBe(1);
  });

  it('AC5: rounds the percentage to a whole number', () => {
    expect(summarizeProgress(path, ['a', 'b']).percent).toBe(67);
  });

  it('AC5: reports 0% for an empty path', () => {
    expect(summarizeProgress([], [])).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
      remainingHours: 0,
    });
  });
});

describe('findNextStep', () => {
  it('AC6: returns the first step that is not done, in path order', () => {
    expect(findNextStep(path, ['a', 'c'])?.id).toBe('b');
  });

  it('AC6: returns undefined when everything is done', () => {
    expect(findNextStep(path, ['a', 'b', 'c'])).toBeUndefined();
  });
});
