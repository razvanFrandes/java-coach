import { SKILL_AREAS, type Gap, type SkillArea, type SkillRating } from './types';

/** How a reason refers to each area inside a sentence. */
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

/** What a CV could mention to show each area. Used to explain missing gaps. */
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

/**
 * Areas that need work: missing (nothing in the CV) and weak (beginner evidence only).
 * Most urgent first: missing before weak, then lowest score, then display order.
 */
export function detectGaps(ratings: SkillRating[]): Gap[] {
  const candidates = ratings.filter((r) => r.level === 'none' || r.level === 'beginner');
  const ordered = [...candidates].sort(
    (a, b) => a.score - b.score || SKILL_AREAS.indexOf(a.area) - SKILL_AREAS.indexOf(b.area),
  );
  return ordered.map(toGap);
}

function toGap(rating: SkillRating): Gap {
  if (rating.level === 'none') {
    return {
      area: rating.area,
      severity: 'missing',
      reason: `Your CV does not mention ${AREA_NAMES_IN_TEXT[rating.area]}, for example ${joinWords(AREA_EXAMPLES[rating.area], 'or')}.`,
    };
  }
  const found =
    rating.evidence.length > 0
      ? `only mentions ${joinWords(rating.evidence, 'and')}`
      : `shows little of ${AREA_NAMES_IN_TEXT[rating.area]}`;
  return {
    area: rating.area,
    severity: 'weak',
    reason: `Your CV ${found}, which points to a beginner level.`,
  };
}

/** ["a"] -> "a", ["a", "b"] -> "a and b", ["a", "b", "c"] -> "a, b and c". */
function joinWords(words: string[], lastJoiner: 'and' | 'or'): string {
  if (words.length === 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} ${lastJoiner} ${words.at(-1)}`;
}
