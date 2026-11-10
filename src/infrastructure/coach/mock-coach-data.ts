import type { LearningStep, SkillArea } from '@/domain/types';

/**
 * Data behind MockCoachService. Each keyword found in the CV adds its points to the area
 * (capped at 100). Matching is case-insensitive and on whole words, so "Java" does not match
 * "JavaScript" and "SQL" does not match "PostgreSQL".
 */
export const KEYWORD_POINTS: Record<SkillArea, Record<string, number>> = {
  'core-language': {
    Java: 15,
    'Java 8': 10,
    'Java 11': 10,
    'Java 17': 15,
    'Java 21': 20,
    lambdas: 10,
    streams: 10,
    generics: 10,
    records: 10,
    Optional: 5,
    exceptions: 5,
  },
  oop: {
    OOP: 15,
    'object-oriented': 15,
    interfaces: 10,
    inheritance: 10,
    polymorphism: 10,
    encapsulation: 10,
    'design patterns': 20,
    SOLID: 20,
    'domain-driven design': 15,
  },
  collections: {
    collections: 15,
    ArrayList: 10,
    HashMap: 10,
    LinkedList: 10,
    HashSet: 10,
    TreeMap: 10,
    'data structures': 15,
    'Big-O': 15,
    Comparator: 10,
  },
  concurrency: {
    concurrency: 20,
    multithreading: 20,
    threads: 15,
    ExecutorService: 15,
    CompletableFuture: 20,
    synchronized: 10,
    'virtual threads': 20,
    'race conditions': 10,
  },
  jvm: {
    JVM: 20,
    'garbage collection': 20,
    'GC tuning': 20,
    heap: 10,
    JIT: 15,
    profiling: 15,
    VisualVM: 10,
    'Java Flight Recorder': 10,
    'memory leaks': 10,
    'class loading': 10,
  },
  spring: {
    Spring: 10,
    'Spring Boot': 25,
    'Spring MVC': 10,
    'Spring Data': 15,
    'Spring Security': 15,
    'Spring Cloud': 10,
    'Spring Batch': 10,
    WebFlux: 10,
    'dependency injection': 10,
    microservices: 10,
  },
  testing: {
    JUnit: 20,
    Mockito: 15,
    TDD: 20,
    'test-driven': 20,
    'integration tests': 15,
    Testcontainers: 15,
    AssertJ: 10,
    'unit tests': 10,
    'code coverage': 10,
  },
  'build-tools': {
    Maven: 25,
    Gradle: 25,
    'CI/CD': 15,
    Jenkins: 10,
    'GitHub Actions': 10,
    Docker: 10,
    Git: 5,
  },
  databases: {
    SQL: 15,
    PostgreSQL: 20,
    MySQL: 20,
    Oracle: 15,
    JPA: 15,
    Hibernate: 20,
    JDBC: 15,
    Flyway: 10,
    Liquibase: 10,
    MongoDB: 10,
    transactions: 10,
    indexes: 10,
  },
};

type StepContent = Omit<LearningStep, 'id' | 'area' | 'prerequisites'>;

interface AreaSteps {
  /** Foundation step: suggested when the area is missing or weak. */
  first: StepContent & { prerequisites: string[] };
  /** Deeper step: suggested for every area below the advanced level. */
  second: StepContent;
}

export const STEP_CATALOGUE: Record<SkillArea, AreaSteps> = {
  'core-language': {
    first: {
      title: 'Modern Java syntax',
      goal: 'Write idiomatic Java 17+ code.',
      topics: ['records', 'switch expressions', 'var', 'text blocks'],
      exercise: 'Rewrite a small Java 8 codebase using records and switch expressions.',
      effortHours: 4,
      prerequisites: [],
    },
    second: {
      title: 'Lambdas, streams and Optional',
      goal: 'Process data declaratively and avoid null checks.',
      topics: ['functional interfaces', 'Stream API', 'collectors', 'Optional'],
      exercise: 'Turn a CSV of orders into a per-customer revenue report using only streams.',
      effortHours: 6,
    },
  },
  oop: {
    first: {
      title: 'Objects, interfaces and encapsulation',
      goal: 'Model a problem with small classes that hide their data.',
      topics: ['encapsulation', 'interfaces vs abstract classes', 'composition over inheritance'],
      exercise: 'Model a library (books, members, loans) with no public fields.',
      effortHours: 5,
      prerequisites: [],
    },
    second: {
      title: 'SOLID and design patterns',
      goal: 'Recognise and apply the patterns used in real Java codebases.',
      topics: ['SOLID', 'strategy', 'factory', 'observer', 'dependency inversion'],
      exercise: 'Refactor a payment module with a giant switch into the strategy pattern.',
      effortHours: 8,
    },
  },
  collections: {
    first: {
      title: 'Choosing the right collection',
      goal: 'Pick List, Set or Map by access pattern and know their costs.',
      topics: ['List vs Set vs Map', 'equals and hashCode', 'Big-O of common operations'],
      exercise: 'Implement a word-frequency counter and compare HashMap with TreeMap.',
      effortHours: 4,
      prerequisites: [],
    },
    second: {
      title: 'Collections in depth',
      goal: 'Understand how HashMap and friends work inside.',
      topics: [
        'hashing and buckets',
        'Comparator',
        'immutable collections',
        'concurrent collections',
      ],
      exercise: 'Write a tiny HashMap yourself and benchmark it against java.util.HashMap.',
      effortHours: 6,
    },
  },
  concurrency: {
    first: {
      title: 'Threads and executors',
      goal: 'Run work in parallel safely.',
      topics: ['Thread', 'ExecutorService', 'synchronized', 'race conditions'],
      exercise: 'Download ten URLs in parallel with an ExecutorService and count the bytes.',
      effortHours: 6,
      prerequisites: ['core-language-1'],
    },
    second: {
      title: 'Asynchronous Java',
      goal: 'Compose asynchronous work without blocking threads.',
      topics: ['CompletableFuture', 'virtual threads', 'structured concurrency'],
      exercise: 'Call three slow services in parallel and combine their answers.',
      effortHours: 8,
    },
  },
  jvm: {
    first: {
      title: 'Memory and garbage collection',
      goal: 'Explain heap, stack and how the GC frees memory.',
      topics: ['heap vs stack', 'generational GC', 'memory leaks'],
      exercise: 'Create a memory leak on purpose and find it with VisualVM.',
      effortHours: 5,
      prerequisites: [],
    },
    second: {
      title: 'Profiling and tuning',
      goal: 'Find a slow method or a memory problem with real tools.',
      topics: ['Java Flight Recorder', 'JIT compilation', 'GC logs', 'JVM flags'],
      exercise: 'Profile a slow endpoint with JFR and make it twice as fast.',
      effortHours: 8,
    },
  },
  spring: {
    first: {
      title: 'Spring Boot fundamentals',
      goal: 'Build a REST API with dependency injection and configuration.',
      topics: ['dependency injection', '@RestController', 'profiles and properties'],
      exercise: 'Build a to-do REST API with validation and proper HTTP status codes.',
      effortHours: 8,
      prerequisites: ['oop-1'],
    },
    second: {
      title: 'Production-ready Spring',
      goal: 'Secure, observe and test a Spring Boot service.',
      topics: ['Spring Security', 'Actuator', '@SpringBootTest', 'transactions'],
      exercise: 'Add JWT login, health checks and integration tests to the to-do API.',
      effortHours: 12,
    },
  },
  testing: {
    first: {
      title: 'Unit testing with JUnit 5',
      goal: 'Write fast, readable tests for plain Java code.',
      topics: ['JUnit 5', 'AssertJ', 'parameterized tests', 'Arrange-Act-Assert'],
      exercise: 'Cover a string-calculator kata with parameterized tests.',
      effortHours: 4,
      prerequisites: [],
    },
    second: {
      title: 'Test-driven development and test doubles',
      goal: 'Let tests drive the design and isolate dependencies.',
      topics: ['red-green-refactor', 'Mockito', 'Testcontainers'],
      exercise: 'Build a shopping-cart price calculator test-first.',
      effortHours: 6,
    },
  },
  'build-tools': {
    first: {
      title: 'Maven or Gradle basics',
      goal: 'Build, test and package a project from the command line.',
      topics: ['project layout', 'dependencies and scopes', 'lifecycle and tasks'],
      exercise: 'Create a multi-module project with a shared library module.',
      effortHours: 3,
      prerequisites: [],
    },
    second: {
      title: 'Continuous integration',
      goal: 'Run the build and tests on every push.',
      topics: ['GitHub Actions', 'build caching', 'Docker images'],
      exercise: 'Add a CI pipeline that tests and builds a Docker image of your API.',
      effortHours: 4,
    },
  },
  databases: {
    first: {
      title: 'SQL and JDBC',
      goal: 'Query a relational database correctly from Java.',
      topics: ['SELECT and JOIN', 'indexes', 'PreparedStatement', 'transactions'],
      exercise: 'Write a JDBC repository for orders with a transaction around checkout.',
      effortHours: 6,
      prerequisites: [],
    },
    second: {
      title: 'JPA and Hibernate',
      goal: 'Map entities and avoid the classic performance traps.',
      topics: ['entity mapping', 'lazy loading', 'N+1 queries', 'Flyway migrations'],
      exercise: 'Find and fix an N+1 query problem in a Spring Data JPA project.',
      effortHours: 8,
    },
  },
};
