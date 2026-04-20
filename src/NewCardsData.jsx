import React from 'react';

// --- SHARED HELPERS ---

const TrackSegment = () => (
  <g>
    <line x1="-12" y1="-25" x2="12" y2="-25" stroke="#78350f" strokeWidth="4" />
    <line x1="-12" y1="-10" x2="12" y2="-10" stroke="#78350f" strokeWidth="4" />
    <line x1="-12" y1="5" x2="12" y2="5" stroke="#78350f" strokeWidth="4" />
    <line x1="-12" y1="20" x2="12" y2="20" stroke="#78350f" strokeWidth="4" />
    <line x1="-12" y1="35" x2="12" y2="35" stroke="#78350f" strokeWidth="4" />
    <line x1="-6" y1="-35" x2="-6" y2="45" stroke="#94a3b8" strokeWidth="2" />
    <line x1="6" y1="-35" x2="6" y2="45" stroke="#94a3b8" strokeWidth="2" />
    <line x1="-5.5" y1="-35" x2="-5.5" y2="45" stroke="#ffffff" strokeWidth="0.5" />
    <line x1="5.5" y1="-35" x2="5.5" y2="45" stroke="#ffffff" strokeWidth="0.5" />
  </g>
);

const Box3D = ({ w, h, d, x, y, z, cTop, cFront, cRight, cLeft, cBack }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' }}>
    <div style={{ position: 'absolute', width: '100%', height: '100%', background: cTop, transform: `translateZ(${d}px)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: d, background: cFront, transformOrigin: 'top', transform: 'rotateX(90deg)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
    <div style={{ position: 'absolute', top: 0, right: 0, width: d, height: '100%', background: cRight, transformOrigin: 'right', transform: 'rotateY(90deg)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, width: d, height: '100%', background: cLeft, transformOrigin: 'left', transform: 'rotateY(-90deg)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: d, background: cBack, transformOrigin: 'bottom', transform: 'rotateX(-90deg)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
  </div>
);

// --- GREEN DECK ARTWORK ---

export const LegacyPlateIcon = () => (
  <div style={{ 
         position: 'relative',
         width: '60px', 
         height: '60px', 
         borderRadius: '6px', 
         display: 'flex', 
         alignItems: 'center', 
         justifyContent: 'center', 
         background: 'linear-gradient(135deg, #c08552 0%, #8a5a33 50%, #5c3a21 100%)',
         border: '2px solid #332011',
         boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6), inset 2px 2px 5px rgba(255,255,255,0.2), 0 5px 10px rgba(0,0,0,0.5)',
         flexShrink: 0
       }}>
    <div style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db', boxShadow: '1px 1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, #ddd, #444)' }}></div>
    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db', boxShadow: '1px 1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, #ddd, #444)' }}></div>
    <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db', boxShadow: '1px 1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, #ddd, #444)' }}></div>
    <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d1d5db', boxShadow: '1px 1px 3px rgba(0,0,0,0.9)', backgroundImage: 'radial-gradient(circle at 30% 30%, #ddd, #444)' }}></div>
  </div>
);

export const IBeamUpgraded = () => {
  const cTop = '#9ca3af'; 
  const cWebTop = '#64748b'; 
  const cProfile = '#64748b'; 
  const cSide = '#334155'; 
  const cInnerSide = '#1e293b'; 
  const cInnerTop = '#475569'; 

  return (
    <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', flexShrink: 0, transform: 'translateZ(0)', willChange: 'transform' }}>
       <div style={{
         position: 'relative',
         width: '40px', height: '80px',
         transform: 'scale(0.85) rotateX(60deg) rotateZ(45deg)',
         transformStyle: 'preserve-3d'
       }}>
          <Box3D w={40} h={80} d={8} x={0} y={0} z={0} cTop={cInnerTop} cFront={cProfile} cRight={cSide} cLeft={cSide} cBack={cProfile} />
          <Box3D w={8} h={80} d={24} x={16} y={0} z={8} cTop={cWebTop} cFront={cProfile} cRight={cInnerSide} cLeft={cInnerSide} cBack={cProfile} />
          <Box3D w={40} h={80} d={8} x={0} y={0} z={32} cTop={cTop} cFront={cProfile} cRight={cSide} cLeft={cSide} cBack={cProfile} />
       </div>
    </div>
  );
};

export const MasterRebateUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '112px', height: '80px', transform: 'scale(0.68) rotate(-15deg)', filter: 'drop-shadow(2px 6px 4px rgba(0,0,0,0.4))' }}>
      
      <svg style={{ position: 'absolute', zIndex: 0, width: '96px', height: '96px', left: '-25px', top: '-35px', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }} viewBox="0 0 100 100">
         <path d="M 38 65 C 0 10, 10 -10, 60 10 C 90 20, 60 50, 38 65" fill="none" stroke="#f3f4f6" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>

      <svg style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 120 80">
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        
        <path d="M 40 5 L 115 5 L 115 75 L 40 75 L 5 40 Z" fill="url(#whiteGrad)" stroke="url(#whiteGrad)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M 42 10 L 110 10 L 110 70 L 42 70 L 12 40 Z" fill="url(#redGrad)" stroke="url(#redGrad)" strokeWidth="2" strokeLinejoin="round" />
        
        <circle cx="28" cy="40" r="6" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
        <circle cx="28" cy="40" r="3" fill="#111827" />

        <text x="77" y="46" fill="rgba(0,0,0,0.4)" fontFamily="sans-serif" fontSize="42" fontWeight="900" textAnchor="middle" dominantBaseline="middle">%</text>
        <text x="75" y="44" fill="#ffffff" fontFamily="sans-serif" fontSize="42" fontWeight="900" textAnchor="middle" dominantBaseline="middle">%</text>
      </svg>
    </div>
  </div>
);

export const SubsidyUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes cityLightOn { 0%, 25% { opacity: 0.9; fill: #1e293b; } 75%, 100% { opacity: 1; fill: #fde047; } }
        .city-a { animation: cityLightOn 10s ease-in-out infinite alternate; }
        .city-b { animation: cityLightOn 15s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
        .city-c { animation: cityLightOn 22s ease-in-out infinite alternate; animation-delay: 5s; }
        .city-on { opacity: 1; fill: #fef08a; }
        .city-off { opacity: 0.9; fill: #1e293b; }
        @keyframes paceCity { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(12px, 6px); } 90%, 100% { transform: translate(0px, 0px); } }
        .anim-city-silhouette { animation: paceCity 9s ease-in-out infinite; }
        @keyframes smokeRiseCity { 0% { transform: translate(0, 0) scale(1); opacity: 0.6; } 100% { transform: translate(4px, -12px) scale(2); opacity: 0; } }
        .anim-city-smoke-1 { animation: smokeRiseCity 3.5s infinite; }
        .anim-city-smoke-2 { animation: smokeRiseCity 3.5s infinite; animation-delay: 1.75s; }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="60,75 80,65 80,30 60,40" fill="#475569" />
            <polygon points="63,43.5 67,41.5 67,48.5 63,50.5" className="city-off" />
            <polygon points="63,55.5 67,53.5 67,60.5 63,62.5" className="city-b" />
            <polygon points="72,39 76,37 76,44 72,46" className="city-on" />
            <polygon points="72,51 76,49 76,56 72,58" className="city-a" />
            <polygon points="60,40 80,30 55,17.5 35,27.5" fill="#cbd5e1" />
            <polygon points="64,28 66,27 66,23 64,24" fill="#94a3b8" />
            <polygon points="66,27 68,28 68,24 66,23" fill="#64748b" />
            <circle cx="66" cy="20" r="2.5" fill="#cbd5e1" className="anim-city-smoke-1" />
            <polygon points="15,72.5 40,85 40,35 15,22.5" fill="#64748b" />
            <polygon points="20,27 24,29 24,34 20,32" className="city-a" />
            <polygon points="20,38 24,40 24,45 20,43" className="city-off" />
            <polygon points="20,49 24,51 24,56 20,54" className="city-c" />
            <polygon points="20,60 24,62 24,67 20,65" className="city-on" />
            <polygon points="27,30.5 31,32.5 31,37.5 27,35.5" className="city-off" />
            <polygon points="27,41.5 31,43.5 31,48.5 27,46.5" className="city-on" />
            <polygon points="27,52.5 31,54.5 31,59.5 27,57.5" className="city-b" />
            <polygon points="27,63.5 31,65.5 31,70.5 27,68.5" className="city-off" />
            <polygon points="34,34 38,36 38,41 34,39" className="city-on" />
            <polygon points="34,45 38,47 38,52 34,50" className="city-off" />
            <polygon points="34,56 38,58 38,63 34,61" className="city-a" />
            <polygon points="34,68 38,70 38,80 34,78" fill="#1e293b" />
            <polygon points="34.5,69 37.5,70.5 37.5,79 34.5,77.5" fill="#334155" />
            <polygon points="40,85 60,75 60,25 40,35" fill="#475569" />
            <polygon points="43,36.5 47,34.5 47,39.5 43,41.5" className="city-c" />
            <polygon points="43,47.5 47,45.5 47,50.5 43,52.5" className="city-off" />
            <polygon points="43,58.5 47,56.5 47,61.5 43,63.5" className="city-a" />
            <polygon points="43,69.5 47,67.5 47,72.5 43,74.5" className="city-on" />
            <polygon points="52,32 56,30 56,35 52,37" className="city-off" />
            <polygon points="52,43 56,41 56,46 52,48" className="city-b" />
            <polygon points="52,54 56,52 56,57 52,59" className="city-on" />
            <polygon points="52,65 56,63 56,68 52,70" className="city-off" />
            <polygon points="40,35 60,25 35,12.5 15,22.5" fill="#94a3b8" />
            <polygon points="36,22 38,21 38,15 36,16" fill="#cbd5e1" />
            <polygon points="38,21 40,22 40,16 38,15" fill="#94a3b8" />
            <circle cx="38" cy="11" r="3" fill="#e2e8f0" className="anim-city-smoke-2" />
            <g>
              <clipPath id="sidewalkClipSubsidy">
                <polygon points="15,72.5 40,85 40,65 15,52.5" />
              </clipPath>
              <g clipPath="url(#sidewalkClipSubsidy)">
                <polygon points="19,74.5 21,75.5 21,81 19,80" fill="#0f172a" opacity="0.8" className="anim-city-silhouette" />
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #4ade80, #166534)', border: '1px solid #86efac', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>+$</span>
      </div>
    </div>
  </div>
);

export const TagIcon = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>
    <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="#F1C40F" stroke="#34495E" strokeWidth="5" strokeLinejoin="round"/>
    <circle cx="50" cy="30" r="5" fill="#34495E"/>
  </svg>
);

// --- BLUE DECK ARTWORK ---

export const ShareUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', borderRadius: '2px', width: '88px', height: '64px', background: 'linear-gradient(135deg, #f0f9ff 0%, #cbd5e1 100%)', border: '2px solid #0284c7', transform: 'rotate(-5deg)' }}>
        <div style={{ position: 'absolute', inset: '4px', border: '1px solid #38bdf8', opacity: 0.7, outline: '1px solid #38bdf8', outlineOffset: '-2px' }}></div>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, pointerEvents: 'none' }} viewBox="0 0 88 64">
          <line x1="15" y1="20" x2="75" y2="20" stroke="#0369a1" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="15" y1="35" x2="75" y2="35" stroke="#0369a1" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="15" y1="50" x2="75" y2="50" stroke="#0369a1" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
        <div style={{ width: '66.66%', height: '4px', backgroundColor: '#075985', marginTop: '8px', borderRadius: '2px', zIndex: 10, opacity: 0.8 }}></div>
        <div style={{ width: '33.33%', height: '4px', backgroundColor: '#94a3b8', marginTop: '4px', borderRadius: '2px', zIndex: 10, opacity: 0.6 }}></div>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(1px 2px 1px rgba(0,0,0,0.4))' }} viewBox="0 0 88 64">
          <path d="M 15 50 L 35 35 L 45 42 L 70 18" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polygon points="66,15 76,14 73,24" fill="#10b981" />
        </svg>
        <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 20, background: 'radial-gradient(circle at 30% 30%, #fef08a, #ca8a04)', border: '1px solid #854d0e' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}>
            <span style={{ color: '#713f12', fontWeight: 900, fontSize: '11px', textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}>$</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CityUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes cityLightOn { 0%, 25% { opacity: 0.9; fill: #1e293b; } 75%, 100% { opacity: 1; fill: #fde047; } }
        .city-a { animation: cityLightOn 10s ease-in-out infinite alternate; }
        .city-b { animation: cityLightOn 15s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
        .city-c { animation: cityLightOn 22s ease-in-out infinite alternate; animation-delay: 5s; }
        .city-on { opacity: 1; fill: #fef08a; }
        .city-off { opacity: 0.9; fill: #1e293b; }
        @keyframes paceCity { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(12px, 6px); } 90%, 100% { transform: translate(0px, 0px); } }
        .anim-city-silhouette { animation: paceCity 9s ease-in-out infinite; }
        @keyframes smokeRiseCity { 0% { transform: translate(0, 0) scale(1); opacity: 0.6; } 100% { transform: translate(4px, -12px) scale(2); opacity: 0; } }
        .anim-city-smoke-1 { animation: smokeRiseCity 3.5s infinite; }
        .anim-city-smoke-2 { animation: smokeRiseCity 3.5s infinite; animation-delay: 1.75s; }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="60,75 80,65 80,30 60,40" fill="#475569" />
            <polygon points="63,43.5 67,41.5 67,48.5 63,50.5" className="city-off" />
            <polygon points="63,55.5 67,53.5 67,60.5 63,62.5" className="city-b" />
            <polygon points="72,39 76,37 76,44 72,46" className="city-on" />
            <polygon points="72,51 76,49 76,56 72,58" className="city-a" />
            <polygon points="60,40 80,30 55,17.5 35,27.5" fill="#cbd5e1" />
            <polygon points="64,28 66,27 66,23 64,24" fill="#94a3b8" />
            <polygon points="66,27 68,28 68,24 66,23" fill="#64748b" />
            <circle cx="66" cy="20" r="2.5" fill="#cbd5e1" className="anim-city-smoke-1" />
            <polygon points="15,72.5 40,85 40,35 15,22.5" fill="#64748b" />
            <polygon points="20,27 24,29 24,34 20,32" className="city-a" />
            <polygon points="20,38 24,40 24,45 20,43" className="city-off" />
            <polygon points="20,49 24,51 24,56 20,54" className="city-c" />
            <polygon points="20,60 24,62 24,67 20,65" className="city-on" />
            <polygon points="27,30.5 31,32.5 31,37.5 27,35.5" className="city-off" />
            <polygon points="27,41.5 31,43.5 31,48.5 27,46.5" className="city-on" />
            <polygon points="27,52.5 31,54.5 31,59.5 27,57.5" className="city-b" />
            <polygon points="27,63.5 31,65.5 31,70.5 27,68.5" className="city-off" />
            <polygon points="34,34 38,36 38,41 34,39" className="city-on" />
            <polygon points="34,45 38,47 38,52 34,50" className="city-off" />
            <polygon points="34,56 38,58 38,63 34,61" className="city-a" />
            <polygon points="34,68 38,70 38,80 34,78" fill="#1e293b" />
            <polygon points="34.5,69 37.5,70.5 37.5,79 34.5,77.5" fill="#334155" />
            <polygon points="40,85 60,75 60,25 40,35" fill="#475569" />
            <polygon points="43,36.5 47,34.5 47,39.5 43,41.5" className="city-c" />
            <polygon points="43,47.5 47,45.5 47,50.5 43,52.5" className="city-off" />
            <polygon points="43,58.5 47,56.5 47,61.5 43,63.5" className="city-a" />
            <polygon points="43,69.5 47,67.5 47,72.5 43,74.5" className="city-on" />
            <polygon points="52,32 56,30 56,35 52,37" className="city-off" />
            <polygon points="52,43 56,41 56,46 52,48" className="city-b" />
            <polygon points="52,54 56,52 56,57 52,59" className="city-on" />
            <polygon points="52,65 56,63 56,68 52,70" className="city-off" />
            <polygon points="40,35 60,25 35,12.5 15,22.5" fill="#94a3b8" />
            <polygon points="36,22 38,21 38,15 36,16" fill="#cbd5e1" />
            <polygon points="38,21 40,22 40,16 38,15" fill="#94a3b8" />
            <circle cx="38" cy="11" r="3" fill="#e2e8f0" className="anim-city-smoke-2" />
            <g>
              <clipPath id="sidewalkClip">
                <polygon points="15,72.5 40,85 40,65 15,52.5" />
              </clipPath>
              <g clipPath="url(#sidewalkClip)">
                <polygon points="19,74.5 21,75.5 21,81 19,80" fill="#0f172a" opacity="0.8" className="anim-city-silhouette" />
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const MountainUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes floatCloud { 0% { transform: translate(-10px, -5px); opacity: 0; } 20% { opacity: 0.9; } 80% { opacity: 0.9; } 100% { transform: translate(15px, 7.5px); opacity: 0; } }
        .anim-cloud-1 { animation: floatCloud 8s linear infinite; } .anim-cloud-2 { animation: floatCloud 12s linear infinite; animation-delay: 4s; }
        @keyframes redGlow { 0%, 100% { fill: #991b1b; opacity: 0.5; } 50% { fill: #ef4444; opacity: 1; } } .anim-eyes { animation: redGlow 4s ease-in-out infinite; }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="50,90 90,70 50,50 10,70" fill="#a3e635" />
            <polygon points="10,70 50,90 50,95 10,75" fill="#65a30d" />
            <polygon points="50,90 90,70 90,75 50,95" fill="#4d7c0f" />
            
            <polygon points="50,15 35,45 50,80" fill="#78716c" />
            <polygon points="35,45 20,65 50,80" fill="#a8a29e" />
            <polygon points="50,15 20,65 30,75" fill="#78716c" />
            <polygon points="50,15 30,75 50,85" fill="#a8a29e" />
            
            <polygon points="50,15 50,80 65,45" fill="#57534e" />
            <polygon points="65,45 50,80 80,65" fill="#44403c" />
            <polygon points="50,15 65,45 80,65" fill="#57534e" />
            <polygon points="50,15 80,65 70,75" fill="#44403c" />
            <polygon points="50,15 70,75 50,85" fill="#57534e" />
            
            <polygon points="50,15 42,30 50,38" fill="#f8fafc" />
            <polygon points="42,30 35,45 44,40" fill="#f1f5f9" />
            <polygon points="44,40 50,38 50,15" fill="#ffffff" />
            <polygon points="50,15 50,38 58,30" fill="#e2e8f0" />
            <polygon points="58,30 50,38 56,40" fill="#cbd5e1" />
            <polygon points="56,40 65,45 58,30" fill="#e2e8f0" />
            
            <polygon points="20,60 17,68 23,68" fill="#15803d" />
            <polygon points="20,60 20,68 23,68" fill="#166534" />
            <polygon points="30,70 27,78 33,78" fill="#15803d" />
            <polygon points="30,70 30,78 33,78" fill="#166534" />
            <polygon points="70,68 67,76 73,76" fill="#14532d" />
            <polygon points="70,68 70,76 73,76" fill="#064e3b" />
            <polygon points="80,60 77,68 83,68" fill="#14532d" />
            <polygon points="80,60 80,68 83,68" fill="#064e3b" />
            
            <polygon points="45,82 46,74 50,71 54,74 55,82 50,85" fill="#0f172a" />
            <circle cx="48.5" cy="76" r="1" className="anim-eyes" />
            <circle cx="51.5" cy="76" r="1" className="anim-eyes" />
            
            <g className="anim-cloud-1" fill="#f8fafc" opacity="0.9">
               <circle cx="20" cy="40" r="4" /><circle cx="26" cy="38" r="6" /><circle cx="32" cy="40" r="5" /><circle cx="26" cy="42" r="4" />
            </g>
            <g className="anim-cloud-2" fill="#f8fafc" opacity="0.9">
               <circle cx="65" cy="25" r="3" /><circle cx="70" cy="23" r="5" /><circle cx="75" cy="25" r="4" />
            </g>
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const MaintenanceUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '80px', height: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(-20deg) scale(1.4)' }}>
        {[1, 2, 3, 4, 5, 6].map((tie) => (
          <div key={tie} style={{ width: '6px', height: '100%', borderLeft: '1px solid #b45309', borderRight: '1px solid #451a03', boxShadow: '2px 2px 2px rgba(0,0,0,0.6)', backgroundColor: '#78350f' }}></div>
        ))}
        <div style={{ position: 'absolute', top: '5px', left: '-6px', width: '92px', height: '6px', background: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #ffffff 80%, #475569 100%)', borderTop: '1px solid #ffffff', borderBottom: '1px solid #1e293b', boxShadow: '0 2px 3px rgba(0,0,0,0.7)' }}></div>
        <div style={{ position: 'absolute', bottom: '5px', left: '-6px', width: '92px', height: '6px', background: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #ffffff 80%, #475569 100%)', borderTop: '1px solid #ffffff', borderBottom: '1px solid #1e293b', boxShadow: '0 2px 3px rgba(0,0,0,0.7)' }}></div>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 4px 6px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const ParlorUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="65,32.5 50,40 65,47.5 80,40" fill="#d8b4fe" />
            <polygon points="65,47.5 80,40 80,75 65,82.5" fill="#9333ea" />
            <polygon points="77,45 72,47.5 72,54.5 77,52" opacity="0.9" fill="#6b21a8" />
            <polygon points="77,57 72,59.5 72,66.5 77,64" opacity="1" fill="#fde047" />
            <polygon points="77,69 72,71.5 72,78.5 77,76" opacity="1" fill="#fef08a" />
            <polygon points="35,32.5 20,40 35,47.5 50,40" fill="#d8b4fe" />
            <polygon points="20,40 35,47.5 35,82.5 20,75" fill="#c084fc" />
            <polygon points="35,47.5 50,40 50,75 35,82.5" fill="#9333ea" />
            <polygon points="23,45 28,47.5 28,54.5 23,52" opacity="1" fill="#fde047" />
            <polygon points="23,57 28,59.5 28,66.5 23,64" opacity="1" fill="#fef08a" />
            <polygon points="23,69 28,71.5 28,78.5 23,76" opacity="1" fill="#fef08a" />
            <g><polygon points="25,78 26.5,78.5 26.5,84 25,83.5" fill="#4c1d95" opacity="0.9" /></g>
            <polygon points="50,15 35,22.5 50,30 65,22.5" fill="#d8b4fe" />
            <polygon points="50,18 38,24 50,30 62,24" fill="#a855f7" />
            <polygon points="35,22.5 50,30 50,90 35,82.5" fill="#c084fc" />
            <polygon points="50,30 65,22.5 65,82.5 50,90" fill="#9333ea" />
            <polygon points="37,30 42,32.5 42,39.5 37,37" opacity="1" fill="#fde047" />
            <polygon points="44,33.5 49,36 49,43 44,40.5" opacity="0.9" fill="#6b21a8" />
            <polygon points="37,41 42,43.5 42,50.5 37,48" opacity="1" fill="#fef08a" />
            <polygon points="44,44.5 49,47 49,54 44,51.5" opacity="1" fill="#fde047" />
            <polygon points="37,52 42,54.5 42,61.5 37,59" opacity="1" fill="#fde047" />
            <polygon points="44,55.5 49,58 49,65 44,62.5" opacity="1" fill="#fef08a" />
            <polygon points="51,33.5 56,31 56,38 51,40.5" opacity="1" fill="#fef08a" />
            <polygon points="58,30 63,27.5 63,34.5 58,37" opacity="1" fill="#fde047" />
            <polygon points="51,44.5 56,42 56,49 51,51.5" opacity="1" fill="#fde047" />
            <polygon points="58,41 63,38.5 63,45.5 58,48" opacity="0.9" fill="#6b21a8" />
            <polygon points="51,55.5 56,53 56,60 51,62.5" opacity="1" fill="#fef08a" />
            <polygon points="58,52 63,49.5 63,56.5 58,59" opacity="1" fill="#fde047" />
            <polygon points="45,87.5 50,90 55,87.5 55,75 50,77.5 45,75" fill="#581c87" />
            <polygon points="46.5,85 49,86 49,78 46.5,77" fill="#c084fc" opacity="0.5" />
            <polygon points="51,86 53.5,85 53.5,77 51,78" fill="#c084fc" opacity="0.5" />
            <polygon points="43,68 50,71.5 50,75.5 43,72" fill="#c026d3" />
            <polygon points="50,71.5 57,68 57,72 50,75.5" fill="#a21caf" />
            <polygon points="43,68 50,65 57,68 50,71.5" fill="#e879f9" />
            <polygon points="44,70 49,72.5 49,73.5 44,71" opacity="1" fill="#fde047" />
            <polygon points="51,72.5 56,70 56,71 51,73.5" opacity="1" fill="#fde047" />
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const TaxUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '80px', height: '96px', borderRadius: '2px', boxShadow: '0 5px 10px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to bottom, #92400e, #713f12)', border: '1px solid #451a03' }}>
        <div style={{ position: 'absolute', bottom: '4px', width: '72px', height: '80px', backgroundColor: '#f8fafc', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', paddingBottom: '4px', paddingLeft: '8px', paddingRight: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '75%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '83.33%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '6px' }}></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '12px' }}></div>
          <div style={{ position: 'absolute', top: '24px', right: '4px', border: '1.5px solid #dc2626', color: '#dc2626', fontWeight: 900, fontSize: '9px', paddingLeft: '4px', paddingRight: '4px', transform: 'rotate(-12deg)', opacity: 0.9, letterSpacing: '0.1em', boxShadow: '0 0 2px rgba(220,38,38,0.4)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            TAXED
          </div>
          <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #94a3b8', paddingTop: '4px' }}>
             <span style={{ fontSize: '6px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.1em' }}>TOTAL</span>
             <span style={{ fontSize: '8px', fontWeight: 900, color: '#dc2626' }}>-$15</span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 0, width: '48px', height: '16px', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #334155', borderLeft: '1px solid #334155', borderRight: '1px solid #334155', background: 'linear-gradient(to bottom, #cbd5e1, #94a3b8)' }}>
           <div style={{ width: '12px', height: '8px', borderRadius: '9999px', backgroundColor: '#1e293b', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export const SignalUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.5))' }}>
        <g transform="scale(0.85) translate(8, 8)">
          <polygon points="35,77 50,84.5 50,90 35,82.5" fill="#64748b" />
          <polygon points="50,84.5 65,77 65,82.5 50,90" fill="#334155" />
          <polygon points="35,77 50,69.5 65,77 50,84.5" fill="#94a3b8" />
          <polygon points="38,76 50,82 50,35 38,29" fill="#f97316" />
          <polygon points="50,82 62,76 62,29 50,35" fill="#c2410c" />
          <polygon points="42,70 46,72 46,60 42,58" fill="#7c2d12" opacity="0.8" />
          <polygon points="42,52 46,54 46,42 42,40" fill="#7c2d12" opacity="0.8" />
          <polygon points="54,72 58,70 58,58 54,60" fill="#431407" opacity="0.8" />
          <polygon points="54,54 58,52 58,40 54,42" fill="#431407" opacity="0.8" />
          <polygon points="34,31 50,39 50,35 38,29" fill="#cbd5e1" />
          <polygon points="50,39 66,31 62,29 50,35" fill="#64748b" />
          <polygon points="34,31 50,39 50,22 34,14" fill="#fb923c" />
          <polygon points="50,39 66,31 66,14 50,22" fill="#ea580c" />
          <polygon points="36,29 41.5,31.5 41.5,19.5 36,17" fill="#bae6fd" opacity="0.8" />
          <polygon points="43.5,32.5 48,35 48,23 43.5,20.5" fill="#bae6fd" opacity="0.8" />
          <polygon points="52,35 56.5,32.5 56.5,20.5 52,23" fill="#38bdf8" />
          <polygon points="58.5,31.5 64,29 64,17 58.5,19.5" fill="#38bdf8" />
          <polygon points="32,15 50,24 50,2" fill="#475569" />
          <polygon points="50,24 68,15 50,2" fill="#1e293b" />
          <circle cx="50" cy="2" r="1.5" fill="#94a3b8" />
          <line x1="50" y1="2" x2="50" y2="-12" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <g transform="translate(50, -8)">
            <g transform="rotate(-35)">
              <line x1="0" y1="0" x2="-14" y2="0" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="-14" y="-2" width="5" height="4" fill="#ef4444" />
            </g>
            <g transform="rotate(25)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="9" y="-2" width="5" height="4" fill="#ef4444" />
            </g>
          </g>
        </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const ExpansionUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))' }} viewBox="0 0 100 100">
         <defs>
           <linearGradient id="feeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#991b1b" />
           </linearGradient>
         </defs>
         <g transform="translate(15, 15) scale(0.5)" opacity="0.4">
            <circle cx="0" cy="0" r="15" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="0,-20 4,-4 20,0 4,4 0,20 -4,4 -20,0 -4,-4" fill="#38bdf8" />
         </g>
         <path d="M 15 80 L 45 60 L 75 35" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="4,4" strokeLinecap="round" />
         <circle cx="15" cy="80" r="5" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
         <g transform="translate(15, 65)">
            <circle cx="0" cy="0" r="7" fill="url(#feeGrad)" stroke="#fca5a5" strokeWidth="1" />
            <text x="0" y="3" fill="#fff" fontFamily="sans-serif" fontSize="9" fontWeight="900" textAnchor="middle">-$</text>
         </g>
         <circle cx="45" cy="60" r="5" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
         <g transform="translate(45, 45)">
            <circle cx="0" cy="0" r="7" fill="url(#feeGrad)" stroke="#fca5a5" strokeWidth="1" />
            <text x="0" y="3" fill="#fff" fontFamily="sans-serif" fontSize="9" fontWeight="900" textAnchor="middle">-$</text>
         </g>
         <circle cx="75" cy="35" r="5" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
         <g transform="translate(75, 18)">
            <circle cx="0" cy="0" r="9" fill="url(#feeGrad)" stroke="#fca5a5" strokeWidth="1" />
            <text x="0" y="3.5" fill="#fff" fontFamily="sans-serif" fontSize="11" fontWeight="900" textAnchor="middle">-$</text>
         </g>
      </svg>
    </div>
  </div>
);

export const DepotUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <line x1="23" y1="70" x2="5" y2="61" stroke="#64748b" strokeWidth="1.5" />
            <line x1="27" y1="72" x2="9" y2="63" stroke="#64748b" strokeWidth="1.5" />
            <line x1="36" y1="76.5" x2="18" y2="67.5" stroke="#64748b" strokeWidth="1.5" />
            <line x1="40" y1="78.5" x2="22" y2="69.5" stroke="#64748b" strokeWidth="1.5" />
            <line x1="49" y1="83" x2="31" y2="74" stroke="#64748b" strokeWidth="1.5" />
            <line x1="53" y1="85" x2="35" y2="76" stroke="#64748b" strokeWidth="1.5" />
            <polygon points="15,40 60,62.5 60,87.5 15,65" fill="#f97316" /> 
            <polygon points="60,62.5 85,50 85,75 60,87.5" fill="#ea580c" /> 
            <polygon points="15,40 60,62.5 85,50 40,27.5" fill="#475569" />
            <polygon points="25,45 50,57.5 75,45 50,32.5" fill="#334155" opacity="0.6" />
            <polygon points="25,39 50,51.5 50,57.5 25,45" fill="#fdba74" /> 
            <polygon points="50,51.5 75,39 75,45 50,57.5" fill="#c2410c" /> 
            <polygon points="27,42 32,44.5 32,48.5 27,46" fill="#0f172a" opacity="0.5" />
            <polygon points="34,45.5 39,48 39,52 34,49.5" fill="#0f172a" opacity="0.5" />
            <polygon points="41,49 46,51.5 46,55.5 41,53" fill="#0f172a" opacity="0.5" />
            <polygon points="25,39 50,51.5 75,39 50,26.5" fill="#94a3b8" />
            <polygon points="21,55 24,53.5 29,56 29,72 21,68" fill="#0f172a" />
            <polygon points="34,61.5 37,60 42,62.5 42,78.5 34,74.5" fill="#0f172a" />
            <polygon points="47,68 50,66.5 55,69 55,85 47,81" fill="#0f172a" />
            <polygon points="23,65 25,62 27,66" fill="#67e8f9" opacity="0.8" />
            <polygon points="38,69.5 40.5,68 40.5,70.5 38,72" fill="#334155" />
            <polygon points="35.5,68 38,69.5 38,72 35.5,70.5" fill="#1e293b" />
            <polygon points="35.5,68 38,66.5 40.5,68 38,69.5" fill="#475569" />
            <polygon points="37,64 39,65 39,68 37,67" fill="#0f172a" />
            <polygon points="34,73 38,75 42,73 38,71" fill="#0f172a" />
            <polygon points="48,68 50,67 54,69 54,83 48,80" fill="#ea580c" opacity="0.9" />
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const FedExciseUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="50,10 20,25 50,40 80,25" fill="#2563eb" />
            <polygon points="50,15 25,27.5 50,40 75,27.5" fill="#1e40af" /> 
            <line x1="50" y1="15" x2="50" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="50" cy="5" r="1.5" fill="#ef4444" />
            <polygon points="20,25 50,40 50,90 20,75" fill="#004aad" />
            <polygon points="24,31 31,34.5 31,42.5 24,39" fill="#93c5fd" />
            <polygon points="33,35.5 40,39 40,47 33,43.5" fill="#93c5fd" />
            <polygon points="42,40 48,43 48,51 42,48" fill="#0f172a" opacity="0.8" />
            <polygon points="24,43 31,46.5 31,54.5 24,51" fill="#0f172a" opacity="0.8" />
            <polygon points="33,47.5 40,51 40,59 33,55.5" fill="#0f172a" opacity="0.8" />
            <polygon points="42,52 48,55 48,63 42,60" fill="#93c5fd" />
            <polygon points="24,55 31,58.5 31,66.5 24,63" fill="#93c5fd" />
            <polygon points="33,59.5 40,63 40,71 33,67.5" fill="#0f172a" opacity="0.8" />
            <polygon points="42,64 48,67 48,75 42,72" fill="#0f172a" opacity="0.8" />
            <polygon points="33,71.5 46,78 46,86 33,79.5" fill="#172554" />
            <polygon points="34,73 39,75.5 39,82.5 34,80" fill="#e0f2fe" />
            <polygon points="40,76 45,78.5 45,85.5 40,83" fill="#e0f2fe" />
            <polygon points="50,40 80,25 80,75 50,90" fill="#1e3a8a" />
            <polygon points="52,43 58,40 58,48 52,51" fill="#93c5fd" />
            <polygon points="60,39 67,35.5 67,43.5 60,47" fill="#0f172a" opacity="0.8" />
            <polygon points="69,34.5 76,31 76,39 69,42.5" fill="#93c5fd" />
            <polygon points="52,55 58,52 58,60 52,63" fill="#93c5fd" />
            <polygon points="60,51 67,47.5 67,55.5 60,59" fill="#93c5fd" />
            <polygon points="69,46.5 76,43 76,51 69,54.5" fill="#0f172a" opacity="0.8" />
            <polygon points="52,67 58,64 58,72 52,75" fill="#0f172a" opacity="0.8" />
            <polygon points="60,63 67,59.5 67,67.5 60,71" fill="#93c5fd" />
            <g>
              <polygon points="69,58.5 76,55 76,63 69,66.5" fill="#bae6fd" />
              <clipPath id="fedWindowClipRaw">
                <polygon points="69,58.5 76,55 76,63 69,66.5" />
              </clipPath>
              <g clipPath="url(#fedWindowClipRaw)">
                <polygon points="73,61 74.5,60 74.5,66 73,66" fill="#0f172a" opacity="0.8" />
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const TrustUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <defs>
           <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#fef3c7" />
             <stop offset="100%" stopColor="#d6d3d1" />
           </linearGradient>
         </defs>
         <g transform="translate(50, 50) rotate(-8) translate(-50, -50)">
             <rect x="15" y="15" width="70" height="75" rx="3" fill="url(#parchment)" stroke="#78350f" strokeWidth="1" />
             <rect x="20" y="20" width="60" height="65" fill="none" stroke="#b45309" strokeWidth="2" />
             <rect x="22" y="22" width="56" height="61" fill="none" stroke="#d97706" strokeWidth="0.5" />
             <rect x="30" y="30" width="40" height="4" fill="#78350f" />
             <line x1="30" y1="40" x2="70" y2="40" stroke="#a8a29e" strokeWidth="1.5" />
             <line x1="30" y1="46" x2="65" y2="46" stroke="#a8a29e" strokeWidth="1.5" />
             <line x1="30" y1="52" x2="70" y2="52" stroke="#a8a29e" strokeWidth="1.5" />
             <line x1="30" y1="58" x2="55" y2="58" stroke="#a8a29e" strokeWidth="1.5" />
             <path d="M 60 70 L 65 85 L 70 82 L 75 85 L 70 70 Z" fill="#991b1b" />
             <circle cx="65" cy="70" r="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
             <circle cx="65" cy="70" r="5" fill="none" stroke="#fca5a5" strokeWidth="0.5" />
             <polygon points="65,66 66.5,68.5 69.5,68.5 67,70.5 68,73.5 65,71.5 62,73.5 63,70.5 60.5,68.5 63.5,68.5" fill="#fef08a" />
         </g>
         <g transform="translate(18, 65) rotate(-20)">
            <ellipse cx="20" cy="20" rx="16" ry="3.5" fill="#111827" />
            <path d="M 8 20 L 10 2 C 10 -1, 30 -1, 30 2 L 32 20 Z" fill="#111827" />
            <path d="M 9 15 L 31 15 L 31 18 L 9 18 Z" fill="#dc2626" />
         </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)', border: '2.5px solid #ef4444', color: '#ef4444', fontWeight: 900, fontSize: '10px', padding: '2px 6px', letterSpacing: '0.1em', backgroundColor: 'rgba(15, 23, 42, 0.6)', boxShadow: '0 0 10px rgba(220,38,38,0.4)', whiteSpace: 'nowrap' }}>
        ACQUIRED
      </div>
    </div>
  </div>
);

export const HubUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <g transform="translate(50, 15)"><TrackSegment /></g>
         <g transform="translate(50, 50) rotate(120) translate(0, -35)"><TrackSegment /></g>
         <g transform="translate(50, 50) rotate(-120) translate(0, -35)"><TrackSegment /></g>
         <circle cx="50" cy="50" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
         <circle cx="50" cy="50" r="18" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" />
         <circle cx="50" cy="50" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
         <line x1="42" y1="42" x2="58" y2="58" stroke="#94a3b8" strokeWidth="3" />
         <line x1="42" y1="58" x2="58" y2="42" stroke="#94a3b8" strokeWidth="3" />
         <circle cx="50" cy="50" r="4" fill="#facc15" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 4px 8px rgba(0,0,0,0.8)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const InventoryUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <g transform="translate(30, 75) scale(0.65) rotate(-45)"><TrackSegment /></g>
         <g transform="translate(50, 55) scale(0.65) rotate(-45)"><TrackSegment /></g>
         <g transform="translate(70, 35) scale(0.65) rotate(-45)"><TrackSegment /></g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const AssetUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <g transform="translate(35, 55) rotate(-25) translate(-25, -35)">
            <rect x="0" y="0" width="50" height="70" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
         </g>
         <g transform="translate(50, 50) rotate(15) translate(-25, -35)">
            <rect x="0" y="0" width="50" height="70" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
         </g>
         <g transform="translate(60, 45) rotate(5) translate(-25, -35)">
            <rect x="0" y="0" width="50" height="70" rx="4" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="2" />
            <rect x="5" y="5" width="40" height="60" rx="2" fill="none" stroke="#bae6fd" strokeWidth="1.5" />
            <circle cx="25" cy="25" r="8" fill="#38bdf8" opacity="0.8" />
            <line x1="10" y1="45" x2="40" y2="45" stroke="#94a3b8" strokeWidth="2" />
            <line x1="10" y1="52" x2="30" y2="52" stroke="#94a3b8" strokeWidth="2" />
         </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '2px solid #fca5a5', boxShadow: '0 4px 8px rgba(0,0,0,0.8)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const TreasuryUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <g transform="translate(5, 35)">
            <polygon points="0,25 20,5 40,25" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <rect x="0" y="25" width="40" height="5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <rect x="5" y="30" width="6" height="25" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            <rect x="17" y="30" width="6" height="25" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            <rect x="29" y="30" width="6" height="25" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            <rect x="0" y="55" width="40" height="5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
         </g>
         <path d="M 45 55 Q 60 30 75 55" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="3,3" style={{ opacity: 0.8 }} />
         <polygon points="75,55 70,45 80,45" fill="#facc15" transform="rotate(30 75 55)" />
         <circle cx="60" cy="40" r="5" fill="#eab308" stroke="#a16207" strokeWidth="1" />
         <text x="60" y="43" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">$</text>
         <g transform="translate(60, 65)">
            <ellipse cx="20" cy="20" rx="16" ry="3.5" fill="#111827" />
            <path d="M 8 20 L 10 2 C 10 -1, 30 -1, 30 2 L 32 20 Z" fill="#111827" />
            <path d="M 9 15 L 31 15 L 31 18 L 9 18 Z" fill="#dc2626" />
         </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>75%</span>
      </div>
    </div>
  </div>
);

export const SpecialtyUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 10px rgba(250,204,21,0.5))' }} viewBox="0 0 100 100">
         <defs>
           <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#fef08a" />
             <stop offset="50%" stopColor="#eab308" />
             <stop offset="100%" stopColor="#a16207" />
           </linearGradient>
         </defs>
         <polygon points="50,22 58,40 78,40 62,52 68,70 50,60 32,70 38,52 22,40 42,40" fill="url(#starGrad)" stroke="#fef08a" strokeWidth="1.5" strokeLinejoin="round" />
         <line x1="50" y1="22" x2="50" y2="60" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
         <line x1="78" y1="40" x2="38" y2="52" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
         <line x1="22" y1="40" x2="62" y2="52" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
         <line x1="32" y1="70" x2="58" y2="40" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
         <line x1="68" y1="70" x2="42" y2="40" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const GNUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0f172a', border: '3px solid #334155', boxShadow: 'inset 0 0 10px rgba(0,0,0,1), 0 5px 15px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6px' }}>
         <span style={{ position: 'absolute', color: '#334155', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.05em' }}>GN</span>
         <img src="gn.svg" alt="GN Logo" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} onError={(e) => e.target.style.opacity = 0} />
      </div>
      <div style={{ position: 'absolute', zIndex: 20, bottom: '8px', backgroundColor: '#0f172a', border: '1.5px solid #22c55e', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
        <span style={{ color: '#4ade80', fontWeight: 900, fontSize: '10px', letterSpacing: '0.1em', filter: 'drop-shadow(0 0 2px rgba(74,222,128,0.8))' }}>+1 SHARE</span>
      </div>
    </div>
  </div>
);

export const ORNUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0f172a', border: '3px solid #334155', boxShadow: 'inset 0 0 10px rgba(0,0,0,1), 0 5px 15px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6px' }}>
         <span style={{ position: 'absolute', color: '#334155', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.05em' }}>OR&N</span>
         <img src="orn.svg" alt="OR&N Logo" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} onError={(e) => e.target.style.opacity = 0} />
      </div>
      <div style={{ position: 'absolute', zIndex: 20, bottom: '8px', backgroundColor: '#0f172a', border: '1.5px solid #22d3ee', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
        <span style={{ color: '#22d3ee', fontWeight: 900, fontSize: '10px', letterSpacing: '0.1em', filter: 'drop-shadow(0 0 2px rgba(34,211,238,0.8))' }}>+1 SHARE</span>
      </div>
    </div>
  </div>
);

export const CPUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0f172a', border: '3px solid #334155', boxShadow: 'inset 0 0 10px rgba(0,0,0,1), 0 5px 15px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6px' }}>
         <span style={{ position: 'absolute', color: '#334155', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.05em' }}>CP</span>
         <img src="cpr.svg" alt="CP Logo" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} onError={(e) => e.target.style.opacity = 0} />
      </div>
      <div style={{ position: 'absolute', zIndex: 20, bottom: '8px', backgroundColor: '#0f172a', border: '1.5px solid #ef4444', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
        <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '10px', letterSpacing: '0.1em', filter: 'drop-shadow(0 0 2px rgba(239,68,68,0.8))' }}>+1 SHARE</span>
      </div>
    </div>
  </div>
);

const mapStrokeFilter = "drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))";

export const RustUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{
      flexShrink: 0,
      width: '100px', 
      height: '100px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'scale(0.66)'
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: mapStrokeFilter }}>
        <style>{`
          @keyframes nastySmog1 {
            0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
            50% { opacity: 1; fill: #000000; }
            100% { transform: translate(12px, -30px) scale(3.5); opacity: 0; }
          }
          @keyframes nastySmog2 {
            0% { transform: translate(0, 0) scale(0.8); opacity: 0.8; }
            50% { opacity: 0.9; fill: #0f172a; }
            100% { transform: translate(-10px, -35px) scale(4); opacity: 0; }
          }
          @keyframes nastySmog3 {
            0% { transform: translate(0, 0) scale(1.2); opacity: 0.95; }
            50% { opacity: 1; fill: #020617; }
            100% { transform: translate(18px, -25px) scale(3); opacity: 0; }
          }
          .smog-a { animation: nastySmog1 3s infinite; transform-box: fill-box; transform-origin: center; }
          .smog-b { animation: nastySmog2 4s infinite; transform-box: fill-box; transform-origin: center; }
          .smog-c { animation: nastySmog3 3.5s infinite; transform-box: fill-box; transform-origin: center; }
        `}</style>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.8) translate(12.5, 5)">
            {/* Ambient Back Smog */}
            <circle cx="35" cy="35" r="8" fill="#020617" className="smog-a" style={{ animationDelay: '0s' }} />
            <circle cx="65" cy="25" r="9" fill="#000000" className="smog-b" style={{ animationDelay: '0.4s' }} />

            {/* BLACK FOUNDATION SLAB */}
            <polygon points="50,55 -5,82.5 50,110 105,82.5" fill="#0f172a" />
            <polygon points="-5,82.5 50,110 50,118 -5,90.5" fill="#020617" />
            <polygon points="50,110 105,82.5 105,90.5 50,118" fill="#000000" />

            {/* BACK ROW STACKS: S2 (Left), S4 (Right) */}
            <polygon points="25,77.5 35,82.5 35,45 29.5,42.25" fill="#7f1d1d" />
            <polygon points="35,82.5 45,77.5 40.5,42.25 35,45" fill="#450a0a" />
            <polygon points="29.5,42.25 35,45 40.5,42.25 35,39.5" fill="#020617" />
            <polygon points="55,77.5 65,82.5 65,35 59.5,32.25" fill="#7f1d1d" />
            <polygon points="65,82.5 75,77.5 70.5,32.25 65,35" fill="#450a0a" />
            <polygon points="59.5,32.25 65,35 70.5,32.25 65,29.5" fill="#020617" />

            {/* FRONT ROW STACKS: S1 (Left), S3 (Center), S5 (Right) */}
            <polygon points="10,80 20,85 20,25 14.5,22.25" fill="#991b1b" />
            <polygon points="20,85 30,80 25.5,22.25 20,25" fill="#7f1d1d" />
            <polygon points="14.5,22.25 20,25 25.5,22.25 20,19.5" fill="#020617" />
            <polygon points="40,95 50,100 50,15 44.5,12.25" fill="#991b1b" />
            <polygon points="50,100 60,95 55.5,12.25 50,15" fill="#7f1d1d" />
            <polygon points="44.5,12.25 50,15 55.5,12.25 50,9.5" fill="#020617" />
            <polygon points="70,80 80,85 80,10 74.5,7.25" fill="#991b1b" />
            <polygon points="80,85 90,80 85.5,7.25 80,10" fill="#7f1d1d" />
            <polygon points="74.5,7.25 80,10 85.5,7.25 80,4.5" fill="#020617" />

            {/* Stack Highlights / Structural Rings */}
            <polyline points="14.5,35 20,37.5 25.5,35" stroke="#450a0a" strokeWidth="1" fill="none" />
            <polyline points="44.5,30 50,32.5 55.5,30" stroke="#450a0a" strokeWidth="1" fill="none" />
            <polyline points="74.5,25 80,27.5 85.5,25" stroke="#450a0a" strokeWidth="1" fill="none" />

            {/* Foreground Smoke Choking the Tops */}
            <circle cx="20" cy="15" r="5" fill="#000000" className="smog-c" style={{ animationDelay: '1.2s' }} />
            <circle cx="35" cy="30" r="4" fill="#1e293b" className="smog-a" style={{ animationDelay: '1.6s' }} />
            <circle cx="50" cy="5" r="6" fill="#0f172a" className="smog-b" style={{ animationDelay: '0.9s' }} />
            <circle cx="65" cy="20" r="5" fill="#000000" className="smog-c" style={{ animationDelay: '1.3s' }} />
            <circle cx="80" cy="0" r="5" fill="#1e293b" className="smog-a" style={{ animationDelay: '1.1s' }} />
            
            {/* Pluming higher up */}
            <circle cx="25" cy="0" r="6" fill="#020617" className="smog-b" style={{ animationDelay: '2.0s' }} />
            <circle cx="55" cy="-10" r="7" fill="#000000" className="smog-a" style={{ animationDelay: '2.4s' }} />
            <circle cx="75" cy="-5" r="5" fill="#0f172a" className="smog-c" style={{ animationDelay: '1.8s' }} />
          </g>
        </svg>
      </div>
      
      {/* Surcharge Badge */}
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

export const RegionalLevyUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes warmLightOn { 0%, 25% { opacity: 0.9; fill: #4c1d95; } 75%, 100% { opacity: 1; fill: #fde047; } }
        .hq-light-a { animation: warmLightOn 10s ease-in-out infinite alternate; }
        .hq-light-b { animation: warmLightOn 14s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
        .hq-light-c { animation: warmLightOn 18s ease-in-out infinite alternate; animation-delay: 5s; }
        .hq-light-on { opacity: 1; fill: #fef08a; }
        .hq-light-off { opacity: 0.9; fill: #4c1d95; }
        
        @keyframes paceCEO { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(3px, 1.5px); } 90%, 100% { transform: translate(0px, 0px); } }
        .anim-ceo { animation: paceCEO 6s ease-in-out infinite; }
        
        @keyframes telegraphSpark { 
          0%, 80% { opacity: 0; } 
          82% { opacity: 1; fill: #e0f2fe; transform: scale(1.5); } 
          84% { opacity: 0; } 
          86% { opacity: 1; fill: #7dd3fc; transform: scale(2.5); } 
          88%, 100% { opacity: 0; } 
        }
        .anim-telegraph { animation: telegraphSpark 4s infinite; transform-origin: 50px -15px; }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', filter: 'drop-shadow(2px 0px 0px #1a1a1a) drop-shadow(-2px 0px 0px #1a1a1a) drop-shadow(0px 2px 0px #1a1a1a) drop-shadow(0px -2px 0px #1a1a1a) drop-shadow(4px 6px 4px rgba(0,0,0,0.6))' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <g transform="scale(0.85) translate(8, 8)">
            <polygon points="10,55 50,75 50,80 10,60" fill="#94a3b8" />
            <polygon points="50,75 90,55 90,60 50,80" fill="#64748b" />
            <polygon points="10,55 50,75 90,55 50,35" fill="#cbd5e1" />
            
            <polygon points="15,57.5 30,65 30,35 15,27.5" fill="#a855f7" />
            <polygon points="15,27.5 30,35 45,27.5 30,20" fill="#475569" />
            
            <polygon points="18,33 22,35 22,42 18,40" className="hq-light-c" />
            <polygon points="18,46 22,48 22,55 18,53" className="hq-light-on" />
            <polygon points="25,36.5 29,38.5 29,45.5 25,43.5" className="hq-light-a" />
            <polygon points="25,49.5 29,51.5 29,58.5 25,56.5" className="hq-light-off" />

            <polygon points="70,65 85,57.5 85,27.5 70,35" fill="#7e22ce" />
            <polygon points="55,27.5 70,35 85,27.5 70,20" fill="#475569" />
            
            <polygon points="71,38.5 75,36.5 75,43.5 71,45.5" className="hq-light-b" />
            <polygon points="71,51.5 75,49.5 75,56.5 71,58.5" className="hq-light-on" />
            <polygon points="78,35 82,33 82,40 78,42" className="hq-light-off" />
            <polygon points="78,48 82,46 82,53 78,55" className="hq-light-a" />

            <polygon points="30,65 50,75 50,15 30,5" fill="#a855f7" />
            <polygon points="50,75 70,65 70,5 50,15" fill="#7e22ce" />
            <polygon points="30,5 50,15 70,5 50,-5" fill="#334155" />

            <polygon points="29,64.5 31,65.5 31,5.5 29,4.5" fill="#f8fafc" />
            <polygon points="48,74 50,75 50,15 48,14" fill="#f8fafc" />
            <polygon points="50,75 52,74 52,14 50,15" fill="#cbd5e1" />
            <polygon points="69,65.5 71,64.5 71,4.5 69,5.5" fill="#cbd5e1" />

            <polygon points="34,15 38,17 38,24 34,22" className="hq-light-on" />
            <polygon points="42,19 46,21 46,28 42,26" className="hq-light-c" />
            <polygon points="34,28 38,30 38,37 34,35" className="hq-light-off" />
            <polygon points="42,32 46,34 46,41 42,39" className="hq-light-a" />
            <polygon points="34,41 38,43 38,50 34,48" className="hq-light-b" />
            <polygon points="42,45 46,47 46,54 42,52" className="hq-light-on" />
            <polygon points="34,54 38,56 38,63 34,61" className="hq-light-on" />
            <polygon points="42,58 46,60 46,67 42,65" className="hq-light-off" />

            <polygon points="54,17 58,15 58,22 54,24" className="hq-light-off" />
            <polygon points="62,13 66,11 66,18 62,20" className="hq-light-b" />
            <polygon points="54,30 58,28 58,35 54,37" className="hq-light-on" />
            <polygon points="62,26 66,24 66,31 62,33" className="hq-light-a" />
            <polygon points="54,43 58,41 58,48 54,50" className="hq-light-off" />
            <polygon points="62,39 66,37 66,44 62,46" className="hq-light-on" />
            <polygon points="54,56 58,54 58,61 54,63" className="hq-light-c" />
            <polygon points="62,52 66,50 66,57 62,59" className="hq-light-off" />

            <g>
              <clipPath id="ceoClip">
                <polygon points="34,15 38,17 38,24 34,22" />
              </clipPath>
              <g clipPath="url(#ceoClip)">
                <polygon points="35,17 36.5,17.75 36.5,23 35,22" fill="#0f172a" opacity="0.9" className="anim-ceo" />
              </g>
            </g>

            <line x1="50" y1="5" x2="50" y2="-15" stroke="#94a3b8" strokeWidth="1" />
            <line x1="50" y1="-10" x2="35" y2="0" stroke="#64748b" strokeWidth="0.5" opacity="0.6" />
            <line x1="50" y1="-10" x2="65" y2="0" stroke="#64748b" strokeWidth="0.5" opacity="0.6" />
            <circle cx="50" cy="-15" r="2" className="anim-telegraph" />
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', zIndex: 10, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)', border: '1px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>-$</span>
      </div>
    </div>
  </div>
);

// --- RED DECK ARTWORK (PURPLE PALETTE) ---

export const AuditUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes shred { 0% { transform: translateY(-10px); } 100% { transform: translateY(20px); opacity: 0; } }
        .anim-shred { animation: shred 2s linear infinite; }
        @keyframes flicker { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        .anim-fire { animation: flicker 0.5s ease-in-out infinite alternate; transform-origin: bottom center; }
      `}</style>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }} viewBox="0 0 100 100">
        <g className="anim-shred">
          <rect x="35" y="15" width="30" height="40" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="40" y1="25" x2="60" y2="25" stroke="#94a3b8" strokeWidth="2" />
          <line x1="40" y1="32" x2="55" y2="32" stroke="#94a3b8" strokeWidth="2" />
          <line x1="40" y1="39" x2="60" y2="39" stroke="#94a3b8" strokeWidth="2" />
          <text x="50" y="32" fill="#a855f7" fontSize="8" fontWeight="900" transform="rotate(-15 50 32)" opacity="0.8" textAnchor="middle">PURGE</text>
        </g>
        <rect x="25" y="45" width="50" height="20" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2" />
        <rect x="30" y="45" width="40" height="4" fill="#0f172a" />
        <g transform="translate(0, 50)">
          <line x1="38" y1="15" x2="38" y2="30" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 2" className="anim-shred" style={{ animationDelay: '0.1s' }} />
          <line x1="44" y1="15" x2="44" y2="35" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3 3" className="anim-shred" style={{ animationDelay: '0.4s' }} />
          <line x1="50" y1="15" x2="50" y2="25" stroke="#f8fafc" strokeWidth="2" strokeDasharray="5 2" className="anim-shred" style={{ animationDelay: '0.2s' }} />
          <line x1="56" y1="15" x2="56" y2="32" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" className="anim-shred" style={{ animationDelay: '0.5s' }} />
          <line x1="62" y1="15" x2="62" y2="28" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 4" className="anim-shred" style={{ animationDelay: '0.3s' }} />
        </g>
        <g transform="translate(50, 85)" className="anim-fire">
          <path d="M 0 0 Q -15 -10 0 -25 Q 15 -10 0 0 Z" fill="#a855f7" />
          <path d="M 0 0 Q -8 -5 0 -15 Q 8 -5 0 0 Z" fill="#facc15" />
        </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const SpyUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes scan { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .anim-radar { animation: scan 4s linear infinite; transform-origin: 50px 50px; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
        .anim-pulse-purple { animation: pulse 2s ease-in-out infinite; transform-origin: 50px 50px; }
      `}</style>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#0f172a" stroke="#1e293b" strokeWidth="4" />
        <circle cx="50" cy="50" r="28" fill="#020617" stroke="#a855f7" strokeWidth="2" className="anim-pulse-purple" />
        <g className="anim-radar">
          <path d="M 50 50 L 50 22 A 28 28 0 0 1 78 50 Z" fill="#a855f7" opacity="0.3" />
          <line x1="50" y1="50" x2="50" y2="22" stroke="#a855f7" strokeWidth="2" />
        </g>
        <circle cx="50" cy="50" r="10" fill="#4c1d95" />
        <circle cx="50" cy="50" r="4" fill="#d8b4fe" />
        <path d="M 30 35 Q 50 20 70 35 Q 50 45 30 35 Z" fill="#ffffff" opacity="0.1" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const ReformUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
        <rect x="25" y="15" width="50" height="10" fill="#94a3b8" />
        <rect x="20" y="10" width="60" height="5" fill="#cbd5e1" />
        <rect x="25" y="75" width="50" height="10" fill="#94a3b8" />
        <rect x="20" y="85" width="60" height="5" fill="#cbd5e1" />
        <polygon points="35,25 65,25 65,45 55,50 60,60 65,75 35,75 35,55 45,45 35,40" fill="#e2e8f0" />
        <polygon points="35,25 45,25 45,40 55,45 45,55 45,75 35,75 35,55 45,45 35,40" fill="#cbd5e1" />
        <g transform="translate(50, 50)">
           <polygon points="-20,-5 20,5 20,10 -20,0" fill="#a855f7" />
           <polygon points="-20,5 20,-10 20,-5 -20,10" fill="#7e22ce" />
           <polygon points="-20,-15 15,2 15,7 -20,-10" fill="#9333ea" />
        </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const VerticalUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }} viewBox="0 0 100 100">
        <rect x="20" y="65" width="60" height="20" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <circle cx="35" cy="75" r="4" fill="#b45309" /> <circle cx="65" cy="75" r="4" fill="#b45309" />
        <rect x="20" y="40" width="60" height="20" rx="2" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <line x1="25" y1="50" x2="75" y2="50" stroke="#334155" strokeWidth="3" strokeDasharray="5 5" />
        <rect x="20" y="15" width="60" height="20" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <path d="M 30 25 Q 40 15 50 25 T 70 25" fill="none" stroke="#bae6fd" strokeWidth="2" />
        <g style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.8))' }}>
          <polygon points="50,5 65,30 55,30 55,90 45,90 45,30 35,30" fill="#a855f7" stroke="#d8b4fe" strokeWidth="1" />
        </g>
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const PanicUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <style>{`
        @keyframes crash { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        .anim-crash { stroke-dasharray: 200; animation: crash 1.5s ease-out forwards; }
      `}</style>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 0 6px #a855f7)' }} viewBox="0 0 100 100">
        <polyline points="-10,20 20,30 35,15 50,50 65,40 85,95 110,110" fill="none" stroke="#a855f7" strokeWidth="5" strokeLinejoin="miter" className="anim-crash" />
        <polyline points="-10,20 20,30 35,15 50,50 65,40 85,95 110,110" fill="none" stroke="#d8b4fe" strokeWidth="2" strokeLinejoin="miter" className="anim-crash" />
        <polygon points="75,85 85,80 95,90 85,100" fill="#4c1d95" opacity="0.6" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const ProxyUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
        <rect x="40" y="30" width="20" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        <rect x="44" y="35" width="4" height="6" fill="#f8fafc" />
        <rect x="52" y="35" width="4" height="6" fill="#f8fafc" />
        <rect x="44" y="45" width="4" height="6" fill="#f8fafc" />
        <rect x="52" y="45" width="4" height="6" fill="#f8fafc" />
        <path d="M 10 70 Q 30 90 60 70 L 60 75 L 75 60 L 55 50 L 55 55 Q 30 75 20 60 Z" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
        <path d="M 90 30 Q 70 10 40 30 L 40 25 L 25 40 L 45 50 L 45 45 Q 70 25 80 40 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, #a855f7, #581c87)', border: '1px solid #d8b4fe', boxShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
         <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>!</span>
      </div>
    </div>
  </div>
);

export const CharterUpgraded = () => (
  <div style={{ width: '66px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(0)', willChange: 'transform' }}>
    <div style={{ flexShrink: 0, width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.66)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} viewBox="0 0 100 100">
         <defs>
           <linearGradient id="charterScroll" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#fef3c7" />
             <stop offset="100%" stopColor="#b45309" />
           </linearGradient>
         </defs>
         <path d="M 25 20 C 35 15, 65 15, 75 20 L 75 75 C 65 70, 35 70, 25 75 Z" fill="url(#charterScroll)" stroke="#78350f" strokeWidth="2" />
         <ellipse cx="25" cy="20" rx="5" ry="3" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
         <ellipse cx="75" cy="75" rx="5" ry="3" fill="#b45309" stroke="#78350f" strokeWidth="1" />
         <line x1="35" y1="30" x2="65" y2="30" stroke="#78350f" strokeWidth="2" opacity="0.6" />
         <line x1="35" y1="38" x2="60" y2="38" stroke="#78350f" strokeWidth="2" opacity="0.6" />
         <line x1="35" y1="46" x2="65" y2="46" stroke="#78350f" strokeWidth="2" opacity="0.6" />
         
         <circle cx="50" cy="60" r="12" fill="#9333ea" stroke="#4c1d95" strokeWidth="2" />
         <circle cx="50" cy="60" r="8" fill="none" stroke="#d8b4fe" strokeWidth="1" />
         <path d="M 45 55 L 55 65 M 55 55 L 45 65" stroke="#d8b4fe" strokeWidth="2" />
         <path d="M 50 72 L 40 90 L 45 90 L 50 85 L 55 90 L 60 90 Z" fill="#581c87" stroke="#4c1d95" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', zIndex: 20, top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)', border: '2.5px solid #a855f7', color: '#a855f7', fontWeight: 900, fontSize: '12px', padding: '2px 8px', letterSpacing: '0.1em', backgroundColor: 'rgba(15, 23, 42, 0.8)', boxShadow: '0 0 15px rgba(168,85,247,0.8)', whiteSpace: 'nowrap' }}>
        TAKEOVER
      </div>
    </div>
  </div>
);

// --- REAL GAME DATA WIRED DIRECTLY IN ---
const GREEN_IDENTITY_DATA = {
    'A': { 
        name: "Legacy Plate", 
        levels: {
            1: "You gain $25 if this company builds from Headquarters or Union Yard.",
            2: "You gain $50 if this company builds from Headquarters or Union Yard.",
            3: "You gain $75 if this company builds from Headquarters or Union Yard."
        }
    },
    'B': { 
        name: "Refined I-Beam", 
        levels: {
            1: "+$15 directly to this company's Treasury.",
            2: "+$30 directly to this company's Treasury.",
            3: "+$60 directly to this company's Treasury."
        }
    },
    'C': { 
        name: "The Master Rebate", 
        levels: {
            1: "Coupon: Waives the cost of 1 Blue Contract for You.",
            2: "Coupon: Waives the cost of 2 Blue Contracts for You.",
            3: "Coupon: Waives the cost of 3 Blue Contracts for You."
        }
    },
    'D': { 
        name: "Townsite Subsidy", 
        levels: {
            1: "You gain +$5 per Standard City in this company's network.",
            2: "You gain +$10 per Standard City in this company's network.",
            3: "You gain +$15 per Standard City in this company's network."
        }
    }
};

const BLUE_IDENTITY_DATA = {
    'A': { name: "Signal Rent", levels: { 1: "Baron gains +$50 for every Signal Tower in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Signal Tower in this company's network." } },
    'B': { name: "Shareholder Tribute", levels: { 1: "Baron gains +$40 for every Share Node (Reg HQ/Fed Ex) in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$40 per Share Node in this company's network." } },
    'C': { name: "Parlor Patronage", levels: { 1: "Baron gains +$15 for every Parlor Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Parlor Node in this company's network." } },
    'D': { name: "City Surcharge", levels: { 1: "Baron gains +$15 for every Standard City in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Standard City in this company's network." } },
    'E': { name: "Maintenance Fee", levels: { 1: "Baron gains +$5 for every Built Track Segment owned by this company.", 2: "Clause Negated.", 3: "Rebate: You gain +$5 per Track Segment owned by this company." } },
    'F': { name: "Rust Tariff", levels: { 1: "Baron gains +$150 if this company builds into the Rust Belt.", 2: "Clause Negated.", 3: "Rebate: You gain +$150 if this company builds into the Rust Belt." } },
    'G': { name: "Mountain Toll", levels: { 1: "Baron gains +$100 for every Mountain Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$100 per Mountain Node in this company's network." } },
    'H': { name: "Shareholder Tax", levels: { 1: "Baron gains +$15 for every share issued (You + Baron).", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Share issued." } },
    'I': { name: "Depot Ground Rent", levels: { 1: "Baron gains +$50 for every Depot in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Depot in this company's network." } },
    'J': { name: "Federal Excise", levels: { 1: "Baron gains +$50 for every Fed. Exchange in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Fed. Exchange in this company's network." } },
    'K': { name: "Regional Levy", levels: { 1: "Baron gains +$50 for every Regional HQ in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Regional HQ in this company's network." } },
    'L': { name: "Shared Hub Fee", levels: { 1: "Bank pays Baron +$50 for every node shared by this company and others.", 2: "Clause Negated.", 3: "Rebate: Bank pays You +$50 per Shared Hub." } },
    'M': { name: "Specialty Surcharge", levels: { 1: "Baron gains +$15 for every Special Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Special Node in this company's network." } },
    'N': { name: "Expansion Penalty", levels: { 1: "Baron gains +$10 for every total node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$10 per Node in this company's network." } },
    'O': { name: "GN Acquisition", levels: { 1: "The Baron buys a share of The Great Northern.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free GN share." } },
    'P': { name: "Treasury Match", levels: { 1: "Bank pays Baron an amount equal to 75% of this company's Treasury.", 2: "Clause Negated.", 3: "Rebate: Bank pays You equal to 75% of this company's Treasury." } },
    'Q': { name: "OR&N Acquisition", levels: { 1: "The Baron buys a share of The OR&N.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free OR&N share." } },
    'R': { name: "Inventory Holding", levels: { 1: "Baron gains +$20 for every unbuilt track segment held by this company.", 2: "Clause Negated.", 3: "Rebate: You gain +$20 per unbuilt track segment held by this company." } },
    'S': { name: "CP Acquisition", levels: { 1: "The Baron buys a share of The Central Pacific.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free CP share." } },
    'T': { name: "Asset Surcharge", levels: { 1: "Baron gains +$10 for every card in the Discard Piles.", 2: "Clause Negated.", 3: "Rebate: You gain +$10 per Discarded Card." } },
    'U': { name: "Trust Syndicate", levels: { 1: "Baron acquires the most expensive available Private Company.", 2: "Clause Negated.", 3: "Rebate: You acquire a random Private Company for FREE." } }
};

const RED_IDENTITY_DATA = {
    'A': { name: "Audit Purge", levels: { 1: "Trash Card: Select 1 card in the Audit Ledger to permanently remove.", 2: "Trash Card: Select 2 cards to remove.", 3: "Trash Card: Select 4 cards to remove." } },
    'B': { name: "Industrial Espionage", levels: { 1: "Cash Grab: You instantly steal $50 from the Baron's wallet.", 2: "Cash Grab: You instantly steal $100 from the Baron.", 3: "Cash Grab: You instantly steal $200 from the Baron." } },
    'C': { name: "Structural Reform", levels: { 1: "Price Fix: Permanently reduce base price of Blue cards by $1.", 2: "Price Fix: Permanently reduce base price of Blue cards by $2.", 3: "Price Fix: Permanently reduce base price of Blue cards by $4." } },
    'D': { name: "Vertical Integration", levels: { 1: "This company receives 7 track segments instantly.", 2: "This company receives 14 track segments instantly.", 3: "This company receives 28 track segments instantly." } },
    'E': { name: "Panic on the Floor", levels: { 1: "Hyper-Inflation: Double this company's Treasury.", 2: "Hyper-Inflation: Double 2 companies' Treasuries.", 3: "Hyper-Inflation: Double all companies' Treasuries." } },
    'F': { name: "Proxy Fight", levels: { 1: "Hostile Liquidation: Baron sells all shares of his largest holding.", 2: "Hostile Liquidation: Baron sells top 2 holdings.", 3: "Hostile Liquidation: Baron sells all holdings." } },
    'G': { name: "Charter Acquisition", levels: { 1: "Action: Purchase an unowned Private Company from the map.", 2: "Action: Purchase a Private Company at a 20% discount.", 3: "Action: Purchase a Private Company. The Time Tax is waived." } }
};

export const getNativeCardInfo = (item) => {
    let data = null;
    const lookup = item.label ? item.label.charAt(0) : 'A';
    const level = item.level || 1;
    
    // Fetch data
    if (item.type === 'green') data = GREEN_IDENTITY_DATA[lookup];
    if (item.type === 'blue') data = BLUE_IDENTITY_DATA[lookup];
    if (item.type === 'red') data = RED_IDENTITY_DATA[lookup];

    let name = data ? data.name : `Unit ${lookup}`;
    let desc = data ? (data.levels && data.levels[level] ? data.levels[level] : "Industrial Asset") : "Standard Industrial Asset.";
    
    let icon = <TagIcon />; // Default icon

    // Map Specific Art for Green Cards
    if (item.type === 'green') {
        if (lookup === 'A') icon = <LegacyPlateIcon />;
        else if (lookup === 'B') icon = <IBeamUpgraded />;
        else if (lookup === 'C') icon = <MasterRebateUpgraded />;
        else if (lookup === 'D') icon = <SubsidyUpgraded />;
    } 
    // Map Specific Art for Blue Cards
    else if (item.type === 'blue') {
        if (lookup === 'A') icon = <SignalUpgraded />;
        else if (lookup === 'B') icon = <ShareUpgraded />;
        else if (lookup === 'C') icon = <ParlorUpgraded />;
        else if (lookup === 'D') icon = <CityUpgraded />;
        else if (lookup === 'E') icon = <MaintenanceUpgraded />;
        else if (lookup === 'F') icon = <RustUpgraded />;
        else if (lookup === 'G') icon = <MountainUpgraded />;
        else if (lookup === 'H') icon = <TaxUpgraded />;
        else if (lookup === 'I') icon = <DepotUpgraded />;
        else if (lookup === 'J') icon = <FedExciseUpgraded />;
        else if (lookup === 'K') icon = <RegionalLevyUpgraded />;
        else if (lookup === 'L') icon = <HubUpgraded />;
        else if (lookup === 'M') icon = <SpecialtyUpgraded />;
        else if (lookup === 'N') icon = <ExpansionUpgraded />;
        else if (lookup === 'O') icon = <GNUpgraded />;
        else if (lookup === 'P') icon = <TreasuryUpgraded />;
        else if (lookup === 'Q') icon = <ORNUpgraded />;
        else if (lookup === 'R') icon = <InventoryUpgraded />;
        else if (lookup === 'S') icon = <CPUpgraded />;
        else if (lookup === 'T') icon = <AssetUpgraded />;
        else if (lookup === 'U') icon = <TrustUpgraded />;
    }
    // Map Specific Art for Red Cards (Purple visually)
    else if (item.type === 'red') {
        if (lookup === 'A') icon = <AuditUpgraded />;
        else if (lookup === 'B') icon = <SpyUpgraded />;
        else if (lookup === 'C') icon = <ReformUpgraded />;
        else if (lookup === 'D') icon = <VerticalUpgraded />;
        else if (lookup === 'E') icon = <PanicUpgraded />;
        else if (lookup === 'F') icon = <ProxyUpgraded />;
        else if (lookup === 'G') icon = <CharterUpgraded />;
    }

    return { name, desc, icon };
};