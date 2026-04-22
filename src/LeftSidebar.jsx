import React, { useState } from 'react';
import { useGameStore } from './App';
import PlayerPanel from './PlayerPanel'; 
import BaronPanel from './BaronPanel';
import { TestCharter } from './TestCharter';
import { CharterORN } from './CharterORN';
import { CharterCP } from './CharterCP';

const MARKET_TRACK = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225, 250, 275, 300, 350, 400, 450, 500];

// React-friendly SVG Components (HARDCODED WIDTH/HEIGHT TO PREVENT FLEXBOX EXPLOSIONS)
const TrackIcon = ({ fill = "#EF4444", width = "20", height = "16", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.981 28.83" width={width} height={height} style={{ overflow: 'visible', flexShrink: 0, display: 'block', ...style }}>
    <path fill={fill} d="M31.747,5.213l-0.605-3.205h-1.621L29.196,0h-4.936l0.146,2.008H13.58L13.808,0H8.872L8.466,2.008H6.175l-0.774,3.205h2.417L7.337,7.594H4.826L4.05,10.798h2.637L6.207,13.18H3.475l-0.775,3.205h2.86l-0.481,2.381H2.125L1.35,21.969h3.082L3.948,24.35H0.773L0,27.555h3.301L3.044,28.83h7.48l0.146-1.274h15.607l0.094,1.274h7.481l-0.205-1.274h2.333l-0.607-3.205H33.13l-0.385-2.381h2.178l-0.606-3.204h-2.089l-0.385-2.381h2.021l-0.607-3.205h-1.932l-0.384-2.382h1.866l-0.608-3.204h-1.774l-0.386-2.381H31.747z M26.044,24.35H11.037l0.27-2.381h14.563L26.044,24.35z M25.636,18.765H11.672l0.271-2.381H25.46L25.636,18.765z M25.226,13.18H12.307l0.271-2.382h12.473L25.226,13.18z M24.816,7.594H12.942l0.272-2.381h11.428L24.816,7.594z"/>
  </svg>
);

const TreasureIcon = ({ fill = "#EF4444", width = "24", height = "18", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.141 94.201" width={width} height={height} style={{ overflow: 'visible', flexShrink: 0, display: 'block', ...style }}>
    <g>
      <path fill={fill} d="M82.039,51.274c-1.516-2.241-3.66-4.495-6.567-6.873c-0.008-0.009-4.34-3.464-4.34-3.464 c-0.374-0.292-0.717-0.559-1.043-0.809V21.864c0.067,0.017,0.146,0.032,0.212,0.051l-0.006,0.024 c1.794,0.484,3.155,1.313,4.158,2.535c1.043,1.305,1.82,2.706,2.301,4.153c0.481,1.483,0.789,2.817,0.904,3.958l0.186,1.766 l0.094,0.942h0.951h1.594h1.055v-1.052V19.548h-2.104l0.204-0.588l-0.006,0.004l-0.228,0.288c0,0-0.003,0.181-0.003,0.287 c-0.018,0.064-0.028,0.125-0.043,0.203c-0.08,0.262-0.181,0.547-0.31,0.874c-0.108,0.244-0.268,0.478-0.464,0.674 c-0.106,0.102-0.203,0.158-0.399,0.158c-0.106,0-0.298-0.035-0.641-0.216c-1.452-0.923-3.142-1.662-5.027-2.197 c-0.709-0.179-1.522-0.35-2.428-0.52v-4.607v-1.051h-1.056h-3.649h-1.053v1.051v4.349c-4.17,0.312-7.543,1.612-10.009,3.897 c-2.905,2.638-4.415,6.54-4.479,11.574c0,2.092,0.357,3.996,1.063,5.681c0.682,1.657,1.615,3.161,2.849,4.577 c1.129,1.344,2.436,2.634,3.976,3.947l0.756,0.655c0.622,0.538,1.255,1.093,1.9,1.627c1.36,1.105,2.68,2.226,3.943,3.345v18.028 c-0.344-0.076-0.651-0.141-0.896-0.199l-0.115-0.021h-0.113c-0.601-0.172-1.159-0.371-1.652-0.594 c-1.587-0.807-2.858-1.966-3.846-3.524c-1.077-1.688-1.831-3.306-2.305-4.944c-0.5-1.7-0.829-3.178-0.979-4.403 c-0.101-0.696-0.159-1.174-0.199-1.5c-0.018-0.151-0.03-0.241-0.039-0.324v-0.981c0-0.035-1.054-0.035-1.054-0.035h-1.686 h-1.052v1.05v18.036v1.05h1.052c0.462,0,0.955-0.315,1.059-0.9c0.03-0.111,0.063-0.246,0.091-0.422 c0.071-0.266,0.184-0.655,0.358-1.135c0.136-0.345,0.327-0.661,0.57-0.933c0.12-0.123,0.253-0.179,0.467-0.179 c0.112,0,0.216,0.018,0.335,0.073c-0.052-0.021,0.344,0.173,0.344,0.173c2.369,1.006,4.655,1.837,7.029,2.545 c0.842,0.233,1.702,0.409,2.63,0.538v4.599v1.047h1.053h3.649h1.056v-1.047v-4.505c2.341-0.202,4.489-0.755,6.392-1.642 c2.516-1.158,4.514-2.875,5.936-5.11c1.431-2.2,2.157-4.94,2.157-8.119v-0.653C84.445,56.397,83.59,53.629,82.039,51.274z M70.088,59.085c0.806,0.9,1.513,1.769,2.104,2.618c1.223,1.743,1.883,3.418,1.963,4.978c-0.002-0.053-0.002,0.286-0.002,0.286 c0,1.123-0.216,2.013-0.645,2.633c-0.43,0.629-0.976,1.088-1.665,1.398c-0.547,0.286-1.121,0.474-1.755,0.597V59.085z M63.835,34.624c-1.731-1.779-2.778-3.775-3.121-5.93l-0.086-1.207c0.007-0.947,0.217-1.926,0.649-2.913 c0.385-0.894,0.993-1.628,1.864-2.257c0.344-0.241,0.745-0.431,1.188-0.568v13.377C64.159,34.954,63.993,34.787,63.835,34.624z"/>
      <path fill={fill} d="M122.985,38.562h-4.088c-2.45-9.047-8.536-17.128-17.428-23.111l1.546-11.895 c0.158-1.226-0.421-2.441-1.481-3.095c-1.062-0.645-2.407-0.614-3.433,0.091L86.603,8.429C80.626,6.585,74.334,5.642,67.87,5.642 c-28.811,0-52.248,18.799-52.248,41.903c0,0.967,0.048,1.934,0.133,2.89c-0.665,0.499-1.353,0.986-2.068,1.422 c-3.441,2.107-5.685,2.324-9.121-2.163c-2.927-3.817,0.292-7.221,0.67-7.597L2.78,39.593c-2.054,2.002-4.904,7.137-1,12.236 c4.183,5.455,8.289,6.36,13.735,3.016c0.272-0.162,0.54-0.341,0.805-0.514c2.146,10.46,9.185,19.973,19.79,26.49v10.221 c0,1.749,1.417,3.159,3.158,3.159h14.762c1.742,0,3.158-1.41,3.158-3.159v-2.48c3.51,0.585,7.091,0.883,10.683,0.883 c2.729,0,5.469-0.187,8.188-0.532v2.13c0,1.749,1.414,3.159,3.156,3.159h14.764c1.74,0,3.157-1.41,3.157-3.159v-8.781 c9.276-5.032,16.272-12.277,19.985-20.714h5.864c1.742,0,3.156-1.413,3.156-3.158V41.712 C126.141,39.974,124.727,38.562,122.985,38.562z M122.985,58.389h-7.986c-3.39,9.192-10.981,16.974-21.021,21.958v10.695H79.214 v-5.804c-3.643,0.679-7.439,1.053-11.345,1.053c-4.811,0-9.448-0.556-13.841-1.57v6.321H39.267V79.02 c-12.403-7.027-20.489-18.504-20.489-31.475c0-21.404,21.978-38.744,49.092-38.744c6.831,0,13.338,1.102,19.251,3.092 l12.761-8.741l-1.797,13.87c9.647,5.96,16.405,14.699,18.317,24.689h6.583V58.389z"/>
    </g>
  </svg>
);

const BuyStockIcon = ({ fill = "#EF4444", width = "16", height = "14", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 285.881 228.96" width={width} height={height} style={{ overflow: 'visible', flexShrink: 0, display: 'block', ...style }}>
    <path fill={fill} d="M285.881,92.487L245.904,0l-92.479,39.956l57.494,5.133l-34.531,85.479l-42.173-40.351l-38.997,82.07 l-38.993-38.547L0,212.633l20.853,16.327l34.455-61.667l51.241,53.049l33.555-80.253l46.256,41.714l52.115-126.577L285.881,92.487 z"/>
  </svg>
);

const LeftSidebar = () => {
  const gameState = useGameStore(state => state.gameState);
  const buyShare = useGameStore(state => state.buyShare);
  
  // Layout & Zoom States
  const [zoomLevel, setZoomLevel] = useState(0.87); // Shrunk to 87%
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  
  // Panel Expand/Collapse States - ALL DEFAULT TO CLOSED (MINIMIZED)
  const [isPanelsExpanded, setIsPanelsExpanded] = useState(false);
  const [isBNOExpanded, setIsBNOExpanded] = useState(false); 
  const [isNYCExpanded, setIsNYCExpanded] = useState(false); 
  const [isPRExpanded, setIsPRExpanded] = useState(false);   

  // Error States for the mini pill buttons
  const [errorBuildBNO, setErrorBuildBNO] = useState(false);
  const [errorBuyBNO, setErrorBuyBNO] = useState(false);
  const [errorBuildNYC, setErrorBuildNYC] = useState(false);
  const [errorBuyNYC, setErrorBuyNYC] = useState(false);
  const [errorBuildPRR, setErrorBuildPRR] = useState(false);
  const [errorBuyPRR, setErrorBuyPRR] = useState(false);

  if (!gameState) return null;

  // Zoom Handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.05, 1.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.05, 0.6));
  const handleZoomReset = () => setZoomLevel(0.87);

  const playerCash = gameState.playerCash || 0;
  const playerNetWorth = gameState.playerNetWorth || 0;
  const baronNetWorth = gameState.baronNetWorth || 0;

  // Track the active fast build state
  const activeBuildComp = gameState.activeCompanyForBuild;

  // Safe Data Extraction & Validation for Pills
  const getCompData = (id) => {
    const comp = gameState.companies?.[id] || {};
    const track = comp.trackSegments || 0;
    const cash = comp.treasury || 0;
    
    // We safely map to the TopBar prices
    const stockIndex = comp.stockIndex || 0;
    const sharePrice = MARKET_TRACK[stockIndex] || 15;
    const maxShares = comp.maxShares || 1;
    const sharesIssued = comp.sharesIssued || 0;
    const availableShares = maxShares - sharesIssued;
    const canBuy = playerCash >= sharePrice && availableShares > 0;

    return { cash, track, sharePrice, availableShares, canBuy };
  };

  const bo = getCompData('bo');
  const nyc = getCompData('nyc');
  const prr = getCompData('prr');

  // Generic Handlers for the mini pill actions
  const handleMiniBuild = (e, compId, trackCount, setError) => {
    e.stopPropagation(); 
    if (trackCount <= 0 && activeBuildComp !== compId) {
      if (window.game && window.game.audio) window.game.audio.playError();
      setError(true);
      setTimeout(() => setError(false), 300);
      return;
    }
    // This acts as a toggle. 
    if (window.game) window.game.startBuildMode(compId);
  };

  const handleMiniBuy = (e, compId, canBuy, setError) => {
    e.stopPropagation();
    if (!canBuy) {
      if (window.game && window.game.audio) window.game.audio.playError();
      setError(true);
      setTimeout(() => setError(false), 300);
      return;
    }
    if (gameState.activeCompanyForBuild === compId && window.game) {
      window.game.startBuildMode(compId); // Toggles off active build mode before purchasing
    }
    buyShare(compId);
  };

  // DYNAMIC HEIGHT MATH: Calculates exact pixel height of the container to prevent scrolling bleed bugs.
  let dynamicHeight = 16; 
  dynamicHeight += isPanelsExpanded ? 315 : 172; 
  dynamicHeight += 8; 
  dynamicHeight += isBNOExpanded ? 145 : 52; 
  dynamicHeight += 8; 
  dynamicHeight += isNYCExpanded ? 145 : 52; 
  dynamicHeight += 8; 
  dynamicHeight += isPRExpanded ? 145 : 52; 
  dynamicHeight += 20; 

  return (
    <div style={{ 
      gridArea: '2 / 1 / 3 / 2', 
      backgroundColor: '#000000', 
      borderRight: '2px solid #333', 
      padding: '0px', 
      height: '100%', 
      overflow: 'auto', 
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      
      <style>
        {`
          .s-panel { background: linear-gradient(145deg, #2a2a30, #1a1a20); box-shadow: inset 0 2px 5px rgba(255,255,255,0.1), 0 5px 15px rgba(0,0,0,0.8); position: relative; }
          .s-btn { font-weight: 900; letter-spacing: 1px; text-transform: uppercase; border-radius: 6px; cursor: pointer; transition: all 0.1s; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); box-shadow: 0 4px 0 rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.3); }
          .s-btn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 0 0 rgba(0,0,0,0.5), inset 0 2px 5px rgba(0,0,0,0.5); }
          .s-btn:disabled { opacity: 0.5; filter: grayscale(100%); cursor: not-allowed; transform: translateY(2px); box-shadow: 0 2px 0 rgba(0,0,0,0.5); }
          
          .zoom-btn { background: #222; border: 1px solid #444; color: #fff; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.2s; box-shadow: inset 0 1px 2px rgba(255,255,255,0.1); padding: 0; }
          .zoom-btn.reset { width: auto; padding: 0 8px; font-size: 10px; letter-spacing: 0.5px; }
          .zoom-btn:hover:not(:disabled) { background: #333; border-color: #666; }
          .zoom-btn:active:not(:disabled) { background: #111; box-shadow: inset 0 2px 4px rgba(0,0,0,0.8); }
          .zoom-btn:disabled { opacity: 0.3; cursor: not-allowed; }

          .zoom-toggle-btn { background: transparent; border: none; color: #555; font-size: 10px; letter-spacing: 1px; cursor: pointer; padding: 4px 0; width: 100%; text-align: center; transition: color 0.2s ease, background 0.2s ease; }
          .zoom-toggle-btn:hover { color: #ccc; background: rgba(255, 255, 255, 0.05); }

          .mini-pill { 
            transition: transform 0.1s ease-out, filter 0.1s ease-out; 
            will-change: transform, filter;
            transform: translateZ(0); 
            backface-visibility: hidden;
          }
          .mini-pill:hover { transform: scale(1.02); filter: brightness(1.1); }
          .mini-pill:active { transform: scale(0.98); }

          .track-action-btn { 
            background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 4px 8px; 
            display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; 
            transition: all 0.1s; will-change: transform; transform: translateZ(0);
          }
          .track-action-btn:hover { background: rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.6); transform: scale(1.05); }
          .track-action-btn:active { transform: scale(0.95); background: rgba(0,0,0,0.8); }
          .track-action-btn.error { background: rgba(255,0,0,0.6); border-color: #ff4444; box-shadow: 0 0 10px #ff4444; transform: scale(0.95); }
          
          /* FAST BUILD GLOW STATE */
          .track-action-btn.active-build {
            background: rgba(250, 204, 21, 0.4); 
            border-color: #facc15; 
            box-shadow: 0 0 12px rgba(250, 204, 21, 0.8), inset 0 0 8px rgba(250, 204, 21, 0.5); 
            transform: scale(1.05);
          }
        `}
      </style>

      {/* Scaled Bounding Box Wrapper with DYNAMIC HEIGHT FIX */}
      <div style={{ 
        marginLeft: '10px',
        marginRight: '20px', 
        width: `${275 * zoomLevel}px`, 
        height: `${dynamicHeight * zoomLevel}px`,
        transition: 'width 0.15s ease-out, height 0.15s ease-out',
        flexShrink: 0 
      }}>
        <div className="s-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          width: '275px',
          margin: '0px', 
          padding: '8px 0',
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'top left',
          background: 'transparent',
          transition: 'transform 0.15s ease-out'
        }}>
          
          {/* --- TOP DYNAMIC AREA: Expanded Panels OR Collapsed Pills --- */}
          {isPanelsExpanded ? (
            <div style={{ position: 'relative', width: '275px', marginBottom: '8px' }}>
              <button 
                onClick={() => setIsPanelsExpanded(false)}
                title="Collapse Panels"
                style={{
                  position: 'absolute', top: '-14px', right: '-14px', zIndex: 50,
                  width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#222',
                  border: '2px solid #8c8c8c', color: '#fff', fontSize: '20px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.8)', paddingBottom: '3px'
                }}
              >−</button>
              <div style={{
                position: 'absolute', top: '-4px', bottom: '-8px', left: '-2px', right: '-8px',
                border: '3px solid #8c8c8c', borderRadius: '16px', backgroundColor: '#282828',
                zIndex: 0, pointerEvents: 'none'
              }}></div>
              <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <PlayerPanel />
                <BaronPanel />
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsPanelsExpanded(true)}
              title="Click to Expand Panels"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', zIndex: 20, marginBottom: '8px' }}
            >
              {/* Player Cash (Gold) */}
              <div className="mini-pill" style={{
                background: 'linear-gradient(to bottom, #dfb127 0%, #9e791b 100%)',
                border: '3px solid #b58b16', borderRadius: '24px', height: '52px',
                display: 'flex', alignItems: 'center', padding: '0 14px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.5)'
              }}>
                <img src="/PLAYER.svg" alt="Player Cash" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.4))' }} />
                <span style={{ marginLeft: 'auto', color: '#ffffff', fontSize: '32px', fontFamily: 'Arial, sans-serif', fontWeight: '900', textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>
                  ${playerCash}
                </span>
              </div>
              {/* Player Net Worth (Silver) */}
              <div className="mini-pill" style={{
                background: 'linear-gradient(to bottom, #f0f0f0 0%, #b3b3b3 100%)',
                border: '3px solid #777', borderRadius: '24px', height: '52px',
                display: 'flex', alignItems: 'center', padding: '0 14px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.8)'
              }}>
                <img src="/PLAYER.svg" alt="Player Net Worth" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.4))' }} />
                <span style={{ marginLeft: 'auto', color: '#facc15', fontSize: '32px', fontFamily: 'Arial, sans-serif', fontWeight: '900', textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>
                  ${playerNetWorth}
                </span>
              </div>
              {/* Baron Net Worth (Purple) */}
              <div className="mini-pill" style={{
                background: 'linear-gradient(to bottom, #8a1991 0%, #4a0d4f 100%)',
                border: '3px solid #5a1060', borderRadius: '24px', height: '52px',
                display: 'flex', alignItems: 'center', padding: '0 14px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)'
              }}>
                <img src="/BARON.svg" alt="Baron Net Worth" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.4))' }} />
                <span style={{ marginLeft: 'auto', color: '#ffffff', fontSize: '32px', fontFamily: 'Arial, sans-serif', fontWeight: '900', textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8)' }}>
                  ${baronNetWorth}
                </span>
              </div>
            </div>
          )}

          {/* --- CHARTER 1 (Green / GN) --- */}
          {isBNOExpanded ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsBNOExpanded(false)} title="Collapse GN" style={{ position: 'absolute', top: '0px', right: '-10px', zIndex: 50, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#222', border: '2px solid #8c8c8c', color: '#fff', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.8)', paddingBottom: '3px' }}>−</button>
              <TestCharter />
            </div>
          ) : (
            <div className="mini-pill" onClick={() => setIsBNOExpanded(true)} style={{ background: 'linear-gradient(to bottom, #39b54a 0%, #1c5e25 100%)', border: '3px solid #0f3d16', borderRadius: '20px', height: '52px', display: 'flex', alignItems: 'center', padding: '0 14px', boxShadow: '0 4px 6px rgba(0,0,0,0.6)', cursor: 'pointer' }}>
              <img src="/gn.svg" alt="GN Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', marginRight: 'auto' }}>
                <TreasureIcon fill="#90ee90" width="24" height="18" style={{ marginRight: '6px', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }} />
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{bo.cash}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className={`track-action-btn ${errorBuyBNO ? 'error' : ''}`}
                  title={`Buy Share ($${bo.sharePrice})`}
                  onClick={(e) => handleMiniBuy(e, 'bo', bo.canBuy, setErrorBuyBNO)}
                  style={{ opacity: bo.canBuy ? 1 : 0.5, cursor: bo.canBuy ? 'pointer' : 'not-allowed' }}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', textDecoration: bo.availableShares === 0 ? 'line-through' : 'none' }}>{bo.availableShares}</span>
                  <BuyStockIcon fill="#90ee90" width="16" height="14" />
                </button>
                <button 
                  className={`track-action-btn ${errorBuildBNO ? 'error' : ''} ${activeBuildComp === 'bo' ? 'active-build' : ''}`}
                  title={activeBuildComp === 'bo' ? 'Fast Build Active' : 'Build Track'}
                  onClick={(e) => handleMiniBuild(e, 'bo', bo.track, setErrorBuildBNO)}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{bo.track}</span>
                  <TrackIcon fill="#90ee90" width="20" height="16" />
                </button>
              </div>
            </div>
          )}

          {/* --- CHARTER 2 (Cyan / ORN) --- */}
          {isNYCExpanded ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsNYCExpanded(false)} title="Collapse ORN" style={{ position: 'absolute', top: '0px', right: '-10px', zIndex: 50, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#222', border: '2px solid #8c8c8c', color: '#fff', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.8)', paddingBottom: '3px' }}>−</button>
              <CharterORN />
            </div>
          ) : (
            <div className="mini-pill" onClick={() => setIsNYCExpanded(true)} style={{ background: 'linear-gradient(to bottom, #32b5cc 0%, #156d7d 100%)', border: '3px solid #0a4652', borderRadius: '20px', height: '52px', display: 'flex', alignItems: 'center', padding: '0 14px', boxShadow: '0 4px 6px rgba(0,0,0,0.6)', cursor: 'pointer' }}>
              <img src="/orn.svg" alt="ORN Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', marginRight: 'auto' }}>
                <TreasureIcon fill="#8cfcff" width="24" height="18" style={{ marginRight: '6px', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }} />
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{nyc.cash}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className={`track-action-btn ${errorBuyNYC ? 'error' : ''}`}
                  title={`Buy Share ($${nyc.sharePrice})`}
                  onClick={(e) => handleMiniBuy(e, 'nyc', nyc.canBuy, setErrorBuyNYC)}
                  style={{ opacity: nyc.canBuy ? 1 : 0.5, cursor: nyc.canBuy ? 'pointer' : 'not-allowed' }}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', textDecoration: nyc.availableShares === 0 ? 'line-through' : 'none' }}>{nyc.availableShares}</span>
                  <BuyStockIcon fill="#8cfcff" width="16" height="14" />
                </button>
                <button 
                  className={`track-action-btn ${errorBuildNYC ? 'error' : ''} ${activeBuildComp === 'nyc' ? 'active-build' : ''}`}
                  title={activeBuildComp === 'nyc' ? 'Fast Build Active' : 'Build Track'}
                  onClick={(e) => handleMiniBuild(e, 'nyc', nyc.track, setErrorBuildNYC)}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{nyc.track}</span>
                  <TrackIcon fill="#8cfcff" width="20" height="16" />
                </button>
              </div>
            </div>
          )}

          {/* --- CHARTER 3 (Red / CPR) --- */}
          {isPRExpanded ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsPRExpanded(false)} title="Collapse CPR" style={{ position: 'absolute', top: '0px', right: '-10px', zIndex: 50, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#222', border: '2px solid #8c8c8c', color: '#fff', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.8)', paddingBottom: '3px' }}>−</button>
              <CharterCP />
            </div>
          ) : (
            <div className="mini-pill" onClick={() => setIsPRExpanded(true)} style={{ background: 'linear-gradient(to bottom, #e31818 0%, #7a0909 100%)', border: '3px solid #4a0303', borderRadius: '20px', height: '52px', display: 'flex', alignItems: 'center', padding: '0 14px', boxShadow: '0 4px 6px rgba(0,0,0,0.6)', cursor: 'pointer' }}>
              <img src="/cpr.svg" alt="CPR Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', marginRight: 'auto' }}>
                <TreasureIcon fill="#ff8c8c" width="24" height="18" style={{ marginRight: '6px', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }} />
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{prr.cash}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className={`track-action-btn ${errorBuyPRR ? 'error' : ''}`}
                  title={`Buy Share ($${prr.sharePrice})`}
                  onClick={(e) => handleMiniBuy(e, 'prr', prr.canBuy, setErrorBuyPRR)}
                  style={{ opacity: prr.canBuy ? 1 : 0.5, cursor: prr.canBuy ? 'pointer' : 'not-allowed' }}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', textDecoration: prr.availableShares === 0 ? 'line-through' : 'none' }}>{prr.availableShares}</span>
                  <BuyStockIcon fill="#ff8c8c" width="16" height="14" />
                </button>
                <button 
                  className={`track-action-btn ${errorBuildPRR ? 'error' : ''} ${activeBuildComp === 'prr' ? 'active-build' : ''}`}
                  title={activeBuildComp === 'prr' ? 'Fast Build Active' : 'Build Track'}
                  onClick={(e) => handleMiniBuild(e, 'prr', prr.track, setErrorBuildPRR)}
                >
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{prr.track}</span>
                  <TrackIcon fill="#ff8c8c" width="20" height="16" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        marginTop: 'auto', 
        minWidth: '100%', 
        backgroundColor: isControlsExpanded ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
        borderTop: isControlsExpanded ? '1px solid #222' : 'none',
        position: 'sticky',
        bottom: 0,
        left: 0, 
        zIndex: 100,
        backdropFilter: isControlsExpanded ? 'blur(4px)' : 'none',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isControlsExpanded && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}>
            <button className="zoom-btn" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>-</button>
            <div style={{ color: '#aaa', fontSize: '12px', width: '36px', textAlign: 'center', fontFamily: 'monospace', userSelect: 'none' }}>
              {Math.round(zoomLevel * 100)}%
            </div>
            <button className="zoom-btn" onClick={handleZoomIn} disabled={zoomLevel >= 1.2}>+</button>
            <button className="zoom-btn reset" onClick={handleZoomReset}>RESET</button>
          </div>
        )}
        <button className="zoom-toggle-btn" onClick={() => setIsControlsExpanded(!isControlsExpanded)}>
          {isControlsExpanded ? '▼ HIDE ZOOM' : '⚙️ ZOOM'}
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;