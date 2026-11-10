import { levelForScore } from './skill-level';
import { SKILL_AREAS, type CoachReport, type SkillRating } from './types';

/**
 * One rating per skill area, in display order, with the level derived from the score.
 * The coach may skip an area (rated "none") or repeat one (the first wins).
 */
export function rateSkills(report: CoachReport): SkillRating[] {
  return SKILL_AREAS.map((area) => {
    const assessment = report.assessments.find((a) => a.area === area);
    const score = assessment?.score ?? 0;
    return { area, score, level: levelForScore(score), evidence: assessment?.evidence ?? [] };
  });
}
