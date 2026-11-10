import { HttpCoachService } from '@/infrastructure/coach/http-coach-service';
import { MockCoachService } from '@/infrastructure/coach/mock-coach-service';
import { extractPdfText } from '@/infrastructure/pdf/extract-pdf-text';
import type { Services } from './services';

/**
 * The composition root: the one place that decides which implementations the app uses.
 * Everything else depends on the `Services` interfaces and receives them via useServices().
 */
export function createServices(mode: string = import.meta.env.VITE_COACH_MODE ?? 'mock'): Services {
  switch (mode) {
    case 'mock':
      return { coach: new MockCoachService(), extractCvText: extractPdfText };
    case 'http':
      return { coach: new HttpCoachService(), extractCvText: extractPdfText };
    default:
      throw new Error(`Unknown VITE_COACH_MODE "${mode}". Use "mock" or "http".`);
  }
}
