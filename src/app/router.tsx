import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from './app-layout';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [{ index: true, element: <p>Java Coach is being built.</p> }],
  },
];

export const router = createBrowserRouter(routes);
