import { setupServer } from 'msw/node';

/** Shared MSW server. Tests add handlers with server.use(...) for the requests they expect. */
export const server = setupServer();
