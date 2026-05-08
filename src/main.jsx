import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPreview from './components/AppPreview';

// Mount AppPreview
const appContainer = document.getElementById('react-app-preview');
if (appContainer) {
  const root = createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <AppPreview />
    </React.StrictMode>
  );
}


