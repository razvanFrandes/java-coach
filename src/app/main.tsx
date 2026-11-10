import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from 'react-router';
import { createServices } from './composition-root';
import { createQueryClient, persistOptions } from './query-client';
import { router } from './router';
import { ServicesProvider } from './services';
import '../index.css';

const queryClient = createQueryClient();
const services = createServices();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('index.html must contain <div id="root">');

createRoot(rootElement).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <RouterProvider router={router} />
      </PersistQueryClientProvider>
    </ServicesProvider>
  </StrictMode>,
);
