import React, { useMemo } from 'react';
import { RIPPLE_STYLES, COASTLINE_PATH } from './GameBoardUtils';

// ---------------------------------------------------------
// VARIANT G: THE RIVER WEAVE
// Integrated seamlessly back into the game as PacificOceanOverlay
// ---------------------------------------------------------
export const PacificOceanOverlay = ({ height = 800, ripples = [] }) => {
  const shiftX = 140, shiftY = -120, scale = 0.80;
  const bleedHeight = height + 200;

  const CSS_G = `
    @keyframes panUpG { from { transform: translateY(0px); } to { transform: translateY(-320px); } }
    .anim-g-up { animation: panUpG 18s linear infinite; }

    @keyframes panDownG { from { transform: translateY(0px); } to { transform: translateY(400px); } }
    .anim-g-down { animation: panDownG 12s linear infinite; }

    .anim-g-foam { animation: lapFoamG 4s ease-in-out infinite; transform-origin: center; }
    @keyframes lapFoamG {
      0%, 100% { stroke-width: 15px; opacity: 0.3; transform: translateX(-5px); }
      50% { stroke-width: 40px; opacity: 0.9; transform: translateX(5px); }
    }
  `;

  // Draw grouped flowing ribbons (Upward current)
  const renderG1Waves = () => [-320, 0, 320, 640].map(y => (
    <g key={y} fill='none' stroke='white' strokeOpacity='0.07' strokeWidth='3'>
      {/* Center line */}
      <path d={`M 80 ${y} C 140 ${y+106}, 20 ${y+213}, 80 ${y+320}`} strokeWidth='4' />
      {/* Left parallel */}
      <path d={`M 65 ${y} C 125 ${y+106}, 5 ${y+213}, 65 ${y+320}`} />
      {/* Right parallel */}
      <path d={`M 95 ${y} C 155 ${y+106}, 35 ${y+213}, 95 ${y+320}`} />
    </g>
  ));

  // Draw wider, thicker soft current (Downward current)
  const renderG2Waves = () => [-400, 0, 400, 800].map(y => (
    <g key={y} fill='none' stroke='white' strokeOpacity='0.15' strokeWidth='4'>
      <path d={`M 100 ${y} C 50 ${y+133}, 150 ${y+266}, 100 ${y+400}`} />
      {/* Faint edge accents */}
      <path d={`M 85 ${y} C 35 ${y+133}, 135 ${y+266}, 85 ${y+400}`} strokeOpacity='0.05' strokeWidth='2' />
      <path d={`M 115 ${y} C 65 ${y+133}, 165 ${y+266}, 115 ${y+400}`} strokeOpacity='0.05' strokeWidth='2' />
    </g>
  ));

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${bleedHeight}px`, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{CSS_G}</style>
      <style>{RIPPLE_STYLES}</style>
      <div style={{ position: 'absolute', top: 0, left: `${shiftX}px`, width: '5362px', height: `${bleedHeight}px`, pointerEvents: 'none', transform: `scale(${scale}) translateY(${shiftY}px)`, transformOrigin: 'left center' }}>
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <svg width="100%" height="100%" viewBox="250 400 5112.771 600" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="oceanGradG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#004b78" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <pattern id="pattern-G1" width="160" height="320" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                <g className="anim-g-up">{renderG1Waves()}</g>
              </pattern>

              <pattern id="pattern-G2" width="200" height="400" patternUnits="userSpaceOnUse" patternTransform="scale(1.1) translate(40, 0)">
                <g className="anim-g-down">{renderG2Waves()}</g>
              </pattern>

              <clipPath id="clipG"><path d={COASTLINE_PATH} /></clipPath>
            </defs>

            <g>
              <path fill="url(#oceanGradG)" d={COASTLINE_PATH} />
              <path fill="url(#pattern-G1)" d={COASTLINE_PATH} />
              <path fill="url(#pattern-G2)" d={COASTLINE_PATH} />
              
              <g clipPath="url(#clipG)">
                <path className="anim-g-foam" fill="none" stroke="#ffffff" strokeLinejoin="round" strokeLinecap="round" d={COASTLINE_PATH} />
              </g>
            </g>
          </svg>

          {/* Interactive micro-ripples successfully ported back */}
          {ripples.map(r => {
            const localX = (r.x - shiftX) / scale;
            const localY = (r.y / scale) - shiftY;
            return (
              <div key={r.id} style={{ position: 'absolute', left: localX, top: localY }}>
                <div style={{ position: 'absolute', border: '2px solid #a5f3fc', borderRadius: '50%', width: '16px', height: '16px', animation: 'ripple-micro 1.5s ease-out forwards' }} />
                <div style={{ position: 'absolute', border: '1px solid #dbeafe', borderRadius: '50%', width: '16px', height: '16px', animation: 'ripple-micro 1.5s ease-out 0.15s forwards' }} />
                <div style={{ position: 'absolute', border: '1px solid white', borderRadius: '50%', width: '16px', height: '16px', animation: 'ripple-micro 1.5s ease-out 0.3s forwards' }} />
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: '-95px', top: '820px', fontSize: '64px', letterSpacing: '21px', fontWeight: 900, transform: 'translateY(-50%) rotate(-90deg) scaleY(1.2)', transformOrigin: 'center left', color: 'transparent', WebkitTextStroke: '2px rgba(255, 255, 255, 0.8)', textShadow: '0px 0px 20px rgba(255, 255, 255, 0.4)', fontFamily: 'system-ui, -apple-system, sans-serif', whiteSpace: 'nowrap' }}>PACIFIC OCEAN</div>
      </div>
    </div>
  );
};

const CartographicMountain = ({ x, y, scale }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <polygon points="-45,20 0,-40 45,20" fill="#0f172a" stroke="#020617" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="0,-40 5,-10 -5,5 0,22 45,20" fill="#020617" opacity="0.5" />
      <polygon points="-45,20 0,-40 5,-10 -5,5 0,22" fill="#1e293b" opacity="0.6" />
      <polyline points="0,-40 5,-10 -5,5 0,22" fill="none" stroke="#020617" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  );
};

export const CartographicMountainRange = ({ height }) => {
  const peaks = useMemo(() => {
    const mnts = [];
    let idCounter = 0;
    for (let y = -50; y < height + 100; y += 25) {
      const spineX = 3200 + Math.sin(y * 0.02) * 50; 
      mnts.push({ id: idCounter++, x: spineX, y: y + (Math.random() * 20), scale: 0.8 + Math.random() * 0.4 });
      if (Math.random() > 0.1) mnts.push({ id: idCounter++, x: spineX - (60 + Math.random() * 40), y: y + 10, scale: 0.6 + Math.random() * 0.3 });
      if (Math.random() > 0.2) mnts.push({ id: idCounter++, x: spineX - (140 + Math.random() * 50), y: y + 25, scale: 0.4 + Math.random() * 0.3 });
      if (Math.random() > 0.1) mnts.push({ id: idCounter++, x: spineX + (60 + Math.random() * 40), y: y + 15, scale: 0.6 + Math.random() * 0.3 });
      if (Math.random() > 0.2) mnts.push({ id: idCounter++, x: spineX + (140 + Math.random() * 50), y: y + 20, scale: 0.4 + Math.random() * 0.3 });
    }
    return mnts.sort((a, b) => a.y - b.y);
  }, [height]);

  const startLineX = 3000; 
  const endLineX = 3360;   

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
      <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <line x1={startLineX + 6} y1="0" x2={startLineX + 6} y2={height} stroke="#111111" strokeWidth="6" strokeDasharray="30, 20" opacity="0.5" />
        <line x1={startLineX} y1="0" x2={startLineX} y2={height} stroke="#eab308" strokeWidth="6" strokeDasharray="30, 20" opacity="0.8" />
        <line x1={startLineX - 2} y1="0" x2={startLineX - 2} y2={height} stroke="#fef08a" strokeWidth="2" strokeDasharray="30, 20" />
        <line x1={endLineX + 6} y1="0" x2={endLineX + 6} y2={height} stroke="#111111" strokeWidth="6" strokeDasharray="30, 20" opacity="0.5" />
        <line x1={endLineX} y1="0" x2={endLineX} y2={height} stroke="#eab308" strokeWidth="6" strokeDasharray="30, 20" opacity="0.8" />
        <line x1={endLineX - 2} y1="0" x2={endLineX - 2} y2={height} stroke="#fef08a" strokeWidth="2" strokeDasharray="30, 20" />
        
        {peaks.map(p => (
          <CartographicMountain key={`peak-${p.id}`} x={p.x} y={p.y} scale={p.scale} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: `${startLineX - 25}px`, top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)', color: '#fef08a', fontSize: '24px', fontWeight: 900, letterSpacing: '12px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontFamily: 'serif', whiteSpace: 'nowrap' }}>ROCKY MOUNTAINS</div>
      <div style={{ position: 'absolute', left: `${endLineX - 25}px`, top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)', color: '#fef08a', fontSize: '24px', fontWeight: 900, letterSpacing: '12px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontFamily: 'serif', whiteSpace: 'nowrap' }}>ROCKY MOUNTAINS</div>
    </div>
  );
};

const RustBeltFactory = ({ x, y, scale }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <g transform="scale(0.8) translate(12.5, 5)">
      <circle cx="35" cy="35" r="8" fill="#020617" opacity="0.4" className="smog-a" style={{ animationDelay: '0s' }} />
      <circle cx="65" cy="25" r="9" fill="#020617" opacity="0.6" className="smog-b" style={{ animationDelay: '0.4s' }} />
      <polygon points="50,55 -5,82.5 50,110 105,82.5" fill="#0f172a" stroke="#020617" strokeWidth="2" />
      <polygon points="-5,82.5 50,110 50,118 -5,90.5" fill="#020617" opacity="0.5" />
      <polygon points="50,110 105,82.5 105,90.5 50,118" fill="#020617" opacity="0.8" />
      <polygon points="25,77.5 35,82.5 35,45 29.5,42.25" fill="#1e293b" opacity="0.5" />
      <polygon points="35,82.5 45,77.5 40.5,42.25 35,45" fill="#020617" opacity="0.6" />
      <polygon points="29.5,42.25 35,45 40.5,42.25 35,39.5" fill="#020617" opacity="0.8" />
      <polygon points="55,77.5 65,82.5 65,35 59.5,32.25" fill="#1e293b" opacity="0.5" />
      <polygon points="65,82.5 75,77.5 70.5,32.25 65,35" fill="#020617" opacity="0.6" />
      <polygon points="59.5,32.25 65,35 70.5,32.25 65,29.5" fill="#020617" opacity="0.8" />
      <polygon points="10,80 20,85 20,25 14.5,22.25" fill="#1e293b" opacity="0.5" />
      <polygon points="20,85 30,80 25.5,22.25 20,25" fill="#020617" opacity="0.6" />
      <polygon points="14.5,22.25 20,25 25.5,22.25 20,19.5" fill="#020617" opacity="0.8" />
      <polygon points="40,95 50,100 50,15 44.5,12.25" fill="#1e293b" opacity="0.5" />
      <polygon points="50,100 60,95 55.5,12.25 50,15" fill="#020617" opacity="0.6" />
      <polygon points="44.5,12.25 50,15 55.5,12.25 50,9.5" fill="#020617" opacity="0.8" />
      <polygon points="70,80 80,85 80,10 74.5,7.25" fill="#1e293b" opacity="0.5" />
      <polygon points="80,85 90,80 85.5,7.25 80,10" fill="#020617" opacity="0.6" />
      <polygon points="74.5,7.25 80,10 85.5,7.25 80,4.5" fill="#020617" opacity="0.8" />
      <polyline points="14.5,22.25 20,25 25.5,22.25" stroke="#020617" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <polyline points="20,85 20,25" stroke="#020617" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <polyline points="44.5,12.25 50,15 55.5,12.25" stroke="#020617" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <polyline points="50,100 50,15" stroke="#020617" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <polyline points="74.5,7.25 80,10 85.5,7.25" stroke="#020617" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <circle cx="20" cy="15" r="5" fill="#020617" opacity="0.5" className="smog-c" style={{ animationDelay: '1.2s' }} />
      <circle cx="35" cy="30" r="4" fill="#0f172a" opacity="0.5" className="smog-a" style={{ animationDelay: '1.6s' }} />
      <circle cx="50" cy="5" r="6" fill="#020617" opacity="0.6" className="smog-b" style={{ animationDelay: '0.9s' }} />
      <circle cx="65" cy="20" r="5" fill="#0f172a" opacity="0.5" className="smog-c" style={{ animationDelay: '1.3s' }} />
      <circle cx="80" cy="0" r="5" fill="#020617" opacity="0.5" className="smog-a" style={{ animationDelay: '1.1s' }} />
      <circle cx="25" cy="0" r="6" fill="#020617" opacity="0.4" className="smog-b" style={{ animationDelay: '2.0s' }} />
      <circle cx="55" cy="-10" r="7" fill="#020617" opacity="0.5" className="smog-a" style={{ animationDelay: '2.4s' }} />
      <circle cx="75" cy="-5" r="5" fill="#0f172a" opacity="0.4" className="smog-c" style={{ animationDelay: '1.8s' }} />
    </g>
  </g>
);

export const RustBeltLandscape = ({ height }) => {
  const factories = useMemo(() => {
    const facts = [];
    const startX = 3800; 
    const endX = 4900;   
    let idCounter = 0;
    for (let y = -50; y < height + 100; y += 80) {
      const isEven = Math.floor(y / 80) % 2 === 0;
      const offsetX = isEven ? 0 : 80;
      for (let x = startX; x <= endX; x += 160) {
        const jitterX = (Math.random() - 0.5) * 60; 
        const jitterY = (Math.random() - 0.5) * 50; 
        const scale = 0.5 + Math.random() * 0.4; 
        if (Math.random() > 0.2) {
            facts.push({ id: idCounter++, x: x + offsetX + jitterX, y: y + jitterY, scale: scale });
        }
      }
    }
    return facts.sort((a, b) => a.y - b.y);
  }, [height]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', opacity: 0.9 }}>
      <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {factories.map(f => (
          <RustBeltFactory key={`fact-${f.id}`} x={f.x} y={f.y} scale={f.scale} />
        ))}
      </svg>
    </div>
  );
};