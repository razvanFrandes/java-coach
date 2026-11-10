import { SKILL_AREAS } from '@/domain/types';
import { MockCoachService } from './mock-coach-service';

const coach = new MockCoachService({ latencyMs: 0 });

const JUNIOR_CV =
  'Junior Java developer. Built REST APIs with Spring Boot on Java 17, used streams and lambdas, ' +
  'wrote tests with JUnit 5 and Mockito, stored data in PostgreSQL, built with Maven.';

const SPRING_EXPERT_CV =
  'Spring Boot, Spring MVC, Spring Data JPA, Spring Security, Spring Cloud, Spring Batch, ' +
  'dependency injection, Spring WebFlux, microservices.';

describe('MockCoachService', () => {
  it('AC5: returns one assessment per skill area, in display order', async () => {
    const report = await coach.analyzeCv(JUNIOR_CV);

    expect(report.assessments.map((a) => a.area)).toEqual([...SKILL_AREAS]);
    expect(report.summary.length).toBeGreaterThan(20);
  });

  it('AC5: gives the same report for the same text', async () => {
    expect(await coach.analyzeCv(JUNIOR_CV)).toEqual(await coach.analyzeCv(JUNIOR_CV));
  });

  it('AC6: scores areas from keywords and lists them as evidence', async () => {
    const report = await coach.analyzeCv(JUNIOR_CV);
    const spring = report.assessments.find((a) => a.area === 'spring');
    const concurrency = report.assessments.find((a) => a.area === 'concurrency');

    expect(spring?.score).toBeGreaterThan(0);
    expect(spring?.evidence.join(' ')).toContain('Spring Boot');
    expect(concurrency).toEqual({ area: 'concurrency', score: 0, evidence: [] });
  });

  it('AC6: does not count "JavaScript" as Java', async () => {
    const report = await coach.analyzeCv('Frontend developer: JavaScript, TypeScript, React.');

    expect(report.assessments.every((a) => a.score === 0)).toBe(true);
  });

  it('AC7: suggests steps only for areas below the advanced level (score < 65)', async () => {
    const report = await coach.analyzeCv(SPRING_EXPERT_CV);
    const spring = report.assessments.find((a) => a.area === 'spring');

    expect(spring?.score).toBeGreaterThanOrEqual(65);
    expect(report.steps.some((s) => s.area === 'spring')).toBe(false);
    expect(report.steps.some((s) => s.area === 'concurrency')).toBe(true);
  });

  it('AC7: every prerequisite is in the report or belongs to an area already rated intermediate or higher', async () => {
    const report = await coach.analyzeCv(JUNIOR_CV);
    const stepIds = new Set(report.steps.map((s) => s.id));
    const scoreOf = (stepId: string) =>
      report.assessments.find((a) => stepId.startsWith(`${a.area}-`))?.score ?? 0;

    for (const step of report.steps) {
      for (const prerequisite of step.prerequisites) {
        expect(stepIds.has(prerequisite) || scoreOf(prerequisite) >= 40).toBe(true);
      }
    }
  });

  it('AC8: answers only after the configured latency', async () => {
    vi.useFakeTimers();
    try {
      const slowCoach = new MockCoachService();
      const onDone = vi.fn();
      void slowCoach.analyzeCv(JUNIOR_CV).then(onDone);

      await vi.advanceTimersByTimeAsync(1199);
      expect(onDone).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(onDone).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});
