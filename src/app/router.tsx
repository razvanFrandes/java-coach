import { createBrowserRouter, type RouteObject } from 'react-router';
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
    ],
  },
];

export const router = createBrowserRouter(routes);
