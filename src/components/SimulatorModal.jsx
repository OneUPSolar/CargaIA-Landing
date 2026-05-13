import React, { useState, useEffect, useRef } from 'react';
import AppPreview from './AppPreview';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyGC43LO1vYrCql73lZvZ1mRHByTeToEQtSki2W_wJ-XezAt0IcVqgF75d6ORI0RyXDdg/exec';

const CITIES = [
  { value: 'tijuana',   label: 'Tijuana' },
  { value: 'mexicali',  label: 'Mexicali' },
  { value: 'juarez',    label: 'Ciudad Juárez' },
  { value: 'nogales',   label: 'Nogales' },
  { value: 'reynosa',   label: 'Reynosa' },
  { value: 'other_mx',  label: 'Otra Ciudad (MX)' },
  { value: 'us_border', label: 'U.S. Border City' }
];

const CLIENT_TYPES = [
  { value: 'usuario',      label: 'USUARIO',       desc: 'Tengo o quiero un EV' },
  { value: 'inversionista', label: 'INVERSIONISTA', desc: 'Quiero ser parte de la red' },
  { value: 'instalador',    label: 'INSTALADOR',    desc: 'Quiero ser partner' }
];

export default function SimulatorModal({ isOpen, onClose }) {
  // Screens: 'simulator' → 'form' → 'success'
  const [screen, setScreen] = useState('simulator');
  const [demoComplete, setDemoComplete] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    region: '',
    tipo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset internal state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setScreen('simulator');
      setDemoComplete(false);
      setForm({ nombre: '', email: '', region: '', tipo: '' });
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // ESC key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const handleAutoPlayComplete = () => setDemoComplete(true);

  const goToForm = () => setScreen('form');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.nombre || !form.email || !form.region || !form.tipo) {
      setError('Completa todos los campos.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      timestamp: new Date().toISOString(),
      nombre: form.nombre,
      email: form.email,
      region: form.region,
      tipo: form.tipo,
      tipo_usuario: form.tipo,
      fuente: 'Simulator Modal'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Submission failed');
      setScreen('success');
    } catch (err) {
      clearTimeout(timeoutId);
      setError('Error al enviar. Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sim-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <button className="sim-modal-close" onClick={onClose} aria-label="Cerrar">×</button>

      <div className="sim-modal-stage" onClick={(e) => e.stopPropagation()}>

        {/* App switcher header: icon + name floats above the frame */}
        <div className="sim-app-header">
          <div className="sim-app-icon">
            <span>C</span><span style={{ color: 'var(--electric-cyan)' }}>IA</span>
          </div>
          <div className="sim-app-name">CargaIA</div>
        </div>

        {/* Phone frame with rounded corners — the screen container */}
        <div className="sim-phone-frame">
          <div className="sim-phone-screens">

            {/* SCREEN 1 — Simulator */}
            <div className={`sim-screen sim-screen-simulator ${screen === 'simulator' ? 'is-active' : screen === 'form' ? 'is-exit-left' : 'is-hidden'}`}>
              <div className="sim-screen-content">
                <AppPreview
                  autoPlay={true}
                  onAutoPlayComplete={handleAutoPlayComplete}
                  frameless={true}
                />

                {demoComplete && (
                  <div className="sim-cta-block">
                    <div className="sim-cta-label">TU TURNO</div>
                    <button className="sim-cta-button" onClick={goToForm}>
                      RESERVAR_ACCESO →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SCREEN 2 — Form */}
            <div className={`sim-screen sim-screen-form ${screen === 'form' ? 'is-active' : screen === 'success' ? 'is-exit-left' : 'is-hidden'}`}>
              <form onSubmit={handleSubmit} className="sim-form">
                <div className="sim-form-header">
                  <div className="sim-form-tag">[RESERVA_ACCESO]</div>
                  <h3>Casi listo.</h3>
                  <p>Te avisamos cuando tu zona esté disponible.</p>
                </div>

                <div className="sim-form-fields">
                  <div className="sim-form-field" style={{ animationDelay: '0.05s' }}>
                    <label>IDENT_ID</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="NOMBRE_COMPLETO"
                      required
                    />
                  </div>

                  <div className="sim-form-field" style={{ animationDelay: '0.15s' }}>
                    <label>COM_UPLINK</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="CORREO_ELECTRONICO"
                      required
                    />
                  </div>

                  <div className="sim-form-field" style={{ animationDelay: '0.25s' }}>
                    <label>REGION</label>
                    <select
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      required
                    >
                      <option value="" disabled>SELECCIONA_TU_CIUDAD</option>
                      {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div className="sim-form-field" style={{ animationDelay: '0.35s' }}>
                    <label>PERFIL</label>
                    <div className="sim-form-tipo">
                      {CLIENT_TYPES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          className={`sim-form-tipo-btn ${form.tipo === t.value ? 'is-selected' : ''}`}
                          onClick={() => setForm({ ...form, tipo: t.value })}
                        >
                          <span className="sim-form-tipo-label">{t.label}</span>
                          <span className="sim-form-tipo-desc">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="sim-form-error">{error}</div>}

                  <button
                    type="submit"
                    className="sim-form-submit"
                    disabled={submitting}
                    style={{ animationDelay: '0.45s' }}
                  >
                    {submitting ? 'ENVIANDO...' : 'CONFIRMAR_RESERVA'}
                  </button>
                </div>
              </form>
            </div>

            {/* SCREEN 3 — Success */}
            <div className={`sim-screen sim-screen-success ${screen === 'success' ? 'is-active' : 'is-hidden'}`}>
              <div className="sim-success">
                <div className="sim-success-icon">✓</div>
                <div className="sim-success-tag">[LINK_ESTABLISHED]</div>
                <h3>Acceso reservado.</h3>
                <p>Te contactamos pronto.</p>
                <button className="sim-success-close" onClick={onClose}>CERRAR</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
