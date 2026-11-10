import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const LEARNING_PROGRESS_STORAGE_KEY = 'java-coach:learning-progress';

interface LearningProgressState {
  completedStepIds: string[];
  toggleStep: (stepId: string) => void;
  reset: () => void;
}

/**
 * Which learning steps the user has finished. Client-only UI state, so it lives in Zustand;
 * the `persist` middleware saves it in localStorage and restores it on load.
 */
export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set) => ({
      completedStepIds: [],
      toggleStep: (stepId) =>
        set((state) => ({
          completedStepIds: state.completedStepIds.includes(stepId)
            ? state.completedStepIds.filter((id) => id !== stepId)
            : [...state.completedStepIds, stepId],
        })),
      reset: () => set({ completedStepIds: [] }),
    }),
    {
      name: LEARNING_PROGRESS_STORAGE_KEY,
      // Only the data is saved; the functions are recreated on load.
      partialize: (state) => ({ completedStepIds: state.completedStepIds }),
    },
  ),
);
