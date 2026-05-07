import React from 'react';
import { createRoot } from 'react-dom/client';
import EVChargingSimulator from './components/EVChargingSimulator';

// Mount AppPreview
const appContainer = document.getElementById('react-app-preview');
if (appContainer) {
  const root = createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <EVChargingSimulator />
    </React.StrictMode>
  );
}


