import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Web3Provider } from '@/components/Web3Provider.tsx';
import { Toaster } from 'react-hot-toast';
import { Router } from '@/Router.tsx';
import { Analytics } from '@vercel/analytics/react';
import { VexLandInfoUpgradeProvider } from './context/VexLandInfoUpgradeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VexLandInfoUpgradeProvider>
      <Web3Provider>
        <Router />
        <Toaster />
      </Web3Provider>
      <Analytics />
    </VexLandInfoUpgradeProvider>
  </React.StrictMode>
);
