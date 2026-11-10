import { SKILL_LEVELS, type SkillLevel } from './types';

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'Not shown',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

/** Turns a 0-100 coach score into a level. Out-of-range scores are clamped. */
export function levelForScore(score: number): SkillLevel {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped >= 85) return 'expert';
  if (clamped >= 65) return 'advanced';
  if (clamped >= 40) return 'intermediate';
  if (clamped > 0) return 'beginner';
  return 'none';
}

export function isLevelAtLeast(level: SkillLevel, minimum: SkillLevel): boolean {
  return SKILL_LEVELS.indexOf(level) >= SKILL_LEVELS.indexOf(minimum);
}
