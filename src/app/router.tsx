import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layouts/app-layout';
import { DashboardRoute } from './routes/dashboard';
import { GapsRoute } from './routes/gaps';
import { LearningPathRoute } from './routes/learning-path';
import { ProfileRoute } from './routes/profile';
import { UploadRoute } from './routes/upload';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: 'upload', element: <UploadRoute /> },
      { path: 'profile', element: <ProfileRoute /> },
      { path: 'gaps', element: <GapsRoute /> },
      { path: 'path', element: <LearningPathRoute /> },
      { path: 'docs', element: <Navigate to="/docs/overview" replace /> },
      {
        // Loaded on the first visit: the markdown renderer is only needed for the docs.
        path: 'docs/:slug',
        lazy: () => import('./routes/docs').then((module) => ({ Component: module.DocsRoute })),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
