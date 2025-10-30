import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

import { ThemeProvider } from '@renderer/components/theme-provider';
import { Routes } from './routes';
import { Providers } from './providers/providers';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes />
      </ThemeProvider>
    </Providers>
  </React.StrictMode>
);
