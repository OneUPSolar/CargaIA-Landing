import React from 'react';
import IosFrame from './ios_frame';
import { Stage, Sprite, useSprite, Easing, interpolate } from './animations';

function AnimatedContent() {
  const { t } = useSprite();
  const yOffset = interpolate(t, [0, 0.2], [50, 0], Easing.expoOut);
  const opacity = interpolate(t, [0, 0.2], [0, 1]);

  return (
    <div style={{ 
      padding: '40px 20px', 
      color: '#fff', 
      fontFamily: 'Inter, sans-serif',
      transform: `translateY(${yOffset}px)`,
      opacity: opacity
    }}>
      <h2 style={{ fontSize: '24px', color: 'var(--electric-cyan)', marginBottom: '20px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>CARGAIA_OS</h2>
      <div style={{ 
        background: 'rgba(4, 4, 6, 0.85)', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}>[NODE_STATUS]</div>
        <div style={{ fontSize: '42px', marginTop: '10px', fontWeight: 200, fontFamily: 'Outfit' }}>ONLINE</div>
        
        <div style={{ marginTop: '30px', height: '4px', background: 'rgba(255, 255, 255, 0.18)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${interpolate(t, [0.2, 0.8], [0, 85], Easing.easeInOut)}%`, background: 'var(--electric-cyan)', boxShadow: '0 0 10px var(--electric-cyan)' }} />
        </div>
        <div style={{ fontSize: '12px', marginTop: '12px', color: 'rgba(255, 255, 255, 0.58)', fontFamily: 'var(--font-mono)' }}>
          CHARGE: {Math.round(interpolate(t, [0.2, 0.8], [0, 85], Easing.easeInOut))}%
        </div>
      </div>
    </div>
  );
}

export default function AppPreview() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
      <Stage duration={6} width={450} height={900} bgColor="transparent">
        <Sprite start={0} end={6}>
          <IosFrame time="9:41" battery={85} darkMode={true}>
            <AnimatedContent />
          </IosFrame>
        </Sprite>
      </Stage>
    </div>
  );
}
