import React, { useState, useEffect } from 'react';
import IosFrame from './ios_frame';

export default function AppPreview() {
  const [batteryKwh, setBatteryKwh] = useState(82);
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(80);
  const [chargeLevel, setChargeLevel] = useState('nivel2'); // 'nivel1', 'nivel2', 'dcfast'
  const [isCharging, setIsCharging] = useState(false);
  
  // Animation state
  const [simulatedCharge, setSimulatedCharge] = useState(20);

  useEffect(() => {
    setSimulatedCharge(currentCharge);
    setIsCharging(false);
  }, [currentCharge, targetCharge]);

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
      }, chargeLevel === 'dcfast' ? 30 : chargeLevel === 'nivel2' ? 80 : 150);
    }
    return () => clearInterval(interval);
  }, [isCharging, simulatedCharge, targetCharge, chargeLevel]);

  const kwhToDeliver = (batteryKwh * (targetCharge - currentCharge)) / 100;
  const kwhDelivered = Math.max(0, (batteryKwh * (simulatedCharge - currentCharge)) / 100);
  const costPerKwh = 1.2; // Pesos
  const totalCost = kwhDelivered * costPerKwh;

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
              background: isCharging ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: isCharging ? 'var(--electric-cyan)' : 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${isCharging ? 'var(--electric-cyan)' : 'rgba(255, 255, 255, 0.1)'}`
            }}>
              {isCharging ? 'CHARGING' : 'STANDBY'}
            </div>
          </div>

          {/* Main Dashboard Card */}
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
            
            {/* Battery Progress Bar */}
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

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>ENERGÍA (kWh)</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>+{kwhDelivered.toFixed(1)}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>COSTO EST.</div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--neon-green)' }}>${totalCost.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
                <span>Capacidad Batería</span>
                <span>{batteryKwh} kWh</span>
              </div>
              <input type="range" min="40" max="120" value={batteryKwh} onChange={(e) => setBatteryKwh(Number(e.target.value))} disabled={isCharging} style={{ width: '100%', accentColor: 'var(--electric-cyan)' }} />
            </div>

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

          {/* Speed Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['nivel1', 'nivel2', 'dcfast'].map(level => (
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
                {level === 'nivel1' ? 'NIVEL 1' : level === 'nivel2' ? 'NIVEL 2' : 'DC FAST'}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
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
