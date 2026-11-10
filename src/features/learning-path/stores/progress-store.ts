import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PROGRESS_STORAGE_KEY = 'java-coach:learning-progress';

interface ProgressState {
  completedStepIds: string[];
  toggleStep: (stepId: string) => void;
  reset: () => void;
}

/**
 * Which learning steps the user has finished. Only the browser knows this, so it is client
 * state (Zustand), not server state. `persist` saves it in localStorage.
 */
export const useProgressStore = create<ProgressState>()(
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
      name: PROGRESS_STORAGE_KEY,
      // Only the data is saved; the functions are recreated on load.
      partialize: (state) => ({ completedStepIds: state.completedStepIds }),
    },
  ),
);
