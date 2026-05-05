import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPreview from './components/AppPreview';

const container = document.getElementById('react-app-preview');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppPreview />
    </React.StrictMode>
  );
}
