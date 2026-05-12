import React, { useState, useEffect } from 'react';
import IosFrame from './ios_frame';

// === CHARGER CAPABILITIES ===
const CHARGER_KW = { nivel2: 7, dcfast: 50 };
const ANIM_MS_PER_PCT = { nivel2: 80, dcfast: 30 };

// === TIME-OF-USE TARIFFS (MXN/kWh) ===
// Illustrative, not contractual. Aligned with CFE DAC time-of-use bands
// observed in Tijuana/Baja Norte residential rates, May 2026.
const TARIFFS = {
  madrugada: { nivel2: 6, dcfast: 8 },   // 12am - 6am  -> off-peak / valley
  dia:       { nivel2: 8, dcfast: 12 },  // 6am - 5pm   -> mid / intermediate
  pico:      { nivel2: 10, dcfast: 16 }, // 5pm - 10pm  -> peak
};

const TARIFF_LABELS = {
  madrugada: 'MADRUGADA',
  dia:       'DÍA',
  pico:      'PICO',
};

const TARIFF_RANGES = {
  madrugada: '12am – 6am',
  dia:       '6am – 5pm · 10pm – 12am',
  pico:      '5pm – 10pm',
};

function savingsPercentVsPico(window, level) {
  const peakRate = TARIFFS.pico[level];
  const thisRate = TARIFFS[window][level];
  return Math.round(((peakRate - thisRate) / peakRate) * 100);
}

function detectCurrentWindow() {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return 'madrugada';
  if (hour >= 17 && hour < 22) return 'pico';
  return 'dia';
}

const VEHICLE_LABELS = ['MI TESLA', 'MI BYD', 'MI EV', 'MI CARGA'];

function formatMinutes(totalMinutes) {
  if (!isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded}m`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

export default function AppPreview() {
  const [batteryKwh, setBatteryKwh] = useState(82);
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(80);
  const [chargeLevel, setChargeLevel] = useState('nivel2');
  const [tariffWindow, setTariffWindow] = useState(detectCurrentWindow());
  const [isCharging, setIsCharging] = useState(false);
  const [vehicleLabelIdx, setVehicleLabelIdx] = useState(0);
  const [simulatedCharge, setSimulatedCharge] = useState(20);

  useEffect(() => {
    setSimulatedCharge(currentCharge);
    setIsCharging(false);
  }, [currentCharge, targetCharge]);

  useEffect(() => {
    let interval;
    if (!isCharging) {
      interval = setInterval(() => {
        setVehicleLabelIdx(prev => (prev + 1) % VEHICLE_LABELS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isCharging]);

  useEffect(() => {
    let interval;
    if (isCharging && simulatedCharge < targetCharge) {
      interval = setInterval(() => {
        setSimulatedCharge(prev => {
          const next = prev + 1;
          if (next >= targetCharge) {
            setIsCharging(false);
            return targetCharge;
          }
          return next;
        });
      }, ANIM_MS_PER_PCT[chargeLevel] ?? 80);
    }
    return () => clearInterval(interval);
  }, [isCharging, simulatedCharge, targetCharge, chargeLevel]);

  const kw = CHARGER_KW[chargeLevel] ?? 7;
  const costPerKwh = TARIFFS[tariffWindow][chargeLevel];

  const kwhToDeliverTotal = (batteryKwh * (targetCharge - currentCharge)) / 100;
  const kwhRemaining = Math.max(0, (batteryKwh * (targetCharge - simulatedCharge)) / 100);
  const kwhDelivered = Math.max(0, (batteryKwh * (simulatedCharge - currentCharge)) / 100);

  const totalTimeMinutes = (kwhToDeliverTotal / kw) * 60;
  const remainingTimeMinutes = (kwhRemaining / kw) * 60;

  const timeDisplay = isCharging ? formatMinutes(remainingTimeMinutes) : formatMinutes(totalTimeMinutes);

  const showTarget = !isCharging && simulatedCharge === currentCharge;
  const pctToShow = showTarget ? targetCharge - currentCharge : simulatedCharge - currentCharge;
  const costToShow = showTarget ? kwhToDeliverTotal * costPerKwh : kwhDelivered * costPerKwh;

  const handleStart = () => {
    if (simulatedCharge >= targetCharge) {
      setSimulatedCharge(currentCharge);
    }
    setIsCharging(true);
  };

  const handleReset = () => {
    setIsCharging(false);
    setSimulatedCharge(currentCharge);
  };

  const savingsBadge = (() => {
    if (tariffWindow === 'madrugada') {
      const pct = savingsPercentVsPico('madrugada', chargeLevel);
      return { text: `AHORRO ${pct}%`, color: 'var(--electric-cyan)', bg: 'rgba(0, 242, 255, 0.12)' };
    }
    if (tariffWindow === 'pico') {
      return { text: 'TARIFA ALTA', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.10)' };
    }
    return null;
  })();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
      <IosFrame time="9:41" battery={Math.round(simulatedCharge)} darkMode={true}>
        <div style={{
          padding: '24px 20px',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          minHeight: '100%',
          background: 'linear-gradient(180deg, #0A0A0C 0%, #121216 100%)'
        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--electric-cyan)', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>CARGAIA_OS</h2>
            <div style={{
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
              minWidth: '70px',
              textAlign: 'center',
              transition: 'opacity 0.4s ease',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              background: isCharging ? 'rgba(0, 242, 255, 0.1)' : 'rgba(0, 242, 255, 0.05)',
              color: isCharging ? 'var(--electric-cyan)' : 'rgba(0, 242, 255, 0.7)',
              border: `1px solid ${isCharging ? 'var(--electric-cyan)' : 'rgba(0, 242, 255, 0.25)'}`
            }}>
              {isCharging ? 'CARGANDO' : VEHICLE_LABELS[vehicleLabelIdx]}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '8px' }}>ESTADO DE CARGA</div>
              <div style={{ fontSize: '56px', fontWeight: 300, fontFamily: 'Outfit', lineHeight: 1, textShadow: isCharging ? '0 0 20px rgba(0,242,255,0.3)' : 'none', color: isCharging ? '#fff' : 'rgba(255,255,255,0.9)' }}>
                {Math.round(simulatedCharge)}%
              </div>
            </div>

            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${simulatedCharge}%`,
                background: 'var(--electric-cyan)',
                boxShadow: '0 0 10px var(--electric-cyan)',
                transition: 'width 0.3s ease-out'
              }} />
              <div style={{
                position: 'absolute', left: `${targetCharge}%`, top: 0, bottom: 0,
                width: '2px', background: '#fff', zIndex: 2
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              <span>{currentCharge}% INIT</span>
              <span>{targetCharge}% META</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '24px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>RECARGA</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>+{Math.round(pctToShow)}%</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{isCharging ? 'RESTANTE' : 'TIEMPO EST.'}</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--electric-cyan)' }}>{timeDisplay}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>COSTO</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--neon-green)' }}>${costToShow.toFixed(0)}</div>
                {savingsBadge && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '7.5px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.08em',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    background: savingsBadge.bg,
                    color: savingsBadge.color,
                    display: 'inline-block'
                  }}>
                    {savingsBadge.text}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              *Ejemplo CFE DAC. Tarifa final al contratar.
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Carga Actual</span>
                <span>{currentCharge}%</span>
              </div>
              <input type="range" min="0" max="90" value={currentCharge} onChange={(e) => setCurrentCharge(Math.min(Number(e.target.value), targetCharge - 5))} disabled={isCharging} style={{ width: '100%', accentColor: '#fff' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Meta de Carga</span>
                <span>{targetCharge}%</span>
              </div>
              <input type="range" min="10" max="100" value={targetCharge} onChange={(e) => setTargetCharge(Math.max(Number(e.target.value), currentCharge + 5))} disabled={isCharging} style={{ width: '100%', accentColor: '#fff' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['nivel2', 'dcfast'].map(level => (
              <button
                key={level}
                onClick={() => setChargeLevel(level)}
                disabled={isCharging}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: chargeLevel === level ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${chargeLevel === level ? 'var(--electric-cyan)' : 'rgba(255,255,255,0.05)'}`,
                  color: chargeLevel === level ? 'var(--electric-cyan)' : 'rgba(255,255,255,0.5)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  cursor: isCharging ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {level === 'nivel2' ? 'NIVEL 2 · 7kW' : 'DC FAST · 50kW'}
              </button>
            ))}
          </div>

          {/* TARIFF WINDOW TOGGLE — new */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              <span>HORARIO</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                {TARIFF_RANGES[tariffWindow]}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['madrugada', 'dia', 'pico'].map(win => {
                const isActive = tariffWindow === win;
                const rate = TARIFFS[win][chargeLevel];
                let activeColor = 'var(--electric-cyan)';
                if (win === 'pico') activeColor = '#ff6b6b';
                return (
                  <button
                    key={win}
                    onClick={() => setTariffWindow(win)}
                    disabled={isCharging}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      background: isActive
                        ? (win === 'pico' ? 'rgba(255, 107, 107, 0.08)' : 'rgba(0, 242, 255, 0.08)')
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? activeColor : 'rgba(255,255,255,0.05)'}`,
                      color: isActive ? activeColor : 'rgba(255,255,255,0.5)',
                      borderRadius: '8px',
                      fontSize: '10px',
                      cursor: isCharging ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{TARIFF_LABELS[win]}</span>
                    <span style={{ fontSize: '9px', opacity: 0.75 }}>${rate}/kWh</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleStart}
              disabled={isCharging || simulatedCharge >= targetCharge}
              style={{
                flex: 2,
                padding: '16px',
                background: isCharging || simulatedCharge >= targetCharge ? 'rgba(255,255,255,0.1)' : 'var(--electric-cyan)',
                color: isCharging || simulatedCharge >= targetCharge ? 'rgba(255,255,255,0.3)' : '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: isCharging || simulatedCharge >= targetCharge ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isCharging ? 'CARGANDO...' : simulatedCharge >= targetCharge ? 'COMPLETADO' : 'INICIAR SIMULACIÓN'}
            </button>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '16px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              RESET
            </button>
          </div>

        </div>
      </IosFrame>
    </div>
  );
}
