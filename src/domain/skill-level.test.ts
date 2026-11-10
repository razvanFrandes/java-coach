import { SKILL_LEVEL_LABELS, isLevelAtLeast, levelForScore } from './skill-level';

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

describe('isLevelAtLeast', () => {
  it('AC2: compares levels by their order', () => {
    expect(isLevelAtLeast('advanced', 'intermediate')).toBe(true);
    expect(isLevelAtLeast('advanced', 'advanced')).toBe(true);
    expect(isLevelAtLeast('beginner', 'intermediate')).toBe(false);
    expect(isLevelAtLeast('none', 'beginner')).toBe(false);
  });
});

describe('SKILL_LEVEL_LABELS', () => {
  it('AC3: has a readable label for every level', () => {
    expect(SKILL_LEVEL_LABELS).toEqual({
      none: 'Not shown',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    });
  });
});
