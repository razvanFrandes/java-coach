import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { DashboardPage } from '@/features/dashboard/components/dashboard-page';
import { GapsPage } from '@/features/gaps/components/gaps-page';
import { LearningPathPage } from '@/features/learning-path/components/learning-path-page';
import { ProfilePage } from '@/features/profile/components/profile-page';
import { UploadPage } from '@/features/upload/components/upload-page';
import { AppLayout } from './app-layout';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'gaps', element: <GapsPage /> },
      { path: 'path', element: <LearningPathPage /> },
      { path: 'docs', element: <Navigate to="/docs/overview" replace /> },
      {
        // Loaded on first visit: the markdown renderer is only needed for the docs.
        path: 'docs/:slug',
        lazy: () =>
          import('@/features/docs/components/docs-page').then((m) => ({ Component: m.DocsPage })),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
