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
    countryCode: '+52',
    telefono: '',
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
      setForm({ nombre: '', email: '', countryCode: '+52', telefono: '', region: '', tipo: '' });
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

  // Formatea dígitos crudos al formato visual según el país
  const formatPhoneNumber = (digits, countryCode) => {
    const cleaned = digits.replace(/\D/g, '').slice(0, 10);
    if (countryCode === '+1') {
      // US: (XXX) XXX-XXXX
      if (cleaned.length === 0) return '';
      if (cleaned.length <= 3) return `(${cleaned}`;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    // MX (default): XXX-XXX-XXXX
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Cuenta solo dígitos para validación
  const phoneDigitsCount = (formatted) => {
    return (formatted || '').replace(/\D/g, '').length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.nombre || !form.email || !form.telefono || !form.region || !form.tipo) {
      setError('Completa todos los campos.');
      return;
    }
    if (phoneDigitsCount(form.telefono) !== 10) {
      setError('El teléfono debe tener 10 dígitos.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      timestamp: new Date().toISOString(),
      nombre: form.nombre,
      email: form.email,
      telefono: `${form.countryCode} ${form.telefono}`,
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

      // Construir mensaje pre-llenado para WhatsApp
      const whatsappPhone = '526631674617'; // CargaIA WhatsApp Business — Tijuana
      const tipoLabel = {
        homeowner: 'USUARIO (tengo o quiero un EV)',
        investor: 'INVERSIONISTA (parte de la red)',
        installer: 'INSTALADOR (partner)'
      }[form.tipo] || form.tipo;

      const cityLabel = (CITIES.find(c => c.value === form.region) || {}).label || form.region;

      const message = [
        'Hola CargaIA 👋',
        '',
        'Quiero reservar mi acceso a Fase 1.',
        '',
        `NOMBRE: ${form.nombre}`,
        `EMAIL: ${form.email}`,
        `TEL: ${form.countryCode} ${form.telefono}`,
        `CIUDAD: ${cityLabel}`,
        `PERFIL: ${tipoLabel}`,
        '',
        'Enviado desde cargaia.com'
      ].join('\n');

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

      // Redirigir a WhatsApp DESPUÉS de que Sheets respondió (mismo turn, 
      // no abrir antes para que no se cierre el form si el fetch falla)
      window.location.href = whatsappUrl;

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

                  <div className="sim-form-field" style={{ animationDelay: '0.20s' }}>
                    <label>COM_VOICE</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <select
                        value={form.countryCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          // Reformatea el número con el formato del nuevo país
                          const reformatted = formatPhoneNumber(form.telefono, newCode);
                          setForm({ ...form, countryCode: newCode, telefono: reformatted });
                        }}
                        style={{ 
                          flex: '0 0 110px',
                          width: '110px',
                          minWidth: '110px',
                          maxWidth: '110px',
                          padding: '0 8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={form.telefono}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value, form.countryCode);
                          setForm({ ...form, telefono: formatted });
                        }}
                        placeholder={form.countryCode === '+1' ? '(555) 123-4567' : '664-123-4567'}
                        style={{ 
                          flex: '1 1 0',
                          minWidth: '0',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="sim-form-field" style={{ animationDelay: '0.30s' }}>
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

                  <div className="sim-form-field" style={{ animationDelay: '0.40s' }}>
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
