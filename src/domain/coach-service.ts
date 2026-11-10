import type { CoachReport } from './types';

/**
 * The boundary to the AI coach. The UI depends on this interface only;
 * which implementation runs (mock or HTTP) is decided in src/app/composition-root.ts.
 */
export interface CoachService {
  analyzeCv(cvText: string): Promise<CoachReport>;
}
