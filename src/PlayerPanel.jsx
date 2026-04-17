import React, { useState } from 'react';
import { useGameStore } from './App';
import PlayerBackground from './PlayerBackground';

const PlayerPanel = () => {
  const gameState = useGameStore(state => state.gameState);
  const toggleAssetsModal = useGameStore(state => state.toggleAssetsModal);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  if (!gameState) return null;

  const MARKET_TRACK = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225, 250, 275, 300, 350, 400, 450, 500];

  const gn = gameState.companies?.bo || { maxShares: 6, stockIndex: 4 };
  const orn = gameState.companies?.nyc || { maxShares: 4, stockIndex: 4 };
  const cp = gameState.companies?.prr || { maxShares: 5, stockIndex: 4 };

  const privates = Object.values(gameState.privateCompanies || {});
  const totalPrivates = privates.length || 0;
  const ownedPrivates = privates.filter(p => p.owner === 'player');
  const privateIncome = ownedPrivates.reduce((sum, p) => sum + (p.incomeValue || 0), 0);

  const abacus = gameState.abacusState || {};
  const ledger = abacus.ledger || {};
  
  // Green Deck
  const gNeeded = ledger.green || 0;
  
  // Blue Deck
  const bNeeded = ledger.blue || 0;
  const bCost = Math.max(1, (gameState.currentContractPrice || 15) - (gameState.priceModifiers?.blue || 0));
  
  // Purple (Red) Deck
  const rCount = ledger.redCount || 0;
  const rCycle = rCount % 4;
  const rCost = Math.ceil((rCount + 1) / 4) * 15;

  const belt = gameState.belt || [];
  const gBelt = belt.filter(c => c.type === 'green').length;
  const bBelt = belt.filter(c => c.type === 'blue').length;
  
  const gDeck = Math.max(4, (gameState.inventory?.green?.length || 0) + (gameState.discards?.green?.length || 0) + gBelt);
  const bDeck = Math.max(21, (gameState.inventory?.blue?.length || 0) + (gameState.discards?.blue?.length || 0) + bBelt);

  const extractedTextLayers = [
    { text: "PLAYER", css: { position: "absolute", left: "255.00px", top: "20.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "35px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(0.93, 1.01)", transformOrigin: "top left", whiteSpace: "nowrap", textShadow: "-2px -2px 0 #E3AC1C, 2px -2px 0 #E3AC1C, -2px 2px 0 #E3AC1C, 2px 2px 0 #E3AC1C, 0px 2px 0 #E3AC1C, 2px 0px 0 #E3AC1C, 0px -2px 0 #E3AC1C, -2px 0px 0 #E3AC1C" } },
    { text: `${gameState.playerShares?.bo || 0}/${gn.maxShares}`, css: { position: "absolute", left: "58.00px", top: "105.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "21px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${gameState.playerNetWorth || 0}`, css: { position: "absolute", left: "150.00px", top: "24.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "29px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${gameState.playerCash || 0}`, css: { position: "absolute", left: "150.00px", top: "61.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "29px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${gameState.playerShares?.nyc || 0}/${orn.maxShares}`, css: { position: "absolute", left: "58.00px", top: "130.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${gameState.playerShares?.prr || 0}/${cp.maxShares}`, css: { position: "absolute", left: "58.00px", top: "156.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${ownedPrivates.length}/${totalPrivates}`, css: { position: "absolute", left: "58.00px", top: "180.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: "$0", css: { position: "absolute", left: "135.00px", top: "105.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `$${bCost}`, css: { position: "absolute", left: "135.00px", top: "130.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#E066FF", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `$${rCost}`, css: { position: "absolute", left: "135.00px", top: "156.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#E066FF", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `$${privateIncome}`, css: { position: "absolute", left: "145.00px", top: "180.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#D4A424", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${gNeeded}/${gDeck}`, css: { position: "absolute", left: "200.00px", top: "105.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${bNeeded}/${bDeck}`, css: { position: "absolute", left: "200.00px", top: "130.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } },
    { text: `${rCycle}/4`, css: { position: "absolute", left: "200.00px", top: "156.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "20px", lineHeight: 1, margin: 0, padding: 0, color: "#000000", transform: "scale(1, 1)", transformOrigin: "top left", whiteSpace: "nowrap" } }
  ];

  return (
    <div style={{ width: '275px', height: '145px', position: 'relative', overflow: 'visible', backgroundColor: 'transparent' }}>
      <div style={{
        width: '405.44px',
        height: '212.762px',
        position: 'absolute',
        transform: 'scale(0.678275)',
        transformOrigin: 'top left'
      }}>
        
        {/* Linked Player Logo */}
        <img 
          src="/PLAYER.svg" 
          alt="Player Hat" 
          style={{ filter: 'drop-shadow(6px 6px 8px rgba(0,0,0,0.8))', position: 'absolute', top: 0, left: 0, width: '90px', height: '90px', zIndex: 100 }} 
        />

        {/* SVG Background Component - Moved UP in the stack */}
        <div style={{ position: 'absolute', zIndex: 5, width: '100%', height: '100%' }}>
          <PlayerBackground />
        </div>

        {/* Text Layers Map & Interactive Overlays */}
        <div style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%' }}>
          {extractedTextLayers.map((layer, index) => (
            <div key={index} style={layer.css}>
              {layer.text}
            </div>
          ))}

          {/* Interactive Buttons */}
          <div 
            onMouseEnter={() => setHoveredBtn('stock')} 
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => alert("Player Stock Modal coming soon!")}
            style={{ position: "absolute", left: "285.64px", top: "87.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "27px", lineHeight: 1, color: hoveredBtn === 'stock' ? '#39FF14' : '#000000', transform: "scale(1.1, 1)", transformOrigin: "top left", whiteSpace: "nowrap", cursor: 'pointer' }}>
            Stock
          </div>
          <div 
            onMouseEnter={() => setHoveredBtn('privates')} 
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={toggleAssetsModal}
            style={{ position: "absolute", left: "276.50px", top: "150.00px", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: "27px", lineHeight: 1, color: hoveredBtn === 'privates' ? '#39FF14' : '#000000', transform: "scale(0.93, 1)", transformOrigin: "top left", whiteSpace: "nowrap", cursor: 'pointer' }}>
            Privates
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPanel;