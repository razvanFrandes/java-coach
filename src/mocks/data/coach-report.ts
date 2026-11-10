import type { CoachReport } from '@/types/api';

/**
 * A realistic report for a junior developer, shaped exactly like the server's answer.
 * Used by mock mode (src/mocks/handlers.ts) and by the tests.
 */
export const sampleReport: CoachReport = {
  summary:
    'You have about two years of Java 17 and Spring Boot. You are comfortable with REST APIs, JPA and PostgreSQL, but your CV does not show concurrency or JVM knowledge yet.',
  skills: [
    {
      area: 'core-language',
      score: 55,
      level: 'intermediate',
      evidence: ['Java 17', 'streams and lambdas'],
    },
    { area: 'oop', score: 45, level: 'intermediate', evidence: ['domain modelled with interfaces'] },
    {
      area: 'collections',
      score: 30,
      level: 'beginner',
      evidence: ['ArrayList and HashMap (course)'],
    },
    { area: 'concurrency', score: 0, level: 'none', evidence: [] },
    { area: 'jvm', score: 0, level: 'none', evidence: [] },
    {
      area: 'spring',
      score: 60,
      level: 'intermediate',
      evidence: ['Spring Boot', 'Spring Data JPA'],
    },
    { area: 'testing', score: 35, level: 'beginner', evidence: ['JUnit 5', 'Mockito'] },
    { area: 'build-tools', score: 45, level: 'intermediate', evidence: ['Maven', 'Docker'] },
    {
      area: 'databases',
      score: 50,
      level: 'intermediate',
      evidence: ['PostgreSQL', 'Flyway migrations'],
    },
  ],
  gaps: [
    {
      area: 'concurrency',
      severity: 'missing',
      reason:
        'Your CV does not mention concurrency, for example threads, ExecutorService or CompletableFuture.',
    },
    {
      area: 'jvm',
      severity: 'missing',
      reason:
        'Your CV does not mention JVM internals, for example garbage collection, profiling or memory tuning.',
    },
    {
      area: 'collections',
      severity: 'weak',
      reason:
        'Your CV only mentions ArrayList and HashMap (course), which points to a beginner level.',
    },
    {
      area: 'testing',
      severity: 'weak',
      reason: 'Your CV only mentions JUnit 5 and Mockito, which points to a beginner level.',
    },
  ],
  learningPath: [
    {
      id: 'concurrency-1',
      area: 'concurrency',
      title: 'Threads and executors',
      goal: 'Run work in parallel safely.',
      topics: ['Thread', 'ExecutorService', 'synchronized', 'race conditions'],
      exercise: 'Download ten URLs in parallel with an ExecutorService and count the bytes.',
      effortHours: 6,
      prerequisites: [],
    },
    {
      id: 'concurrency-2',
      area: 'concurrency',
      title: 'Asynchronous Java',
      goal: 'Compose asynchronous work without blocking threads.',
      topics: ['CompletableFuture', 'virtual threads'],
      exercise: 'Call three slow services in parallel and combine their answers.',
      effortHours: 8,
      prerequisites: ['concurrency-1'],
    },
    {
      id: 'jvm-1',
      area: 'jvm',
      title: 'Memory and garbage collection',
      goal: 'Explain heap, stack and how the GC frees memory.',
      topics: ['heap vs stack', 'generational GC', 'memory leaks'],
      exercise: 'Create a memory leak on purpose and find it with VisualVM.',
      effortHours: 5,
      prerequisites: [],
    },
    {
      id: 'collections-1',
      area: 'collections',
      title: 'Choosing the right collection',
      goal: 'Pick List, Set or Map by access pattern and know their costs.',
      topics: ['List vs Set vs Map', 'equals and hashCode', 'Big-O of common operations'],
      exercise: 'Implement a word-frequency counter and compare HashMap with TreeMap.',
      effortHours: 4,
      prerequisites: [],
    },
    {
      id: 'testing-1',
      area: 'testing',
      title: 'Test-driven development',
      goal: 'Write the test first and let it drive the design.',
      topics: ['red-green-refactor', 'AssertJ', 'test doubles'],
      exercise: 'Build a shopping-cart price calculator test-first.',
      effortHours: 6,
      prerequisites: ['collections-1', 'unknown-step'],
    },
  ],
};
