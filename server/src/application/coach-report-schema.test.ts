import type { CoachReport } from '@/domain/types';
import { coachReportJsonSchema, coachReportSchema } from './coach-report-schema';

const valid: CoachReport = {
  summary: 'A junior developer.',
  assessments: [{ area: 'spring', score: 40, evidence: ['Spring Boot'] }],
  steps: [
    {
      id: 'jvm-1',
      area: 'jvm',
      title: 'Memory',
      goal: 'Understand the heap.',
      topics: ['heap'],
      exercise: 'Find a leak.',
      effortHours: 5,
      prerequisites: [],
    },
  ],
};

describe('coachReportSchema', () => {
  it('AC5: accepts a valid report', () => {
    expect(coachReportSchema.parse(valid)).toEqual(valid);
  });

  it('AC5: rejects an unknown skill area', () => {
    const report = { ...valid, assessments: [{ area: 'kotlin', score: 10, evidence: [] }] };
    expect(coachReportSchema.safeParse(report).success).toBe(false);
  });

  it('AC5: rejects a missing field', () => {
    const { summary: _summary, ...withoutSummary } = valid;
    expect(coachReportSchema.safeParse(withoutSummary).success).toBe(false);
  });

  it('AC5: rejects extra fields', () => {
    expect(coachReportSchema.safeParse({ ...valid, level: 'expert' }).success).toBe(false);
  });
});

describe('coachReportJsonSchema', () => {
  it('AC6: requires every property and forbids extra ones, at every depth', () => {
    const objects: Array<Record<string, unknown>> = [];
    const collect = (node: unknown) => {
      if (node && typeof node === 'object') {
        const record = node as Record<string, unknown>;
        if (record.type === 'object') objects.push(record);
        Object.values(record).forEach(collect);
      }
    };
    collect(coachReportJsonSchema);

    expect(objects.length).toBe(3); // report, assessment, step
    for (const object of objects) {
      expect(object.additionalProperties).toBe(false);
      expect(object.required).toEqual(Object.keys(object.properties as object));
    }
  });
});
