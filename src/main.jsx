import React from 'react';
import { createRoot } from 'react-dom/client';
import EVChargingSimulator from './components/EVChargingSimulator';

const container = document.getElementById('react-app-preview');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <EVChargingSimulator />
    </React.StrictMode>
  );
}
