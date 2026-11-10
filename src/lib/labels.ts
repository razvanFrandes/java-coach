import type { SkillArea, SkillLevel } from '@/types/api';

/** The server sends ids (`core-language`); these are the names people read. */
export const SKILL_AREA_LABELS: Record<SkillArea, string> = {
  'core-language': 'Core language',
  oop: 'Object-oriented design',
  collections: 'Collections',
  concurrency: 'Concurrency',
  jvm: 'JVM internals',
  spring: 'Spring',
  testing: 'Testing',
  'build-tools': 'Build tools',
  databases: 'Databases',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'Not shown',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};
