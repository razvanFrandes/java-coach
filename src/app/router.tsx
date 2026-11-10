import { createBrowserRouter, type RouteObject } from 'react-router';
import { UploadPage } from '@/features/upload/components/upload-page';
import { AppLayout } from './app-layout';

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <p>Java Coach is being built.</p> },
      { path: 'upload', element: <UploadPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
