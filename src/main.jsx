import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPreview from './components/AppPreview';

import SimulatorModal from './components/SimulatorModal';

// Mount the modal as a separate React root so it can use its own state
// and be globally controlled via window.openSimulatorModal()
const modalRoot = document.createElement('div');
modalRoot.id = 'sim-modal-root';
document.body.appendChild(modalRoot);

function ModalController() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Expose imperative open/close to vanilla JS in script.js
    window.openSimulatorModal = () => setIsOpen(true);
    window.closeSimulatorModal = () => setIsOpen(false);
    return () => {
      delete window.openSimulatorModal;
      delete window.closeSimulatorModal;
    };
  }, []);

  return <SimulatorModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}

createRoot(modalRoot).render(<ModalController />);


