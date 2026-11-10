import {
  SKILL_AREAS,
  type CoachReport,
  type CodexAnswer,
  type Gap,
  type LearningStep,
  type SkillArea,
  type SkillLevel,
  type SkillRating,
} from '../types';

/** How a gap reason names each area inside a sentence. */
const AREA_NAMES_IN_TEXT: Record<SkillArea, string> = {
  'core-language': 'modern Java language features',
  oop: 'object-oriented design',
  collections: 'the Collections framework',
  concurrency: 'concurrency',
  jvm: 'JVM internals',
  spring: 'Spring',
  testing: 'automated testing',
  'build-tools': 'build tools',
  databases: 'databases',
};

/** What a CV could mention to show each area. Used to explain missing areas. */
export const AREA_EXAMPLES: Record<SkillArea, string[]> = {
  'core-language': ['streams', 'records', 'generics'],
  oop: ['interfaces', 'design patterns', 'SOLID'],
  collections: ['HashMap', 'TreeMap', 'equals and hashCode'],
  concurrency: ['threads', 'ExecutorService', 'CompletableFuture'],
  jvm: ['garbage collection', 'profiling', 'memory tuning'],
  spring: ['Spring Boot', 'Spring Data', 'Spring Security'],
  testing: ['JUnit', 'Mockito', 'test-driven development'],
  'build-tools': ['Maven', 'Gradle', 'CI pipelines'],
  databases: ['SQL', 'JPA/Hibernate', 'transactions'],
};

/** Turns Codex's raw answer into the report the browser shows. */
export function buildReport(answer: CodexAnswer): CoachReport {
  const skills = rateSkills(answer.assessments);
  return {
    summary: answer.summary,
    skills,
    gaps: detectGaps(skills),
    learningPath: orderLearningPath(answer.steps, skills),
  };
}

/** Turns a 0-100 score into a level. Out-of-range scores are clamped. */
export function levelForScore(score: number): SkillLevel {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped >= 85) return 'expert';
  if (clamped >= 65) return 'advanced';
  if (clamped >= 40) return 'intermediate';
  if (clamped > 0) return 'beginner';
  return 'none';
}

/**
 * One skill per area, in display order. An area Codex skipped is rated "none";
 * an area Codex assessed twice keeps the first assessment.
 */
export function rateSkills(assessments: CodexAnswer['assessments']): SkillRating[] {
  return SKILL_AREAS.map((area) => {
    const assessment = assessments.find((a) => a.area === area);
    const score = assessment?.score ?? 0;
    return { area, score, level: levelForScore(score), evidence: assessment?.evidence ?? [] };
  });
}

/**
 * Areas that need work: missing (level none) and weak (level beginner).
 * Most urgent first: lowest score, then display order.
 */
export function detectGaps(skills: SkillRating[]): Gap[] {
  return skills
    .filter((s) => s.level === 'none' || s.level === 'beginner')
    .sort((a, b) => a.score - b.score || SKILL_AREAS.indexOf(a.area) - SKILL_AREAS.indexOf(b.area))
    .map(toGap);
}

function toGap(skill: SkillRating): Gap {
  if (skill.level === 'none') {
    return {
      area: skill.area,
      severity: 'missing',
      reason: `Your CV does not mention ${AREA_NAMES_IN_TEXT[skill.area]}, for example ${joinWords(AREA_EXAMPLES[skill.area], 'or')}.`,
    };
  }
  const found =
    skill.evidence.length > 0
      ? `only mentions ${joinWords(skill.evidence, 'and')}`
      : `shows little of ${AREA_NAMES_IN_TEXT[skill.area]}`;
  return {
    area: skill.area,
    severity: 'weak',
    reason: `Your CV ${found}, which points to a beginner level.`,
  };
}

/** ["a"] -> "a", ["a", "b"] -> "a and b", ["a", "b", "c"] -> "a, b and c". */
function joinWords(words: string[], lastJoiner: 'and' | 'or'): string {
  if (words.length === 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} ${lastJoiner} ${words.at(-1)}`;
}

/**
 * Orders Codex's steps into a path:
 * 1. a step comes after its prerequisites (those that are in the path),
 * 2. among the steps that are ready, the weakest area (lowest score) goes first,
 * 3. on equal scores Codex's own order wins.
 * Steps stuck in a prerequisite cycle are added at the end instead of being lost.
 */
export function orderLearningPath(steps: LearningStep[], skills: SkillRating[]): LearningStep[] {
  const stepIds = new Set(steps.map((s) => s.id));
  const scoreOf = (step: LearningStep) => skills.find((s) => s.area === step.area)?.score ?? 0;

  const placedIds = new Set<string>();
  const ordered: LearningStep[] = [];
  let remaining = [...steps];

  while (remaining.length > 0) {
    const ready = remaining.filter((step) =>
      step.prerequisites.every((id) => !stepIds.has(id) || placedIds.has(id)),
    );
    if (ready.length === 0) {
      ordered.push(...remaining); // a cycle: nothing can become ready any more
      break;
    }

    // `ready` keeps Codex's order, and `<` keeps the earlier step on a tie.
    const next = ready.reduce((best, step) => (scoreOf(step) < scoreOf(best) ? step : best));
    ordered.push(next);
    placedIds.add(next.id);
    remaining = remaining.filter((step) => step !== next);
  }

  return ordered;
}
