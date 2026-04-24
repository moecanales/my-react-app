import React from 'react';
import { mapStrokeFilter } from './GameBoardUtils';

const SharedMapAnimations = () => (
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

    @keyframes slowLightOn { 0%, 30% { opacity: 0.8; fill: #0f172a; } 70%, 100% { opacity: 1; fill: #bae6fd; } }
    .light-a { animation: slowLightOn 12s ease-in-out infinite alternate; }
    .light-b { animation: slowLightOn 18s ease-in-out infinite alternate-reverse; animation-delay: 3s; }
    .light-c { animation: slowLightOn 24s ease-in-out infinite alternate; animation-delay: 8s; }
    .light-d { animation: slowLightOn 15s ease-in-out infinite alternate-reverse; animation-delay: 11s; }
    .light-on { opacity: 1; fill: #93c5fd; }
    .light-off { opacity: 0.8; fill: #0f172a; }
    @keyframes blinkBeacon { 0%, 85% { opacity: 0.1; } 90%, 100% { opacity: 1; } }
    .anim-beacon { animation: blinkBeacon 2s infinite; }
    @keyframes paceWindow { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(-3px, -1.5px); } 90%, 100% { transform: translate(0px, 0px); } }
    .anim-silhouette { animation: paceWindow 8s ease-in-out infinite; }

    @keyframes warmLightOn { 0%, 25% { opacity: 0.9; fill: #6b21a8; } 75%, 100% { opacity: 1; fill: #fde047; } }
    .warm-a { animation: warmLightOn 10s ease-in-out infinite alternate; }
    .warm-b { animation: warmLightOn 14s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
    .warm-c { animation: warmLightOn 18s ease-in-out infinite alternate; animation-delay: 5s; }
    .warm-on { opacity: 1; fill: #fef08a; }
    .warm-off { opacity: 0.9; fill: #6b21a8; }
    @keyframes flickerNeon { 0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; fill: #fde047; } 20%, 24%, 55% { opacity: 0.4; fill: #a855f7; } }
    .anim-neon { animation: flickerNeon 4s infinite; }
    @keyframes meetLeftGuy { 0%, 10% { transform: translate(-10px, -5px); opacity: 0; } 20% { opacity: 1; } 35%, 65% { transform: translate(0px, 0px); opacity: 1; } 80% { opacity: 1; } 90%, 100% { transform: translate(-10px, -5px); opacity: 0; } }
    @keyframes meetRightGuy { 0%, 10% { transform: translate(12px, 6px); opacity: 0; } 20% { opacity: 1; } 35%, 65% { transform: translate(3px, 1.5px); opacity: 1; } 80% { opacity: 1; } 90%, 100% { transform: translate(12px, 6px); opacity: 0; } }
    .anim-meet-a { animation: meetLeftGuy 12s ease-in-out infinite; }
    .anim-meet-b { animation: meetRightGuy 12s ease-in-out infinite; }

    @keyframes semaphorePing { 0%, 15% { transform: rotate(0deg); } 20%, 40% { transform: rotate(45deg); } 45%, 65% { transform: rotate(-45deg); } 70%, 90% { transform: rotate(90deg); } 95%, 100% { transform: rotate(0deg); } }
    @keyframes semaphorePong { 0%, 15% { transform: rotate(0deg); } 20%, 40% { transform: rotate(-90deg); } 45%, 65% { transform: rotate(45deg); } 70%, 90% { transform: rotate(-45deg); } 95%, 100% { transform: rotate(0deg); } }
    .anim-sem-left { animation: semaphorePing 8s infinite; transform-origin: 0px 0px; }
    .anim-sem-right { animation: semaphorePong 10s infinite; transform-origin: 0px 0px; }
    @keyframes glassGlint { 0%, 45% { opacity: 0.2; } 50% { opacity: 0.8; } 55%, 100% { opacity: 0.2; } }
    .anim-glint { animation: glassGlint 6s infinite; }

    @keyframes smokeRise { 0% { transform: translate(0, 0) scale(1); opacity: 0.8; } 100% { transform: translate(5px, -15px) scale(2); opacity: 0; } }
    .anim-smoke-1 { animation: smokeRise 3s infinite; }
    .anim-smoke-2 { animation: smokeRise 3s infinite; animation-delay: 1.5s; }
    @keyframes moltenGlow { 0%, 100% { fill: #0891b2; opacity: 0.7; } 50% { fill: #f59e0b; opacity: 1; } }
    .anim-molten { animation: moltenGlow 3s ease-in-out infinite; }
    @keyframes tieMove { 0%, 40% { transform: translate(10px, -5px); opacity: 0; } 45% { opacity: 1; } 100% { transform: translate(-10px, 5px); opacity: 1; } }
    .anim-tie { animation: tieMove 5s linear infinite; }

    @keyframes weldFlash { 0%, 4%, 8%, 100% { opacity: 0; } 2% { opacity: 1; fill: #ffffff; } 6% { opacity: 0.8; fill: #67e8f9; } }
    .anim-weld { animation: weldFlash 3s infinite; }
    @keyframes forgePulse { 0%, 100% { fill: #7c2d12; opacity: 0.8; } 50% { fill: #ea580c; opacity: 1; } }
    .anim-forge { animation: forgePulse 4s ease-in-out infinite; }

    @keyframes paceBanker1 { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(-10px, 5px); } 90%, 100% { transform: translate(0px, 0px); } }
    @keyframes paceBanker2 { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(10px, 5px); } 90%, 100% { transform: translate(0px, 0px); } }
    .anim-banker-1 { animation: paceBanker1 8s ease-in-out infinite; }
    .anim-banker-2 { animation: paceBanker2 9s ease-in-out infinite; animation-delay: 1.5s; }

    @keyframes hqWarmLightOn { 0%, 25% { opacity: 0.9; fill: #881337; } 75%, 100% { opacity: 1; fill: #fde047; } }
    .hq-light-a { animation: hqWarmLightOn 10s ease-in-out infinite alternate; }
    .hq-light-b { animation: hqWarmLightOn 14s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
    .hq-light-c { animation: hqWarmLightOn 18s ease-in-out infinite alternate; animation-delay: 5s; }
    .hq-light-on { opacity: 1; fill: #fef08a; }
    .hq-light-off { opacity: 0.9; fill: #881337; }
    @keyframes paceCEO { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(3px, 1.5px); } 90%, 100% { transform: translate(0px, 0px); } }
    .anim-ceo { animation: paceCEO 6s ease-in-out infinite; }
    @keyframes telegraphSpark { 0%, 80% { opacity: 0; } 82% { opacity: 1; fill: #e0f2fe; transform: scale(1.5); } 84% { opacity: 0; } 86% { opacity: 1; fill: #7dd3fc; transform: scale(2.5); } 88%, 100% { opacity: 0; } }
    .anim-telegraph { animation: telegraphSpark 4s infinite; transform-origin: 50px -15px; }

    @keyframes paceGuardLeft { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(15px, 7.5px); } 90%, 100% { transform: translate(0px, 0px); } }
    @keyframes paceGuardRight { 0%, 10% { transform: translate(0px, 0px); } 40%, 60% { transform: translate(-15px, 7.5px); } 90%, 100% { transform: translate(0px, 0px); } }
    .anim-guard-left { animation: paceGuardLeft 10s ease-in-out infinite; }
    .anim-guard-right { animation: paceGuardRight 9s ease-in-out infinite; animation-delay: 1s; }
    @keyframes solidGlow { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; } }
    .anim-secure-light { animation: solidGlow 2s infinite; }

    @keyframes flickerTavern { 
      0%, 100% { fill: #fde047; opacity: 1; } 
      50% { fill: #fef08a; opacity: 0.6; } 
      75% { fill: #eab308; opacity: 0.9; } 
    }
    .anim-flicker-1 { animation: flickerTavern 2s infinite alternate; }
    .anim-flicker-2 { animation: flickerTavern 2.5s infinite alternate-reverse; }
    
    @keyframes swingLeft { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.1); } }
    @keyframes swingRight { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.1); } }
    .anim-swing-l { animation: swingLeft 3s ease-in-out infinite; transform-origin: 34px 62.5px; }
    .anim-swing-r { animation: swingRight 3s ease-in-out infinite; transform-origin: 42px 66px; animation-delay: 0.2s; }

    @keyframes nastySmog1 { 0% { transform: translate(0, 0) scale(1); opacity: 0.4; fill: #0f172a; } 50% { opacity: 0.6; fill: #020617; } 100% { transform: translate(12px, -30px) scale(3.5); opacity: 0; } }
    @keyframes nastySmog2 { 0% { transform: translate(0, 0) scale(0.8); opacity: 0.3; fill: #1e293b; } 50% { opacity: 0.5; fill: #0f172a; } 100% { transform: translate(-10px, -35px) scale(4); opacity: 0; } }
    @keyframes nastySmog3 { 0% { transform: translate(0, 0) scale(1.2); opacity: 0.5; fill: #020617; } 50% { opacity: 0.7; fill: #020617; } 100% { transform: translate(18px, -25px) scale(3); opacity: 0; } }
    .smog-a { animation: nastySmog1 3s infinite; transform-box: fill-box; transform-origin: center; }
    .smog-b { animation: nastySmog2 4s infinite; transform-box: fill-box; transform-origin: center; }
    .smog-c { animation: nastySmog3 3.5s infinite; transform-box: fill-box; transform-origin: center; }
  `}</style>
);

const StandardCityLiving = ({ x, y }) => (
  <div className="relative flex items-center justify-center transition-transform" style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
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
);

const FedExchangeLiving = ({ x, y }) => {
  const clipId = `fedClip-${Math.floor(x)}-${Math.floor(y)}`;
  return (
    <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <g transform="scale(0.9) translate(5, 5)">
          <polygon points="50,10 20,25 50,40 80,25" fill="#2563eb" />
          <polygon points="50,15 25,27.5 50,40 75,27.5" fill="#1e40af" /> 
          <line x1="50" y1="15" x2="50" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx="50" cy="5" r="1.5" fill="#ef4444" className="anim-beacon" />
          <polygon points="20,25 50,40 50,90 20,75" fill="#004aad" />
          <polygon points="24,31 31,34.5 31,42.5 24,39" className="light-a" />
          <polygon points="33,35.5 40,39 40,47 33,43.5" className="light-on" />
          <polygon points="42,40 48,43 48,51 42,48" className="light-off" />
          <polygon points="24,43 31,46.5 31,54.5 24,51" className="light-off" />
          <polygon points="33,47.5 40,51 40,59 33,55.5" className="light-b" />
          <polygon points="42,52 48,55 48,63 42,60" className="light-on" />
          <polygon points="24,55 31,58.5 31,66.5 24,63" className="light-c" />
          <polygon points="33,59.5 40,63 40,71 33,67.5" className="light-off" />
          <polygon points="42,64 48,67 48,75 42,72" className="light-d" />
          <polygon points="33,71.5 46,78 46,86 33,79.5" fill="#172554" />
          <polygon points="34,73 39,75.5 39,82.5 34,80" fill="#e0f2fe" />
          <polygon points="40,76 45,78.5 45,85.5 40,83" fill="#e0f2fe" />
          <polygon points="50,40 80,25 80,75 50,90" fill="#1e3a8a" />
          <polygon points="52,43 58,40 58,48 52,51" className="light-c" />
          <polygon points="60,39 67,35.5 67,43.5 60,47" className="light-off" />
          <polygon points="69,34.5 76,31 76,39 69,42.5" className="light-on" />
          <polygon points="52,55 58,52 58,60 52,63" className="light-on" />
          <polygon points="60,51 67,47.5 67,55.5 60,59" className="light-a" />
          <polygon points="69,46.5 76,43 76,51 69,54.5" className="light-off" />
          <polygon points="52,67 58,64 58,72 52,75" className="light-off" />
          <polygon points="60,63 67,59.5 67,67.5 60,71" className="light-on" />
          <g>
            <polygon points="69,58.5 76,55 76,63 69,66.5" fill="#bae6fd" />
            <clipPath id={clipId}>
              <polygon points="69,58.5 76,55 76,63 69,66.5" />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <polygon points="73,61 74.5,60 74.5,66 73,66" fill="#0f172a" opacity="0.8" className="anim-silhouette" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

const ParlorLiving = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
        <polygon points="65,32.5 50,40 65,47.5 80,40" fill="#d8b4fe" />
        <polygon points="65,47.5 80,40 80,75 65,82.5" fill="#9333ea" />
        <polygon points="77,45 72,47.5 72,54.5 77,52" className="warm-off" />
        <polygon points="77,57 72,59.5 72,66.5 77,64" className="warm-c" />
        <polygon points="77,69 72,71.5 72,78.5 77,76" className="warm-on" />
        <polygon points="35,32.5 20,40 35,47.5 50,40" fill="#d8b4fe" />
        <polygon points="20,40 35,47.5 35,82.5 20,75" fill="#c084fc" />
        <polygon points="35,47.5 50,40 50,75 35,82.5" fill="#9333ea" />
        <polygon points="23,45 28,47.5 28,54.5 23,52" className="warm-a" />
        <polygon points="23,57 28,59.5 28,66.5 23,64" className="warm-on" />
        <polygon points="23,69 28,71.5 28,78.5 23,76" className="warm-on" />
        <g>
          <polygon points="25,78 26.5,78.5 26.5,84 25,83.5" fill="#4c1d95" opacity="0.9" className="anim-meet-a" />
          <polygon points="25,78 26.5,78.5 26.5,84 25,83.5" fill="#4c1d95" opacity="0.9" className="anim-meet-b" />
        </g>
        <polygon points="50,15 35,22.5 50,30 65,22.5" fill="#d8b4fe" />
        <polygon points="50,18 38,24 50,30 62,24" fill="#a855f7" />
        <polygon points="35,22.5 50,30 50,90 35,82.5" fill="#c084fc" />
        <polygon points="50,30 65,22.5 65,82.5 50,90" fill="#9333ea" />
        <polygon points="37,30 42,32.5 42,39.5 37,37" className="warm-b" />
        <polygon points="44,33.5 49,36 49,43 44,40.5" className="warm-off" />
        <polygon points="37,41 42,43.5 42,50.5 37,48" className="warm-on" />
        <polygon points="44,44.5 49,47 49,54 44,51.5" className="warm-a" />
        <polygon points="37,52 42,54.5 42,61.5 37,59" className="warm-c" />
        <polygon points="44,55.5 49,58 49,65 44,62.5" className="warm-on" />
        <polygon points="51,33.5 56,31 56,38 51,40.5" className="warm-on" />
        <polygon points="58,30 63,27.5 63,34.5 58,37" className="warm-a" />
        <polygon points="51,44.5 56,42 56,49 51,51.5" className="warm-c" />
        <polygon points="58,41 63,38.5 63,45.5 58,48" className="warm-off" />
        <polygon points="51,55.5 56,53 56,60 51,62.5" className="warm-on" />
        <polygon points="58,52 63,49.5 63,56.5 58,59" className="warm-b" />
        <polygon points="45,87.5 50,90 55,87.5 55,75 50,77.5 45,75" fill="#581c87" />
        <polygon points="46.5,85 49,86 49,78 46.5,77" fill="#c084fc" opacity="0.5" />
        <polygon points="51,86 53.5,85 53.5,77 51,78" fill="#c084fc" opacity="0.5" />
        <polygon points="43,68 50,71.5 50,75.5 43,72" fill="#c026d3" />
        <polygon points="50,71.5 57,68 57,72 50,75.5" fill="#a21caf" />
        <polygon points="43,68 50,65 57,68 50,71.5" fill="#e879f9" />
        <polygon points="44,70 49,72.5 49,73.5 44,71" className="anim-neon" />
        <polygon points="51,72.5 56,70 56,71 51,73.5" className="anim-neon" />
      </g>
    </svg>
  </div>
);

const SignalTowerLiving = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
        <polygon points="35,77 50,84.5 50,90 35,82.5" fill="#64748b" />
        <polygon points="50,84.5 65,77 65,82.5 50,90" fill="#334155" />
        <polygon points="35,77 50,69.5 65,77 50,84.5" fill="#94a3b8" />
        <polygon points="38,76 50,82 50,35 38,29" fill="#7dd3fc" />
        <polygon points="50,82 62,76 62,29 50,35" fill="#38bdf8" />
        <polygon points="42,70 46,72 46,60 42,58" fill="#0f172a" opacity="0.8" />
        <polygon points="42,52 46,54 46,42 42,40" fill="#0f172a" opacity="0.8" />
        <polygon points="54,72 58,70 58,58 54,60" fill="#1e293b" opacity="0.8" />
        <polygon points="54,54 58,52 58,40 54,42" fill="#1e293b" opacity="0.8" />
        <polygon points="34,31 50,39 50,35 38,29" fill="#bae6fd" />
        <polygon points="50,39 66,31 62,29 50,35" fill="#94a3b8" />
        <polygon points="34,31 50,39 50,22 34,14" fill="#e0f2fe" />
        <polygon points="50,39 66,31 66,14 50,22" fill="#bae6fd" />
        <polygon points="36,29 41.5,31.5 41.5,19.5 36,17" fill="#0284c7" className="anim-glint" />
        <polygon points="43.5,32.5 48,35 48,23 43.5,20.5" fill="#0284c7" className="anim-glint" />
        <polygon points="52,35 56.5,32.5 56.5,20.5 52,23" fill="#0369a1" />
        <polygon points="58.5,31.5 64,29 64,17 58.5,19.5" fill="#0369a1" />
        <polygon points="32,15 50,24 50,2" fill="#475569" />
        <polygon points="50,24 68,15 50,2" fill="#1e293b" />
        <circle cx="50" cy="2" r="1.5" fill="#94a3b8" />
        <line x1="50" y1="2" x2="50" y2="-12" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        <g transform="translate(50, -8)">
          <g className="anim-sem-left">
            <line x1="0" y1="0" x2="-14" y2="0" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="-14" y="-2" width="5" height="4" fill="#ef4444" />
          </g>
          <g className="anim-sem-right">
            <line x1="0" y1="0" x2="14" y2="0" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="9" y="-2" width="5" height="4" fill="#ef4444" />
          </g>
        </g>
      </g>
    </svg>
  </div>
);

const TrainDepotLiving = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
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
        <polygon points="23,65 25,62 27,66" fill="#ffffff" className="anim-weld" />
        <polygon points="38,69.5 40.5,68 40.5,70.5 38,72" fill="#334155" />
        <polygon points="35.5,68 38,69.5 38,72 35.5,70.5" fill="#1e293b" />
        <polygon points="35.5,68 38,66.5 40.5,68 38,69.5" fill="#475569" />
        <polygon points="37,64 39,65 39,68 37,67" fill="#0f172a" />
        <polygon points="34,73 38,75 42,73 38,71" fill="#0f172a" />
        <polygon points="48,68 50,67 54,69 54,83 48,80" className="anim-forge" />
      </g>
    </svg>
  </div>
);

const UnionYardLiving = ({ x, y }) => {
  const idPrefix = `uy-${Math.floor(x)}-${Math.floor(y)}`;
  return (
    <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id={`${idPrefix}-stackALeft`}> <polygon points="42,44.5 45,46 45,14 42,12.5" /> </clipPath>
          <clipPath id={`${idPrefix}-stackARight`}> <polygon points="45,46 48,44.5 48,12.5 45,14" /> </clipPath>
          <clipPath id={`${idPrefix}-stackBLeft`}> <polygon points="49,41 52,42.5 52,10.5 49,9" /> </clipPath>
          <clipPath id={`${idPrefix}-stackBRight`}> <polygon points="52,42.5 55,41 55,9 52,10.5" /> </clipPath>
          <clipPath id={`${idPrefix}-tieMask`}> <polygon points="23,78 32,82.5 32,100 0,100 0,78" /> </clipPath>
        </defs>
        <g transform="scale(0.9) translate(5, 5)">
          <circle cx="45" cy="11" r="3" fill="#94a3b8" className="anim-smoke-1" />
          <circle cx="52" cy="7.5" r="4" fill="#cbd5e1" className="anim-smoke-2" />
          <polygon points="42,44.5 45,46 45,14 42,12.5" fill="#cbd5e1" />
          <g clipPath={`url(#${idPrefix}-stackALeft)`}>
            <polygon points="30,30 60,45 60,39 30,24" fill="#ef4444" />
            <polygon points="30,20 60,35 60,29 30,14" fill="#ef4444" />
          </g>
          <polygon points="45,46 48,44.5 48,12.5 45,14" fill="#94a3b8" />
          <g clipPath={`url(#${idPrefix}-stackARight)`}>
            <polygon points="30,45 60,30 60,24 30,39" fill="#dc2626" />
            <polygon points="30,35 60,20 60,14 30,29" fill="#dc2626" />
          </g>
          <polygon points="42,12.5 45,14 48,12.5 45,11" fill="#1e293b" />
          <polygon points="49,41 52,42.5 52,10.5 49,9" fill="#cbd5e1" />
          <g clipPath={`url(#${idPrefix}-stackBLeft)`}>
            <polygon points="40,31.5 70,46.5 70,40.5 40,25.5" fill="#ef4444" />
            <polygon points="40,21.5 70,36.5 70,30.5 40,15.5" fill="#ef4444" />
          </g>
          <polygon points="52,42.5 55,41 55,9 52,10.5" fill="#94a3b8" />
          <g clipPath={`url(#${idPrefix}-stackBRight)`}>
            <polygon points="40,43.5 70,28.5 70,22.5 40,37.5" fill="#dc2626" />
            <polygon points="40,33.5 70,18.5 70,12.5 40,27.5" fill="#dc2626" />
          </g>
          <polygon points="49,9 52,10.5 55,9 52,7.5" fill="#1e293b" />
          <polygon points="50,75 80,60 80,75 50,90" fill="#0891b2" />
          <polygon points="20,60 27.5,52.5 57.5,37.5 50,45" fill="#334155" /> 
          <polygon points="23,58 27.5,53.5 54.5,40 50,44.5" fill="#67e8f9" className="anim-molten" style={{animationDelay: '0.75s'}} /> 
          <polygon points="27.5,52.5 35,67.5 65,52.5 57.5,37.5" fill="#475569" /> 
          <polygon points="20,60 35,67.5 27.5,52.5" fill="#06b6d4" /> 
          <polygon points="20,60 35,67.5 35,82.5 20,75" fill="#0ea5e9" /> 
          <polygon points="23,70 32,74.5 32,82.5 23,78" fill="#1e293b" />
          <polygon points="23,70 32,74.5 32,76 23,71.5" fill="#facc15" /> 
          <polygon points="24,71.5 26,72.5 26,74 24,73" fill="#0f172a" />
          <polygon points="28,73.5 30,74.5 30,76 28,75" fill="#0f172a" />
          <polygon points="17,77 28,82.5 32,80.5 21,75" fill="#475569" />
          <polygon points="17,77 28,82.5 28,84.5 17,79" fill="#334155" />
          <polygon points="28,82.5 32,80.5 32,82.5 28,84.5" fill="#1e293b" />
          <g className="anim-tie" clipPath={`url(#${idPrefix}-tieMask)`}>
            <polygon points="24,76.5 28,78.5 29,78 25,76" fill="#78350f" />
            <polygon points="24,76.5 28,78.5 28,79.5 24,77.5" fill="#451a03" />
          </g>
          <polygon points="35,67.5 42.5,60 72.5,45 65,52.5" fill="#334155" /> 
          <polygon points="38,65.5 42.5,61 69.5,47.5 65,52" fill="#67e8f9" className="anim-molten" style={{animationDelay: '1.5s'}} /> 
          <polygon points="42.5,60 50,75 80,60 72.5,45" fill="#475569" /> 
          <polygon points="35,67.5 50,75 42.5,60" fill="#06b6d4" /> 
          <polygon points="35,67.5 50,75 50,90 35,82.5" fill="#0ea5e9" /> 
        </g>
      </svg>
    </div>
  );
};

const MergerPantheonLiving = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
        <polygon points="15,67.5 50,85 85,67.5 50,50" fill="#e2e8f0" />
        <polygon points="15,67.5 50,85 50,88 15,70.5" fill="#94a3b8" />
        <polygon points="50,85 85,67.5 85,70.5 50,88" fill="#64748b" />
        <polygon points="12,70.5 50,89.5 88,70.5 50,51.5" fill="#cbd5e1" />
        <polygon points="12,70.5 50,89.5 50,94 12,75" fill="#94a3b8" />
        <polygon points="50,89.5 88,70.5 88,75 50,94" fill="#64748b" />
        <polygon points="25,62.5 50,75 50,40 25,27.5" fill="#eab308" />
        <polygon points="50,75 75,62.5 75,27.5 50,40" fill="#ca8a04" />
        <polygon points="36,68 46,73 46,59 36,54" fill="#451a03" />
        <polygon points="36.5,67.75 45.5,72.25 45.5,59.5 36.5,55" fill="#78350f" />
        <polygon points="54,73 64,68 64,54 54,59" fill="#451a03" />
        <polygon points="54.5,72.25 63.5,67.75 63.5,55 54.5,59.5" fill="#78350f" />
        <polygon points="35,66 37,67 37,73 35,72" fill="#0f172a" opacity="0.8" className="anim-banker-1" />
        <polygon points="58,66 60,65 60,71 58,72" fill="#0f172a" opacity="0.8" className="anim-banker-2" />
        <polygon points="20,65 23,66.5 23,41.5 20,40" fill="#f8fafc" />
        <polygon points="23,66.5 25,65.5 25,40.5 23,41.5" fill="#cbd5e1" />
        <polygon points="30,70 33,71.5 33,46.5 30,45" fill="#f8fafc" />
        <polygon points="33,71.5 35,70.5 35,45.5 33,46.5" fill="#cbd5e1" />
        <polygon points="40,75 43,76.5 43,51.5 40,50" fill="#f8fafc" />
        <polygon points="43,76.5 45,75.5 45,50.5 43,51.5" fill="#cbd5e1" />
        <polygon points="55,75.5 58,74 58,49 55,50.5" fill="#f8fafc" />
        <polygon points="58,74 60,73 60,48 58,49" fill="#cbd5e1" />
        <polygon points="65,70.5 68,69 68,44 65,45.5" fill="#f8fafc" />
        <polygon points="68,69 70,68 70,43 68,44" fill="#cbd5e1" />
        <polygon points="75,65.5 78,64 78,39 75,40.5" fill="#f8fafc" />
        <polygon points="78,64 80,63 80,38 78,39" fill="#cbd5e1" />
        <polygon points="18,41 50,57 50,52 18,36" fill="#fef08a" />
        <polygon points="50,57 82,41 82,36 50,52" fill="#eab308" />
        <polygon points="18,36 50,52 50,20" fill="#fde047" />
        <polygon points="50,52 82,36 50,20" fill="#eab308" />
      </g>
    </svg>
  </div>
);

const RegionalHQLiving = ({ x, y }) => {
  const ceoClipId = `ceoClip-${Math.floor(x)}-${Math.floor(y)}`;
  return (
    <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <g transform="scale(0.9) translate(5, 5)">
          <polygon points="10,55 50,75 50,80 10,60" fill="#94a3b8" />
          <polygon points="50,75 90,55 90,60 50,80" fill="#64748b" />
          <polygon points="10,55 50,75 90,55 50,35" fill="#cbd5e1" />
          <polygon points="15,57.5 30,65 30,35 15,27.5" fill="#e11d48" />
          <polygon points="15,27.5 30,35 45,27.5 30,20" fill="#475569" />
          <polygon points="18,33 22,35 22,42 18,40" className="hq-light-c" />
          <polygon points="18,46 22,48 22,55 18,53" className="hq-light-on" />
          <polygon points="25,36.5 29,38.5 29,45.5 25,43.5" className="hq-light-a" />
          <polygon points="25,49.5 29,51.5 29,58.5 25,56.5" className="hq-light-off" />
          <polygon points="70,65 85,57.5 85,27.5 70,35" fill="#be123c" />
          <polygon points="55,27.5 70,35 85,27.5 70,20" fill="#475569" />
          <polygon points="71,38.5 75,36.5 75,43.5 71,45.5" className="hq-light-b" />
          <polygon points="71,51.5 75,49.5 75,56.5 71,58.5" className="hq-light-on" />
          <polygon points="78,35 82,33 82,40 78,42" className="hq-light-off" />
          <polygon points="78,48 82,46 82,53 78,55" className="hq-light-a" />
          <polygon points="30,65 50,75 50,15 30,5" fill="#e11d48" />
          <polygon points="50,75 70,65 70,5 50,15" fill="#be123c" />
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
            <clipPath id={ceoClipId}>
              <polygon points="34,15 38,17 38,24 34,22" />
            </clipPath>
            <g clipPath={`url(#${ceoClipId})`}>
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
  );
};

const FinancialHubLiving = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
        <polygon points="10,55 50,75 50,60 10,40" fill="#94a3b8" /> 
        <polygon points="50,75 90,55 90,40 50,60" fill="#64748b" /> 
        <polygon points="10,40 50,60 90,40 50,20" fill="#cbd5e1" /> 
        <polygon points="15,42.5 50,60 50,30 15,12.5" fill="#10b981" /> 
        <polygon points="50,60 85,42.5 85,12.5 50,30" fill="#059669" /> 
        <polygon points="20,45 22,46 22,17 20,16" fill="#34d399" />
        <polygon points="30,50 32,51 32,22 30,21" fill="#34d399" />
        <polygon points="40,55 42,56 42,27 40,26" fill="#34d399" />
        <polygon points="58,56 60,55 60,26 58,27" fill="#047857" />
        <polygon points="68,51 70,50 70,21 68,22" fill="#047857" />
        <polygon points="78,46 80,45 80,16 78,17" fill="#047857" />
        <polygon points="24,42 28,44 28,30 24,28" fill="#fde047" className="anim-secure-light" />
        <polygon points="34,47 38,49 38,35 34,33" fill="#fde047" className="anim-secure-light" />
        <polygon points="62,49 66,47 66,33 62,35" fill="#fde047" className="anim-secure-light" />
        <polygon points="72,44 76,42 76,28 72,30" fill="#fde047" className="anim-secure-light" />
        <polygon points="12,12.5 50,31.5 88,12.5 50,-6.5" fill="#6ee7b7" /> 
        <polygon points="15,10 50,27.5 85,10 50,-7.5" fill="#475569" /> 
        <polygon points="18,36 20,37 20,43 18,42" fill="#0f172a" className="anim-guard-left" />
        <polygon points="80,36 82,37 82,43 80,42" fill="#0f172a" className="anim-guard-right" />
      </g>
    </svg>
  </div>
);

const BoomtownSaloon = ({ x, y }) => (
  <div style={{ filter: mapStrokeFilter, position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%) scale(0.32)', pointerEvents: 'none', width: '160px', height: '160px', zIndex: 10 }}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <g transform="scale(0.9) translate(5, 5)">
        <polygon points="5,65 50,87.5 95,65 50,42.5" fill="#92400e" />
        <polygon points="5,65 50,87.5 50,95 5,72.5" fill="#78350f" />
        <polygon points="50,87.5 95,65 95,72.5 50,95" fill="#451a03" />
        <polygon points="15,62.5 50,80 85,62.5 50,45" fill="#d97706" />
        <polygon points="15,62.5 50,80 50,83 15,65.5" fill="#b45309" />
        <polygon points="50,80 85,62.5 85,65.5 50,83" fill="#78350f" />
        <polygon points="25,35 50,47.5 50,75 25,62.5" fill="#ef4444" />
        <polygon points="50,47.5 75,35 75,62.5 50,75" fill="#dc2626" />
        <polygon points="50,22.5 25,35 50,47.5 75,35" fill="#7f1d1d" />
        <polygon points="25,20 50,32.5 50,47.5 25,35" fill="#ef4444" />
        <polygon points="50,32.5 52,31.5 52,46.5 50,47.5" fill="#b91c1c" />
        <polygon points="25,20 50,32.5 52,31.5 27,19" fill="#fca5a5" />
        <polygon points="27,47 31,49 31,56 27,54" fill="#fde047" className="anim-flicker-1" />
        <polygon points="44,55.5 48,57.5 48,64.5 44,62.5" fill="#fde047" className="anim-flicker-2" />
        <polygon points="55,50 60,47.5 60,55 55,57.5" fill="#fde047" className="anim-flicker-1" />
        <polygon points="65,45 70,42.5 70,50 65,52.5" fill="#fde047" className="anim-flicker-2" />
        <polygon points="34,57 42,61 42,71 34,67" fill="#451a03" />
        <polygon points="34,58 37.8,59.9 37.8,68.9 34,67" fill="#f59e0b" className="anim-swing-l" />
        <polygon points="42,61 38.2,59.1 38.2,68.1 42,71" fill="#d97706" className="anim-swing-r" />
        <polygon points="50,60 15,42.5 25,37.5 50,50" fill="#78350f" opacity="0.9" />
        <polygon points="50,60 85,42.5 75,37.5 50,50" fill="#451a03" opacity="0.9" />
        <polygon points="16,61.5 18,60.5 18,41 16,42" fill="#b45309" />
        <polygon points="32,69.5 34,68.5 34,49 32,50" fill="#b45309" />
        <polygon points="66,68.5 68,69.5 68,50 66,49" fill="#92400e" />
        <polygon points="82,60.5 84,61.5 84,42 82,41" fill="#92400e" />
      </g>
    </svg>
  </div>
);

// --- THE FIX: Massive layered drop shadow to simulate extreme altitude
const StartNodeLiving = ({ node }) => {
  let logo = '';
  // CHANGED: Support generic tutorial hub names alongside real city names, matching ID as well
  if (node.name === 'Seattle' || node.name === 'Northern Hub' || node.id == 0) logo = '/gn.svg'; 
  else if (node.name === 'Portland' || node.name === 'Central Hub' || node.id == 1) logo = '/orn.svg'; 
  else if (node.name === 'San Francisco' || node.name === 'Southern Hub' || node.id == 2) logo = '/cpr.svg'; 

  return (
    <div style={{ 
      position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)', 
      width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#111827', 
      border: '3px solid #111827', 
      boxShadow: `
        3px 5px 6px rgba(0, 0, 0, 0.6), 
        12px 20px 15px rgba(0, 0, 0, 0.5), 
        25px 40px 30px rgba(0, 0, 0, 0.4), 
        45px 70px 50px rgba(0, 0, 0, 0.2), 
        inset 2px 4px 5px rgba(255, 255, 255, 0.2), 
        inset -2px -4px 6px rgba(0, 0, 0, 0.6)`, 
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20, pointerEvents: 'none' 
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0px 3px 6px rgba(0,0,0,0.9)', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         <img src={logo} alt={node.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.06)' }} />
      </div>
    </div>
  );
};

const PrivateAssetHTMLMarker = ({ asset, node, companies }) => {
  let hexColor = '#AAAAAA'; 
  if (asset.owner === 'player') hexColor = '#FFD700';
  else if (asset.owner === 'baron') hexColor = '#BF40BF';
  else if (asset.owner && companies[asset.owner]) hexColor = companies[asset.owner].colorStr;

  return (
    <div style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)', width: '100px', height: '100px', pointerEvents: 'none', zIndex: 50 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <circle cx="50" cy="50" r="40" stroke={hexColor} strokeWidth="3" fill="none" />
        <rect x="72" y="25" width="16" height="16" fill={hexColor} />
        <text x="80" y="33" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">{asset.mapLabel}</text>
      </svg>
    </div>
  );
};

export const CostBubblesHTMLOverlay = ({ connections, nodes, activeNetwork, companies, showOnlyRailheads, showLinkCosts, zoomScale = 1 }) => {
  const builtConnSet = new Set();
  const activeRailheads = new Set();

  if (companies) {
      Object.values(companies).forEach(c => {
          if (c.builtConnections) c.builtConnections.forEach(str => builtConnSet.add(str));
          if (c.activeLines) c.activeLines.forEach(nId => activeRailheads.add(nId));
      });
  }

  const visibleConns = (connections || []).filter(conn => {
      const fromNode = (nodes || []).find(n => n.id === conn.from);
      const toNode = (nodes || []).find(n => n.id === conn.to);
      if (!fromNode || !toNode) return false;

      const bothRevealed = fromNode.revealed && toNode.revealed;
      const bothVisited = activeNetwork.has(fromNode.id) && activeNetwork.has(toNode.id);
      const isConnectedToRailhead = (activeRailheads.has(fromNode.id) || activeRailheads.has(toNode.id)) && bothRevealed;
      const shouldDraw = showOnlyRailheads ? (isConnectedToRailhead && !bothVisited) : false;

      if (shouldDraw) {
          const connStr1 = `${fromNode.id}-${toNode.id}`;
          const connStr2 = `${toNode.id}-${fromNode.id}`;
          const isBuilt = builtConnSet.has(connStr1) || builtConnSet.has(connStr2);
          return !isBuilt;
      }
      return false;
  });

  const bubbleData = React.useMemo(() => {
      if (showLinkCosts === 0) return [];
      
      const placed = [];
      return visibleConns.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          let units = 2;
          let textStr = "";
          
          if (window.game && typeof window.game.calculateUnits === 'function') {
              units = window.game.calculateUnits(fromNode.id, toNode.id);
              if (showLinkCosts === 1 && typeof window.game.getSegmentCostBreakdown === 'function') {
                  const b = window.game.getSegmentCostBreakdown(null, fromNode.id, toNode.id);
                  textStr = `$${b.total}`;
              } else {
                  textStr = `${units}`;
              }
          }
          
          let t = 0.5;
          let bx = fromNode.x + (toNode.x - fromNode.x) * t;
          let by = fromNode.y + (toNode.y - fromNode.y) * t;

          const collision = placed.find(p => Math.sqrt(Math.pow(p.x - bx, 2) + Math.pow(p.y - by, 2)) < 30);
          if (collision) {
              t = collision.t === 0.35 ? 0.65 : 0.35;
              bx = fromNode.x + (toNode.x - fromNode.x) * t;
              by = fromNode.y + (toNode.y - fromNode.y) * t;
          }
          
          placed.push({ x: bx, y: by, t: t });
          return { conn, bx, by, units, textStr };
      });
  }, [visibleConns, nodes, showLinkCosts]);

  if (showLinkCosts === 0 || bubbleData.length === 0) return null;

  const visualScale = zoomScale > 1 ? 1 + (zoomScale - 1) * 0.15 : zoomScale;
  const compensationScale = visualScale / zoomScale;

  return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000 }}>
          {bubbleData.map((data, idx) => {
              const isHighCost = data.units >= 4; 
              const borderColor = isHighCost ? '#ff4444' : (data.units === 3 ? '#bae6fd' : '#0ea5e9');
              const width = showLinkCosts === 1 ? '44px' : '24px';
              const borderRadius = showLinkCosts === 1 ? '12px' : '50%';
              return (
                  <div key={idx} style={{ 
                      position: 'absolute', 
                      left: data.bx, 
                      top: data.by, 
                      transform: `translate(-50%, -50%) scale(${compensationScale})`,
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      border: `2px solid ${borderColor}`,
                      borderRadius: borderRadius,
                      width: width,
                      height: '24px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: isHighCost ? '#ff4444' : '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxShadow: '0px 2px 4px rgba(0,0,0,0.6)'
                  }}>
                      {data.textStr}
                  </div>
              );
          })}
      </div>
  );
};

export const HTMLOverlayLayer = ({ nodes, privateCompanies, companies, height = 800, cleanMap, relevantNodes }) => {
  if (!nodes) return null;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 5200, height: height, pointerEvents: 'none', zIndex: 3 }}>
      <SharedMapAnimations />
      {nodes.map(node => {
        const isStartNode = node.type === 'start';
        if (!node.revealed && !isStartNode) return null;
        if (cleanMap && !relevantNodes.has(node.id) && !isStartNode) return null;

        if (isStartNode) return <StartNodeLiving key={node.id} node={node} />;
        if (node.subType === 'standard' || node.subType === 'mountain' || (node.type === 'city' && !node.subType)) return <StandardCityLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'fed_exchange') return <FedExchangeLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'parlor') return <ParlorLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'signal') return <SignalTowerLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'supply') return <TrainDepotLiving key={node.id} x={node.x} y={node.y} />; 
        if (node.subType === 'union_yard') return <UnionYardLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'merger') return <MergerPantheonLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'regional_hq') return <RegionalHQLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'financial') return <FinancialHubLiving key={node.id} x={node.x} y={node.y} />;
        if (node.subType === 'boomtown') return <BoomtownSaloon key={node.id} x={node.x} y={node.y} />;
        return null;
      })}
      {Object.values(privateCompanies || {}).map(asset => {
         const node = nodes.find(n => n.id === asset.railheadId);
         if (!node || !node.revealed) return null;
         if (cleanMap && !relevantNodes.has(node.id) && node.type !== 'start') return null;
         return <PrivateAssetHTMLMarker key={`asset-${asset.id}`} asset={asset} node={node} companies={companies} />;
      })}
    </div>
  );
};

export const DevGridOverlay = ({ width, height }) => {
  const step = 100;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const labels = [];
  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      labels.push(<text key={`${x}-${y}`} x={x * step + 4} y={y * step + 14} fill="#0ea5e9" fontSize="12" fontFamily="monospace" style={{ textShadow: '1px 1px 2px #000' }}>{x * step},{y * step}</text>);
    }
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: width, height: height, zIndex: 9999, pointerEvents: 'none', opacity: 0.6 }}>
      <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs><pattern id="dev-grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="#0ea5e9" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dev-grid-pattern)" />
        {labels}
      </svg>
    </div>
  );
};