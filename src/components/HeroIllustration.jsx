import React, { useEffect, useRef } from 'react';

export default function HeroIllustration() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = window.gsap.context(() => {
      // Setup Initial States
      window.gsap.set('.illust-element', { opacity: 0, y: 20 });
      window.gsap.set('.data-wave', { opacity: 0, x: -10 });
      window.gsap.set('.cable-pulse', { opacity: 0, strokeDashoffset: 400 });

      // Entrance Timeline
      const tl = window.gsap.timeline({ delay: 0.2 });
      
      tl.to('.illust-element', {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      })
      .to('.data-wave', {
        opacity: 0.6,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.5")
      .to('.cable-pulse', {
        opacity: 1,
        duration: 0.5
      }, "-=0.2");

      // Continuous Animations
      // 1. Phone hovering
      window.gsap.to('.phone-group', {
        y: -10,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      // 2. Data Waves pulsing
      window.gsap.to('.data-wave', {
        x: 15,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        repeat: -1,
        ease: "sine.inOut"
      });

      // 3. Charger LED breathing
      window.gsap.to('.charger-led', {
        opacity: 0.4,
        scale: 0.95,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        transformOrigin: "center"
      });

      // 4. Power cable pulse flowing to car
      window.gsap.to('.cable-pulse', {
        strokeDashoffset: 0,
        duration: 2,
        ease: "none",
        repeat: -1
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '600px', marginLeft: '-50px', transform: 'scale(1.3)', transformOrigin: 'center left' }}>
      
      {/* SCALED UP SVG CANVAS */}
      <svg viewBox="0 0 900 450" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="light-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="power-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--electric-cyan)" stopOpacity="1" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* =========================================================================
            CONNECTION 1: DATA WAVES (Phone -> Charger) 
            ========================================================================= */}
        <g className="data-waves" transform="translate(140, 200)">
          <path className="data-wave" d="M 0 -20 Q 20 0 0 20" fill="none" stroke="var(--electric-cyan)" strokeWidth="2" opacity="0" filter="url(#light-glow)" />
          <path className="data-wave" d="M 20 -30 Q 45 0 20 30" fill="none" stroke="var(--electric-cyan)" strokeWidth="2" opacity="0" filter="url(#light-glow)" />
          <path className="data-wave" d="M 40 -40 Q 70 0 40 40" fill="none" stroke="var(--electric-cyan)" strokeWidth="2" opacity="0" filter="url(#light-glow)" />
        </g>

        {/* =========================================================================
            CONNECTION 2: PHYSICAL CABLE (Charger -> EV) 
            ========================================================================= */}
        <g className="illust-element" transform="translate(-100, -60)">
          {/* Base Cable connecting Wallbox to EV */}
          <path d="M 370 310 C 370 430, 500 450, 600 400 C 680 360, 720 360, 770 340" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
          <path d="M 370 310 C 370 430, 500 450, 600 400 C 680 360, 720 360, 770 340" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          
          {/* Glowing Energy Pulse traveling on cable */}
          <path className="cable-pulse" d="M 370 310 C 370 430, 500 450, 600 400 C 680 360, 720 360, 770 340" fill="none" stroke="url(#power-flow)" strokeWidth="4" strokeLinecap="round" strokeDasharray="100 300" filter="url(#neon-glow)" />
        </g>

        {/* =========================================================================
            OBJECT 1: SMARTPHONE (Left)
            ========================================================================= */}
        <g className="illust-element phone-group" transform="translate(20, 120)">
          {/* Phone Chassis */}
          <rect x="0" y="0" width="100" height="200" rx="16" fill="#111" stroke="#333" strokeWidth="3" />
          <rect x="5" y="5" width="90" height="190" rx="12" fill="#000" />
          
          {/* Top Notch/Dynamic Island */}
          <rect x="35" y="12" width="30" height="8" rx="4" fill="#111" />
          
          {/* CargaIA App UI */}
          <circle cx="50" cy="70" r="30" fill="none" stroke="#222" strokeWidth="4" />
          <circle cx="50" cy="70" r="30" fill="none" stroke="var(--electric-cyan)" strokeWidth="4" strokeDasharray="130 200" transform="rotate(-90 50 70)" filter="url(#light-glow)" />
          <text x="50" y="75" fill="#fff" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">82%</text>
          
          {/* App details lines */}
          <rect x="20" y="125" width="60" height="6" rx="3" fill="#333" />
          <rect x="20" y="140" width="40" height="6" rx="3" fill="#333" />
          <rect x="20" y="160" width="60" height="24" rx="6" fill="var(--electric-cyan)" opacity="0.8" />
          <text x="50" y="176" fill="#000" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">CHARGING</text>
        </g>

        {/* =========================================================================
            OBJECT 2: CARGAIA WALLBOX CHARGER (Center)
            ========================================================================= */}
        <g className="illust-element" transform="translate(240, 60)">
          {/* Backplate / Shadow */}
          <rect x="-10" y="10" width="120" height="260" rx="14" fill="rgba(0,0,0,0.5)" filter="url(#light-glow)" />
          
          {/* Charger Main Body */}
          <rect x="0" y="0" width="100" height="260" rx="12" fill="#151518" stroke="#444" strokeWidth="1" />
          <rect x="5" y="5" width="90" height="250" rx="8" fill="#0A0A0C" />
          
          {/* Glass Faceplate */}
          <rect x="10" y="10" width="80" height="180" rx="4" fill="rgba(255,255,255,0.02)" />

          {/* LED Ring (Breathing) */}
          <circle className="charger-led" cx="50" cy="60" r="30" fill="none" stroke="var(--electric-cyan)" strokeWidth="3" filter="url(#neon-glow)" />
          <circle cx="50" cy="60" r="2" fill="#fff" filter="url(#light-glow)" />
          
          {/* CargaIA Logo Type on Charger */}
          <text x="50" y="130" fill="#fff" fontSize="12" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1" textAnchor="middle">CARGA<tspan fill="var(--electric-cyan)">IA</tspan></text>
          <text x="50" y="145" fill="#666" fontSize="8" fontFamily="monospace" letterSpacing="1" textAnchor="middle">SMART EVSE</text>
          
          {/* Cable Holster Area */}
          <rect x="35" y="210" width="30" height="30" rx="15" fill="#000" stroke="#222" strokeWidth="2" />
          <circle cx="50" cy="225" r="5" fill="#111" />
        </g>

        {/* =========================================================================
            OBJECT 3: REAL ELECTRIC VEHICLE IMAGE (Right)
            ========================================================================= */}
        <g className="illust-element" transform="translate(420, -20)">
          {/* CSS blend mode trick: screen + lighten helps hide near-black artifacts */}
          <image href="./assets/ev_side_profile.png" x="0" y="0" width="550" height="550" style={{ mixBlendMode: 'screen', filter: 'contrast(1.2) brightness(1.1)' }} />
          
          {/* Glowing Connection Point on the car (positioned roughly at the port) */}
          <circle cx="280" cy="300" r="8" fill="none" stroke="var(--electric-cyan)" strokeWidth="2" filter="url(#neon-glow)" />
          <circle cx="280" cy="300" r="3" fill="var(--electric-cyan)" filter="url(#light-glow)" />
          
          {/* Plug Head inserted into EV */}
          <rect x="270" y="295" width="20" height="10" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
        </g>
        
      </svg>
    </div>
  );
}
