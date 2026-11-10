/**
 * Settings the frontend reads at build time. Only VITE_* variables reach the browser,
 * so never put a secret in one (see .env.example).
 */
export const env = {
  /** "true": MSW answers the API in the browser, so the app runs without the server. */
  ENABLE_API_MOCKING: import.meta.env.VITE_ENABLE_API_MOCKING === 'true',
};
