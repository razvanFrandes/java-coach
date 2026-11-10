import { SKILL_AREA_LABELS, SKILL_LEVEL_LABELS } from './labels';

describe('labels', () => {
  it('AC1: has a label for each of the nine skill areas', () => {
    expect(Object.values(SKILL_AREA_LABELS)).toEqual([
      'Core language',
      'Object-oriented design',
      'Collections',
      'Concurrency',
      'JVM internals',
      'Spring',
      'Testing',
      'Build tools',
      'Databases',
    ]);
  });

  it('AC2: has a label for each level', () => {
    expect(SKILL_LEVEL_LABELS).toEqual({
      none: 'Not shown',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    });
  });
});
