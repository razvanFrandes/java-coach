import { HttpCoachService } from '@/infrastructure/coach/http-coach-service';
import { MockCoachService } from '@/infrastructure/coach/mock-coach-service';
import { extractPdfText } from '@/infrastructure/pdf/extract-pdf-text';
import { createServices } from './composition-root';

describe('createServices', () => {
  it('AC11: uses the mock coach in mock mode', () => {
    const services = createServices('mock');

    expect(services.coach).toBeInstanceOf(MockCoachService);
    expect(services.extractCvText).toBe(extractPdfText);
  });

  it('AC11: uses the HTTP coach in http mode', () => {
    expect(createServices('http').coach).toBeInstanceOf(HttpCoachService);
  });

  it('AC11: refuses an unknown mode', () => {
    expect(() => createServices('openai')).toThrow('Unknown VITE_COACH_MODE "openai"');
  });
});
