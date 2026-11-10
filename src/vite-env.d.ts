/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" (default) or "http". Read only by src/app/composition-root.ts. */
  readonly VITE_COACH_MODE?: 'mock' | 'http';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
