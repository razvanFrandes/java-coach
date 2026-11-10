import { createBrowserRouter, type RouteObject } from 'react-router';
import { GapsPage } from '@/features/gaps/components/gaps-page';
import { ProfilePage } from '@/features/profile/components/profile-page';
import { UploadPage } from '@/features/upload/components/upload-page';
import { AppLayout } from './app-layout';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <p>Java Coach is being built.</p> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'gaps', element: <GapsPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
