/**
 * EVChargingSimulator.jsx
 *
 * Self-contained interactive EV charging session simulator for the Cargaia
 * landing page. No external animation engine, no Stage/Sprite — just React
 * state + requestAnimationFrame.
 *
 * Inputs:
 *   - Battery capacity (kWh)              30-150
 *   - Current charge (%)                  0-99
 *   - Target charge (%)                   1-100
 *   - Charger speed (L1 / L2 / DCFC)      kW selector
 *
 * Live readouts (animated when SIMULATING):
 *   - Charge percent (rises from current toward target)
 *   - kWh delivered (cumulative)
 *   - Cost in MXN ($0.08–0.10 per kWh, midpoint = $0.09)
 *   - Solar contribution % (time-of-day curve, peaks midday)
 *   - Grid export indicator (lit when solar > demand)
 *   - Session time (mm:ss)
 *
 * Each second of simulator wall-time = 1 minute of session time, so a 30-min
 * session completes in 30s of viewer time.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/* Tunables                                                            */
/* ------------------------------------------------------------------ */

const CHARGERS = [
  { id: 'L1',   label: 'NIVEL 1',  kw: 1.4,  desc: '120V doméstico'         },
  { id: 'L2',   label: 'NIVEL 2',  kw: 7.2,  desc: '240V residencial'       },
  { id: 'DCFC', label: 'DC FAST',  kw: 50,   desc: 'Cargador rápido'        },
  { id: 'HPC',  label: 'HPC',      kw: 150,  desc: 'High-Power 350kW share' },
];

const TARIFA_MIN = 0.08;
const TARIFA_MAX = 0.10;
const TARIFA_MID = (TARIFA_MIN + TARIFA_MAX) / 2; // 0.09 MXN/kWh as displayed

// 1 wall second → SIM_MINUTES_PER_SECOND of simulated charging time.
const SIM_MINUTES_PER_SECOND = 1;

/* ------------------------------------------------------------------ */
/* Solar contribution curve                                            */
/* Smooth sine bell centered at solar noon (12:00) with morning ramp   */
/* and evening fall. Returns 0..1 fraction of charger draw served by   */
/* solar at the given hour-of-day (24h decimal, e.g. 13.5 = 1:30 PM).  */
/* ------------------------------------------------------------------ */
function solarFraction(hour) {
  if (hour < 6 || hour > 19) return 0;
  // Bell curve peaking at noon, normalized to peak ~0.85 (rest pulled
  // from grid even at noon so we don't claim 100% solar — realistic).
  const peak = 12;
  const width = 4.5;
  const x = (hour - peak) / width;
  const bell = Math.exp(-x * x);
  return Math.max(0, Math.min(0.85, bell * 0.85));
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = {
  outer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
    margin: '3rem 0',
    width: '100%',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 360px) minmax(280px, 380px)',
    gap: '3rem',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 880,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    color: 'rgba(255,255,255,0.85)',
  },
  controlBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: 11,
    letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
  },
  valueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    fontSize: 14,
  },
  valueBig: {
    fontFamily: 'Outfit, var(--font-heading, sans-serif)',
    fontSize: 22,
    fontWeight: 200,
    color: '#fff',
    fontVariantNumeric: 'tabular-nums',
  },
  rangeWrapper: {
    position: 'relative',
    height: 4,
    background: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
  },
  range: {
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    height: 24,
    margin: '-10px 0',
    cursor: 'pointer',
    position: 'absolute',
    top: -10,
    left: 0,
  },
  chargerRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  chargerBtn: (active) => ({
    padding: '10px 6px',
    background: active ? 'rgba(0, 242, 255, 0.10)' : 'rgba(255,255,255,0.03)',
    border: active
      ? '1px solid rgba(0, 242, 255, 0.55)'
      : '1px solid rgba(255,255,255,0.10)',
    borderRadius: 4,
    color: active ? '#00f2ff' : 'rgba(255,255,255,0.65)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    fontSize: 10,
    letterSpacing: '0.15em',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: active ? '0 0 12px rgba(0, 242, 255, 0.20)' : 'none',
  }),
  chargerKw: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: 300,
  },
  actions: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  primary: (active) => ({
    flex: 1,
    padding: '14px 18px',
    background: active
      ? 'linear-gradient(135deg, rgba(0, 242, 255, 0.18), rgba(110, 0, 255, 0.18))'
      : 'rgba(0, 242, 255, 0.12)',
    border: '1px solid rgba(0, 242, 255, 0.55)',
    borderRadius: 4,
    color: '#00f2ff',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    fontSize: 11,
    letterSpacing: '0.22em',
    fontWeight: 500,
    transition: 'all 0.18s ease',
    boxShadow: active ? '0 0 24px rgba(0, 242, 255, 0.30)' : 'none',
  }),
  secondary: {
    padding: '14px 18px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 4,
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    fontSize: 11,
    letterSpacing: '0.22em',
    transition: 'all 0.18s ease',
  },

  /* iPhone frame */
  phoneOuter: {
    position: 'relative',
    width: 360,
    height: 720,
    borderRadius: 48,
    background: 'linear-gradient(135deg, #1a1a1f 0%, #0a0a0d 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow:
      '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 1px rgba(255,255,255,0.10), 0 0 80px rgba(0, 242, 255, 0.08)',
    padding: 8,
    flexShrink: 0,
  },
  phoneScreen: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    background: 'radial-gradient(ellipse at top, #0e1620 0%, #050608 60%, #020203 100%)',
    overflow: 'hidden',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    color: '#fff',
  },
  phoneNotch: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 110,
    height: 28,
    background: '#000',
    borderRadius: 16,
    zIndex: 10,
  },
  statusBar: {
    position: 'absolute',
    top: 18,
    left: 28,
    right: 28,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    fontWeight: 500,
    color: '#fff',
    fontFamily: '-apple-system, system-ui, sans-serif',
    zIndex: 5,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 130,
    height: 4,
    background: 'rgba(255,255,255,0.55)',
    borderRadius: 3,
  },

  /* App content inside phone */
  appBody: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    bottom: 30,
    padding: '0 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  appTitle: {
    fontSize: 11,
    letterSpacing: '0.25em',
    color: '#00f2ff',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    textShadow: '0 0 12px rgba(0, 242, 255, 0.50)',
  },
  appSubtitle: {
    fontSize: 9,
    letterSpacing: '0.20em',
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
  },
  bigNum: (color) => ({
    fontSize: 56,
    fontWeight: 200,
    fontFamily: 'Outfit',
    color: color || '#fff',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  }),
  metricCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  progressTrack: {
    height: 6,
    background: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    background: color,
    boxShadow: `0 0 12px ${color}`,
    borderRadius: 3,
    transition: 'width 0.16s linear',
  }),
  pill: (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: active ? 'rgba(0, 255, 136, 0.10)' : 'rgba(255,255,255,0.05)',
    border: active
      ? '1px solid rgba(0, 255, 136, 0.50)'
      : '1px solid rgba(255,255,255,0.10)',
    borderRadius: 999,
    fontSize: 9,
    letterSpacing: '0.18em',
    color: active ? '#00ff88' : 'rgba(255,255,255,0.55)',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    boxShadow: active ? '0 0 12px rgba(0, 255, 136, 0.25)' : 'none',
  }),
  pillDot: (active) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    background: active ? '#00ff88' : 'rgba(255,255,255,0.30)',
    boxShadow: active ? '0 0 8px #00ff88' : 'none',
    animation: active ? 'cargaiaPulse 1.4s ease-in-out infinite' : 'none',
  }),
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 9,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
  },
  caption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    letterSpacing: '0.12em',
    maxWidth: 720,
    lineHeight: 1.6,
    padding: '0 1rem',
  },
};

/* ------------------------------------------------------------------ */
/* Inline keyframes (pulse for live indicator dot)                     */
/* ------------------------------------------------------------------ */

const KEYFRAMES = `
@keyframes cargaiaPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(0.85); }
}
input[type="range"].cargaia-range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
input[type="range"].cargaia-range::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(to right,
    rgba(0, 242, 255, 0.55) var(--pct, 0%),
    rgba(255, 255, 255, 0.10) var(--pct, 0%));
  border-radius: 2px;
}
input[type="range"].cargaia-range::-moz-range-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 2px;
}
input[type="range"].cargaia-range::-moz-range-progress {
  height: 4px;
  background: rgba(0, 242, 255, 0.55);
  border-radius: 2px;
}
input[type="range"].cargaia-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00f2ff;
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.65), 0 0 0 4px rgba(0,242,255,0.10);
  cursor: pointer;
  border: none;
  margin-top: -6px;
}
input[type="range"].cargaia-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00f2ff;
  box-shadow: 0 0 12px rgba(0, 242, 255, 0.65);
  cursor: pointer;
  border: none;
}
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function fmtMxn(v) {
  return v.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Range with label/value row                                          */
/* ------------------------------------------------------------------ */

function RangeInput({ label, value, min, max, step, suffix, onChange, disabled }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={styles.controlBlock}>
      <div style={styles.valueRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.valueBig}>
          {value}
          <span
            style={{
              fontSize: 12,
              marginLeft: 4,
              color: 'rgba(255,255,255,0.50)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {suffix}
          </span>
        </span>
      </div>
      <input
        className="cargaia-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          opacity: disabled ? 0.5 : 1,
          ['--pct']: `${pct}%`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function EVChargingSimulator() {
  // Inputs
  const [battery, setBattery] = useState(75);   // kWh, e.g. Tesla Model 3 LR ~75
  const [startPct, setStartPct] = useState(20);
  const [targetPct, setTargetPct] = useState(80);
  const [chargerId, setChargerId] = useState('L2');

  // Live state
  const [running, setRunning] = useState(false);
  const [currentPct, setCurrentPct] = useState(20); // animated
  const [elapsedSec, setElapsedSec] = useState(0);  // simulated minutes (in sim-time)
  const [done, setDone] = useState(false);

  // refs to avoid stale closure in RAF
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);
  const stateRef = useRef({ battery, startPct, targetPct, chargerId });

  useEffect(() => {
    stateRef.current = { battery, startPct, targetPct, chargerId };
  }, [battery, startPct, targetPct, chargerId]);

  // Keep currentPct in sync with startPct when not running.
  useEffect(() => {
    if (!running) {
      setCurrentPct(startPct);
      setElapsedSec(0);
      setDone(false);
    }
  }, [startPct, running]);

  // Ensure target >= start.
  useEffect(() => {
    if (targetPct <= startPct) {
      setTargetPct(Math.min(100, startPct + 1));
    }
  }, [startPct, targetPct]);

  const charger = CHARGERS.find((c) => c.id === chargerId) || CHARGERS[1];
  const targetKwh = (battery * targetPct) / 100;
  const startKwh = (battery * startPct) / 100;
  const totalKwhNeeded = targetKwh - startKwh;

  // Realistic charge time (minutes), with a soft taper above 80% to mimic
  // lithium-ion CC/CV behavior. Below 80%: linear at full power. Above 80%:
  // average effective power ≈ 0.5x.
  const fullPowerKwh = Math.max(0, Math.min(targetKwh, battery * 0.80) - startKwh);
  const taperKwh = Math.max(0, targetKwh - Math.max(startKwh, battery * 0.80));
  const minutesToTarget =
    (fullPowerKwh / charger.kw) * 60 + (taperKwh / (charger.kw * 0.5)) * 60;

  // Live derived values
  const liveDeliveredKwh = ((currentPct - startPct) / 100) * battery;
  const liveCostMxn = liveDeliveredKwh * TARIFA_MID;

  // Hour-of-day starts at 09:00 and advances with elapsedSec (simulated).
  const simHour = (9 + elapsedSec / 3600) % 24;
  const solarFrac = solarFraction(simHour);
  const draw = running ? charger.kw : 0;

  // Solar panel sized in proportion: assume 5 kW residential array.
  const arrayKw = 5;
  const solarKw = solarFrac * arrayKw;
  const exportingToGrid = solarKw > draw + 0.1;

  // RAF loop
  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
      return;
    }

    function tick(now) {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const realDeltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const { battery: b, targetPct: tgt, chargerId: cId } = stateRef.current;
      const cur = CHARGERS.find((c) => c.id === cId) || CHARGERS[1];

      // Each real second represents SIM_MINUTES_PER_SECOND simulated minutes.
      const simMinDelta = realDeltaSec * SIM_MINUTES_PER_SECOND;
      const simSecDelta = simMinDelta * 60;

      setElapsedSec((prev) => prev + simSecDelta);

      setCurrentPct((prev) => {
        // Effective kW depends on current SOC (taper > 80%)
        const effectiveKw = prev >= 80 ? cur.kw * 0.5 : cur.kw;
        // kWh added in this real frame: kW * (sim-hours)
        const simHourDelta = simMinDelta / 60;
        const kwhAdded = effectiveKw * simHourDelta;
        const pctAdded = (kwhAdded / b) * 100;
        const next = prev + pctAdded;
        if (next >= tgt) {
          // Stop at target on next frame
          queueMicrotask(() => {
            setRunning(false);
            setDone(true);
          });
          return tgt;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, [running]);

  const start = useCallback(() => {
    setCurrentPct(startPct);
    setElapsedSec(0);
    setDone(false);
    setRunning(true);
  }, [startPct]);

  const reset = useCallback(() => {
    setRunning(false);
    setCurrentPct(startPct);
    setElapsedSec(0);
    setDone(false);
  }, [startPct]);

  const progressOfSession =
    targetPct === startPct
      ? 0
      : clamp(((currentPct - startPct) / (targetPct - startPct)) * 100, 0, 100);

  const liveColor = currentPct >= targetPct ? '#00ff88' : '#00f2ff';

  return (
    <div style={styles.outer}>
      <style>{KEYFRAMES}</style>

      <div style={styles.layout} className="ev-sim-layout">

        {/* LEFT — controls */}
        <div style={styles.controls}>
          <RangeInput
            label="BATERÍA"
            value={battery}
            min={30}
            max={150}
            step={1}
            suffix="kWh"
            onChange={(v) => {
              if (running) return;
              setBattery(v);
            }}
            disabled={running}
          />
          <RangeInput
            label="CARGA ACTUAL"
            value={startPct}
            min={0}
            max={99}
            step={1}
            suffix="%"
            onChange={(v) => {
              if (running) return;
              setStartPct(v);
            }}
            disabled={running}
          />
          <RangeInput
            label="META"
            value={targetPct}
            min={Math.min(99, startPct + 1)}
            max={100}
            step={1}
            suffix="%"
            onChange={(v) => {
              if (running) return;
              setTargetPct(v);
            }}
            disabled={running}
          />

          <div style={styles.controlBlock}>
            <span style={styles.label}>VELOCIDAD DE CARGA</span>
            <div style={styles.chargerRow}>
              {CHARGERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !running && setChargerId(c.id)}
                  disabled={running}
                  style={styles.chargerBtn(chargerId === c.id)}
                >
                  <span>{c.label}</span>
                  <span style={styles.chargerKw}>{c.kw}kW</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={running ? () => setRunning(false) : start}
              style={styles.primary(running)}
            >
              {running ? '◼  PAUSAR' : done ? '↻  CARGAR DE NUEVO' : '▶  INICIAR CARGA'}
            </button>
            <button
              type="button"
              onClick={reset}
              style={styles.secondary}
              disabled={!running && currentPct === startPct && elapsedSec === 0}
            >
              RESET
            </button>
          </div>
        </div>

        {/* RIGHT — phone */}
        <div style={styles.phoneOuter}>
          <div style={styles.phoneScreen}>
            <div style={styles.phoneNotch} />
            <div style={styles.statusBar}>
              <span>9:41</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>●●●●</span>
                <span style={{ fontSize: 11 }}>5G</span>
                <span>▮▮▮▮▮</span>
              </span>
            </div>

            <div style={styles.appBody}>
              <div>
                <div style={styles.appTitle}>CARGAIA_OS</div>
                <div style={{ ...styles.appSubtitle, marginTop: 4 }}>
                  {running
                    ? '◉ SESIÓN ACTIVA'
                    : done
                    ? '✓ CARGA COMPLETA'
                    : '◌ EN ESPERA'}
                </div>
              </div>

              {/* Big charge percent */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={styles.bigNum(liveColor)}>{currentPct.toFixed(1)}</span>
                  <span
                    style={{
                      fontSize: 18,
                      color: 'rgba(255,255,255,0.55)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    %
                  </span>
                </div>
                <div style={{ ...styles.appSubtitle, marginTop: 2 }}>
                  ESTADO DE CARGA
                </div>
              </div>

              {/* Session progress bar */}
              <div>
                <div style={styles.progressTrack}>
                  <div style={styles.progressFill(progressOfSession, liveColor)} />
                </div>
                <div
                  style={{
                    ...styles.flowRow,
                    marginTop: 6,
                    fontSize: 9,
                  }}
                >
                  <span>{startPct}%</span>
                  <span style={{ color: liveColor }}>
                    {progressOfSession.toFixed(0)}%
                  </span>
                  <span>{targetPct}%</span>
                </div>
              </div>

              {/* Two metric cards */}
              <div style={styles.twoCol}>
                <div style={styles.metricCard}>
                  <span style={styles.appSubtitle}>kWh ENTREGADOS</span>
                  <span
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: 22,
                      fontWeight: 300,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {liveDeliveredKwh.toFixed(2)}
                  </span>
                </div>
                <div style={styles.metricCard}>
                  <span style={styles.appSubtitle}>COSTO</span>
                  <span
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: 22,
                      fontWeight: 300,
                      color: '#fff',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmtMxn(liveCostMxn)}
                  </span>
                </div>
              </div>

              {/* Solar contribution */}
              <div style={styles.metricCard}>
                <div style={{ ...styles.flowRow, marginBottom: 8 }}>
                  <span>APORTACIÓN SOLAR</span>
                  <span style={{ color: '#fff', fontFamily: 'Outfit', fontSize: 14 }}>
                    {(solarFrac * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={styles.progressFill(
                      solarFrac * 100,
                      '#ffb000'
                    )}
                  />
                </div>
                <div style={{ ...styles.flowRow, marginTop: 8 }}>
                  <span>
                    SOLAR {solarKw.toFixed(1)}kW · DEMANDA {draw.toFixed(1)}kW
                  </span>
                  <span style={styles.pill(exportingToGrid)}>
                    <span style={styles.pillDot(exportingToGrid)} />
                    {exportingToGrid ? 'EXPORTANDO' : 'CONSUMIENDO'}
                  </span>
                </div>
              </div>

              {/* Footer: time + tariff */}
              <div
                style={{
                  ...styles.flowRow,
                  marginTop: 'auto',
                  paddingTop: 4,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 9,
                }}
              >
                <span>SESIÓN {fmtTime(elapsedSec)}</span>
                <span>RESTAN {fmtTime(Math.max(0, (minutesToTarget * 60) - elapsedSec))}</span>
                <span>${TARIFA_MIN.toFixed(2)}–${TARIFA_MAX.toFixed(2)}/kWh</span>
              </div>
            </div>

            <div style={styles.homeIndicator} />
          </div>
        </div>
      </div>

      <p style={styles.caption}>
        SIMULACIÓN INTERACTIVA · 1 SEGUNDO REAL = 1 MINUTO DE CARGA · TARIFA
        REFERENCIAL ${TARIFA_MIN.toFixed(2)}–${TARIFA_MAX.toFixed(2)} MXN/kWh ·
        APORTACIÓN SOLAR BASADA EN ARREGLO DE 5 kW EN TIJUANA, BC
      </p>

      {/* Mobile-friendly stacking */}
      <style>{`
        @media (max-width: 768px) {
          .ev-sim-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
