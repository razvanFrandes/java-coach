import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

/**
 * MSW in Node: answers the app's fetch calls during tests with the same handlers as mock mode.
 * A test that needs another answer adds it with server.use(...).
 */
export const server = setupServer(...handlers);
