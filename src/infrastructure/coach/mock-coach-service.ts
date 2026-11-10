import type { CoachService } from '@/domain/coach-service';
import { isLevelAtLeast, levelForScore } from '@/domain/skill-level';
import {
  SKILL_AREAS,
  SKILL_AREA_LABELS,
  type AreaAssessment,
  type CoachReport,
  type LearningStep,
  type SkillArea,
} from '@/domain/types';
import { KEYWORD_POINTS, STEP_CATALOGUE } from './mock-coach-data';

/**
 * A fake coach for development and demos. No network, no AI: it scores each area from the
 * keywords in the CV text, so the same CV always gives the same report.
 */
export class MockCoachService implements CoachService {
  private readonly latencyMs: number;

  constructor({ latencyMs = 1200 }: { latencyMs?: number } = {}) {
    this.latencyMs = latencyMs;
  }

  async analyzeCv(cvText: string): Promise<CoachReport> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));

    const assessments = SKILL_AREAS.map((area) => assessArea(area, cvText));
    return {
      summary: summarise(assessments),
      assessments,
      steps: assessments.flatMap(suggestSteps),
    };
  }
}

function assessArea(area: SkillArea, cvText: string): AreaAssessment {
  const evidence: string[] = [];
  let score = 0;
  for (const [keyword, points] of Object.entries(KEYWORD_POINTS[area])) {
    if (mentions(cvText, keyword)) {
      evidence.push(keyword);
      score += points;
    }
  }
  return { area, score: Math.min(score, 100), evidence };
}

function mentions(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'i').test(text);
}

/** Advanced areas need no steps; intermediate ones skip the foundation step. */
function suggestSteps({ area, score }: AreaAssessment): LearningStep[] {
  const level = levelForScore(score);
  if (isLevelAtLeast(level, 'advanced')) return [];

  const { first, second } = STEP_CATALOGUE[area];
  const firstStep: LearningStep = { ...first, id: `${area}-1`, area };
  const secondStep: LearningStep = {
    ...second,
    id: `${area}-2`,
    area,
    prerequisites: [firstStep.id],
  };
  return isLevelAtLeast(level, 'intermediate') ? [secondStep] : [firstStep, secondStep];
}

function summarise(assessments: AreaAssessment[]): string {
  const found = assessments.filter((a) => a.score > 0).sort((a, b) => b.score - a.score);
  if (found.length === 0) {
    return 'We could not find Java experience in this CV. The learning path starts from the basics.';
  }

  const strongest = found.slice(0, 2).map((a) => SKILL_AREA_LABELS[a.area].toLowerCase());
  const missing = assessments
    .filter((a) => a.score === 0)
    .map((a) => SKILL_AREA_LABELS[a.area].toLowerCase());

  const strengths = `Your CV shows Java experience, strongest in ${strongest.join(' and ')}.`;
  const gaps =
    missing.length > 0
      ? ` There is no sign yet of ${missing.join(', ')}.`
      : ' Every area has at least some evidence.';
  return strengths + gaps;
}
