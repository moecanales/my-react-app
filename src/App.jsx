import React, { useRef, useCallback, useState, useEffect } from 'react';
import { create } from 'zustand';
import { toPng } from 'html-to-image';
import { AllModals } from './Modals';
import GameBoard from './GameBoard';
import ConveyorBelt from './ConveyorBelt';
import LeftSidebar from './LeftSidebar';
import AnimationOverlay from './AnimationOverlay';
import { generateTownLore } from './LoreGenerator';

let gameInstance = null;

const cloneArray = (arr) => arr ? arr.map(c => ({...c})) : [];

const syncState = (set) => {
  if (!gameInstance) return;
  const snap = gameInstance.getSnapshot();
  snap.isMuted = gameInstance.audio ? gameInstance.audio.isMuted : true;
  snap.playerNetWorth = gameInstance.calculateNetWorth();
  snap.baronNetWorth = gameInstance.calculateBaronNetWorth();
  snap.playerShares = gameInstance.playerShares ? { ...gameInstance.playerShares } : {};
  snap.baronShares = gameInstance.baron && gameInstance.baron.shares ? { ...gameInstance.baron.shares } : {};
  snap.privateCompanies = gameInstance.privateCompanies ? JSON.parse(JSON.stringify(gameInstance.privateCompanies)) : {};
  
  if (gameInstance.abacus) {
      snap.abacusState = gameInstance.abacus.getInventoryState();
      
      snap.inventory = {
          green: cloneArray(gameInstance.abacus.inventory?.green),
          blue: cloneArray(gameInstance.abacus.inventory?.blue),
          red: cloneArray(gameInstance.abacus.inventory?.red)
      };
      
      snap.discards = {
          green: cloneArray(gameInstance.abacus.discards?.green),
          blue: cloneArray(gameInstance.abacus.discards?.blue),
          red: cloneArray(gameInstance.abacus.discards?.red)
      };
      
      snap.belt = cloneArray(gameInstance.abacus.belt);
  }
  
  snap.inIPOPhase = gameInstance.inIPOPhase;
  snap.turnLedger = gameInstance.turnLedger;
  snap.currentPackages = gameInstance.currentPackages;
  
  const parlorSource = window.game || gameInstance;
  
  snap.parlorOffers = parlorSource.parlorOffers ? cloneArray(parlorSource.parlorOffers) : [];
  
  snap.parlorRerollCost = typeof parlorSource.getParlorRerollCost === 'function' 
      ? parlorSource.getParlorRerollCost() 
      : (parlorSource.parlorRerollCost || 25);
  
  let projCash = gameInstance.playerCash;
  let baronProjCash = 0;
  Object.keys(gameInstance.companies).forEach(k => {
      const c = gameInstance.companies[k];
      if (!c.isBankrupt) {
          if (c.dividendPolicy === 'full') {
              projCash += Math.ceil(c.income / c.maxShares) * (snap.playerShares[k] || 0);
              baronProjCash += Math.ceil(c.income / c.maxShares) * (snap.baronShares[k] || 0);
          } else if (c.dividendPolicy === 'half') {
              const retained = Math.floor(c.income / 2);
              projCash += Math.ceil((c.income - retained) / c.maxShares) * (snap.playerShares[k] || 0);
              baronProjCash += Math.ceil((c.income - retained) / c.maxShares) * (snap.baronShares[k] || 0);
          }
      }
  });
  Object.values(gameInstance.privateCompanies || {}).forEach(pc => {
      if (pc.owner === 'player') projCash += pc.incomeValue;
      if (pc.owner === 'baron') baronProjCash += pc.incomeValue;
  });
  snap.baronProjectedIncome = baronProjCash;

  // --- NEW: Sync Projected Wealth ---
  snap.projectedWealth = typeof gameInstance.getProjectedWealth === 'function' 
      ? gameInstance.getProjectedWealth() 
      : 0;

  const effectivePrice = Math.max(1, (gameInstance.currentContractPrice || 15) - (gameInstance.priceModifiers?.blue || 0));
  const penaltyPerUnit = effectivePrice + ((gameInstance.contractFailureCount || 0) * 5);
  const blueUnits = gameInstance.abacus?.ledger?.blue || 0;
  const totalPenalty = blueUnits * penaltyPerUnit;

  snap.projectedCash = projCash - totalPenalty;
  snap.isSafe = snap.projectedCash >= 0;
  snap.penaltyPerUnit = penaltyPerUnit;
  snap.totalPenalty = totalPenalty;
  snap.blueUnits = blueUnits;
  snap.currentSeed = gameInstance.currentSeed || "UNKNOWN";
  snap.metaData = gameInstance.metaData || { totalPoints: 0, highScore: 0 };
  
  // eslint-disable-next-line no-undef
  snap.maxTurns = typeof CONFIG !== 'undefined' ? CONFIG.maxTurns : 12;

  set({ gameState: snap });
};

export const useGameStore = create((set, get) => ({
  showStartMenu: true, 
  closeStartMenu: () => set({ showStartMenu: false }),
  gameState: null,
  hoveredTooltip: null,
  isAnimatingPlay: false, 
  animatingCards: [],     
  setHoveredTooltip: (data) => set({ hoveredTooltip: data }),
  showAudioSettings: false,
  toggleAudioSettings: () => set(state => ({ showAudioSettings: !state.showAudioSettings })),
  isMuted: true,
  isReady: false,
  showLedger: false, 
  showAudit: false, 
  showLiquidation: false,
  selectedNodeId: null,
  showGameOver: false,
  gameOverData: null,
  showAssetsModal: false,
  showDiscard: false,
  toggleDiscard: () => set(state => ({ showDiscard: !state.showDiscard })),
  
  showTrashModal: false,
  trashCallback: null,
  trashCount: 0,
  showProxyModal: false,
  proxyCompanyId: null,

  targetedCardIndices: [],
  setTargetedCardIndices: (indices) => set(state => {
      if (state.targetedCardIndices.join(',') === indices.join(',')) return {};
      return { targetedCardIndices: indices };
  }),

  hoveredCardFinancials: [],
  setHoveredCardFinancials: (data) => set(state => {
      if (JSON.stringify(state.hoveredCardFinancials) === JSON.stringify(data)) return {};
      return { hoveredCardFinancials: data };
  }),

  telegramQueue: [],
  queueTelegram: (msg) => set(state => ({ telegramQueue: [...state.telegramQueue, msg] })),
  dequeueTelegram: () => set(state => ({ telegramQueue: state.telegramQueue.slice(1) })),

  toggleAssetsModal: () => set(state => ({ showAssetsModal: !state.showAssetsModal })),
  
  toggleAudio: () => {
      if (window.game) {
          if (!window.game.audio || !window.game.audio.initialized) {
              window.game.audio = window.globalAudioManager || new window.SoundManager();
              window.globalAudioManager = window.game.audio;
          }

          if (window.game.audio && typeof window.game.audio.init === 'function') {
              if (!window.game.audio.initialized) {
                  window.game.audio.init();
              }
              if (window.game.audio.ctx && window.game.audio.ctx.state === 'suspended') {
                  window.game.audio.ctx.resume();
              }

              window.game.audio.isMuted = !window.game.audio.isMuted;

              if (!window.game.audio.isMuted) {
                  if (typeof window.game.audio.playCash === 'function') {
                      window.game.audio.playCash();
                  }
                  if (typeof window.game.audio.toggleThemeLoop === 'function') {
                      window.game.audio.toggleThemeLoop(true);
                  }
              } else {
                  if (typeof window.game.audio.toggleThemeLoop === 'function') {
                      window.game.audio.toggleThemeLoop(false);
                  }
              }

              syncState(set);
          }
      }
  },

  embezzleAsset: (privateId, publicId, price) => {
    if (!window.game) return;
    const success = window.game.embezzlePrivateNetwork(privateId, publicId, price);
    if (success) {
      if (window.game.audio) window.game.audio.playCash();
      syncState(set);
    } else {
      alert("Embezzlement failed. The target company likely cannot afford that price, or it exceeds the absolute maximum.");
    }
  },

  initGame: () => {
    if (!gameInstance) {
        gameInstance = new window.Game();
        window.game = gameInstance; 
        
        if (window.globalAudioManager) {
            gameInstance.audio = window.globalAudioManager;
        }
        
        if (!gameInstance.ui) gameInstance.ui = {};
        gameInstance.ui.showParlorModal = () => { syncState(set); };
        gameInstance.ui.closeModal = () => { 
            syncState(set); 
            setTimeout(() => { if (window.game && window.game.processNextEvent) window.game.processNextEvent(); }, 100);
        };
        gameInstance.ui.showTurnSummary = () => { syncState(set); set({ showLedger: true }); };
        
        gameInstance.ui.showTrashSelector = (callback, count) => { 
            set({ showTrashModal: true, trashCallback: callback, trashCount: count }); 
            syncState(set); 
        };
        gameInstance.ui.showProxyModal = (companyId) => { 
            set({ showProxyModal: true, proxyCompanyId: companyId }); 
            syncState(set); 
        };

        gameInstance.ui.showCharterPurchaseModal = () => { syncState(set); };
        gameInstance.ui.showLiquidationModal = () => { syncState(set); set({ showLiquidation: true }); };

        const origShowGameOver = gameInstance.showGameOver.bind(gameInstance);
        gameInstance.showGameOver = (bScore, pScore, reason) => {
            origShowGameOver(bScore, pScore, reason);
            syncState(set);
            set({ showGameOver: true, gameOverData: { baronScore: bScore, playerScore: pScore, reason } });
        };

        gameInstance.onStateChanged = () => {
            syncState(set);
        };

        gameInstance.startNewRun();
        if (gameInstance.abacus && gameInstance.abacus.belt.length === 0) {
            gameInstance.abacus.refillBelt();
        }
    }
    if (gameInstance) {
      syncState(set);
      set({ isReady: true });
    }
  },

  executeTrashSelection: (selectedIds) => {
      const { trashCallback } = get();
      if (trashCallback) trashCallback(selectedIds);
      set({ showTrashModal: false, trashCallback: null, trashCount: 0 });
      syncState(set);
  },
  executeProxySelection: (choiceId) => {
      const { proxyCompanyId } = get();
      if (window.game && window.game.resolveProxy) {
          window.game.resolveProxy(proxyCompanyId, choiceId);
      }
      set({ showProxyModal: false, proxyCompanyId: null });
      syncState(set);
  },

  applyPackage: (index) => {
    if (!gameInstance) return;
    if (typeof gameInstance.applyPackage === 'function') {
        gameInstance.applyPackage(index);
    } else {
        gameInstance.inIPOPhase = false;
        if (gameInstance.abacus && gameInstance.abacus.belt.length === 0) {
            gameInstance.abacus.refillBelt();
        }
    }
    syncState(set);
  },

  buyShare: (id) => {
    if (!gameInstance) return;
    gameInstance.buyShare(id);
    syncState(set);
  },
  
  endTurn: () => {
    if (!gameInstance) return;
    gameInstance.endTurn();
    syncState(set);
  },
  
  closeLedger: () => set({ showLedger: false }),
  toggleAudit: () => set(state => ({ showAudit: !state.showAudit })), 

  cycleDividendPolicy: (id) => {
    if (!gameInstance) return;
    gameInstance.cycleDividendPolicy(id);
    syncState(set);
  },
  
  swapBeltCards: (indexA, indexB) => {
      if (!gameInstance || !gameInstance.abacus) return;
      const belt = gameInstance.abacus.belt;
      if (belt[indexA].type !== belt[indexB].type) {
          alert("SWAP FAILED: You can only swap cards of the exact same color!");
          return;
      }
      const temp = belt[indexA];
      belt[indexA] = belt[indexB];
      belt[indexB] = temp;
      syncState(set);
  },

  handleNodeClick: (id) => {
    if (!gameInstance) return;
    set({ selectedNodeId: id });
  },
  
  closeNodeModal: () => set({ selectedNodeId: null }),

  executeBuild: async (companyId, targetNodeId) => {
    const state = get();
    if (!gameInstance || state.isAnimatingPlay) return;

    const comp = gameInstance.companies[companyId];
    const conn = gameInstance.connections.find(c => 
        (comp.activeLines.includes(c.from) && c.to === targetNodeId) || 
        (comp.activeLines.includes(c.to) && c.from === targetNodeId)
    );
    if (!conn) return;

    const sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
    const b = gameInstance.getSegmentCostBreakdown(companyId, sourceNodeId, targetNodeId);

    if (comp.treasury >= b.total) {
        set({ isAnimatingPlay: true, selectedNodeId: null, targetedCardIndices: [] });
        get().setHoveredCardFinancials([]);

        const cost = b.units;
        const availableCards = gameInstance.abacus.belt;
        const cardsToPlay = [];
        
        for (let i = 0; i < Math.min(cost, availableCards.length); i++) {
            cardsToPlay.push({...availableCards[i]}); 
        }

        const capturedImages = {};
        for (let i = 0; i < cardsToPlay.length; i++) {
            const cardEl = document.getElementById(`belt-slot-${i}`);
            if (cardEl) {
                try {
                    const dataUrl = await toPng(cardEl, { cacheBust: true, pixelRatio: 2 });
                    capturedImages[i] = dataUrl;
                } catch (err) {
                    console.error("Failed to rasterize card", err);
                    capturedImages[i] = null; 
                }
            }
        }

        const boardEl = document.getElementById('map-container');
        let boardOffset = { left: 0, top: 0, scrollLeft: 0, scrollTop: 0 };
        let currentZoom = 1;

        if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            boardOffset = { left: rect.left, top: rect.top, scrollLeft: boardEl.scrollLeft, scrollTop: boardEl.scrollTop };
            
            const mapLayer = boardEl.querySelector('.map-layer');
            if (mapLayer) {
                const transform = mapLayer.style.transform;
                if (transform) {
                    const match = transform.match(/scale\(([^)]+)\)/);
                    if (match) {
                        currentZoom = parseFloat(match[1]);
                    }
                }
            }
        }

        const sourceNode = gameInstance.nodes.find(n => n.id === sourceNodeId);
        const targetNode = gameInstance.nodes.find(n => n.id === targetNodeId);

        const sX = (sourceNode.x * currentZoom) - boardOffset.scrollLeft + boardOffset.left;
        const sY = (sourceNode.y * currentZoom) - boardOffset.scrollTop + boardOffset.top;
        const eX = (targetNode.x * currentZoom) - boardOffset.scrollLeft + boardOffset.left;
        const eY = (targetNode.y * currentZoom) - boardOffset.scrollTop + boardOffset.top;

        const newPlayedCards = cardsToPlay.map((card, idx) => {
            const progress = (idx + 1) / (cost + 1);
            return {
                card,
                stepIndex: idx,
                targetX: sX + (eX - sX) * progress,
                targetY: sY + (eY - sY) * progress,
                targetZoom: currentZoom, 
                imageUrl: capturedImages[idx] 
            };
        });

        set({ animatingCards: newPlayedCards });

        setTimeout(() => {
            set(prevState => ({
                animatingCards: prevState.animatingCards.map(c => ({ ...c, isPlunging: true }))
            }));

            setTimeout(() => {
                gameInstance.buildTrack(companyId, targetNodeId);
                
                const freshTargetNode = gameInstance.nodes.find(n => n.id === targetNodeId);
                if (!freshTargetNode.hasBeenConnected && freshTargetNode.type !== 'start') {
                    freshTargetNode.hasBeenConnected = true; 
                    const finalLore = generateTownLore(freshTargetNode.name, comp.name, 'connection');
                    freshTargetNode.permanentLore = finalLore; 
                    
                    get().queueTelegram({ 
                        id: Date.now(), 
                        town: freshTargetNode.name, 
                        text: finalLore,
                        color: comp.colorStr
                    });
                }

                syncState(set);
                set({ isAnimatingPlay: false, animatingCards: [] });
            }, 450); 
        }, 1000); 
    }
  },

  rerollParlor: () => {
    if (window.game) window.game.rerollParlor();
    syncState(set);
  },

  completeParlorPurchase: (offer, cost, mode, fallbackId, targetLevel = null) => {
    if (!window.game) return;
    
    let finalMode = mode === 'buy' ? 'new' : mode;
    let targetCardId = fallbackId;

    if (finalMode === 'evolve') {
        const abacus = window.game.abacus;
        if (abacus) {
             const allCards = abacus.getAllCards(offer.type);
             const target = allCards.find(c => 
                 c.label.charAt(0) === offer.label.charAt(0) && 
                 (targetLevel ? c.level === targetLevel : c.level < 3)
             );
             
             if (target) {
                 targetCardId = target.id;
             } else {
                 alert(`You do not have a Level ${targetLevel || "1 or 2"} [${offer.label}] card in your deck to evolve!`);
                 return; 
             }
        }
    }

    window.game.completeParlorPurchase(offer, cost, finalMode, targetCardId);
    syncState(set);
  },

  leaveParlor: () => {
    if (window.game) {
        window.game.parlorOffers = [];
        if (window.game.ui && window.game.ui.closeModal) window.game.ui.closeModal();
    }
    syncState(set);
  },

  restartGame: () => {
    if (!gameInstance) return;
    gameInstance.startNewRun();
    
    if (window.globalAudioManager) {
        window.game.audio = window.globalAudioManager;
    }
    
    if (gameInstance.abacus && gameInstance.abacus.belt.length === 0) {
        gameInstance.abacus.refillBelt();
    }
    syncState(set);
    set({ showLedger: false, showAudit: false, showLiquidation: false, selectedNodeId: null, showGameOver: false, gameOverData: null, showTrashModal: false, showProxyModal: false, telegramQueue: [], targetedCardIndices: [] });
    get().setHoveredCardFinancials([]);
  }
}));

export const getNativeCardInfo = (item) => {
    let data = null;
    const lookup = item.label ? item.label.charAt(0) : 'A';
    const level = item.level || 1;
    try {
        if (item.type === 'green' && typeof GREEN_IDENTITY_DATA !== 'undefined') data = GREEN_IDENTITY_DATA[lookup];
        if (item.type === 'blue' && typeof BLUE_IDENTITY_DATA !== 'undefined') data = BLUE_IDENTITY_DATA[lookup];
        if (item.type === 'red' && typeof RED_IDENTITY_DATA !== 'undefined') data = RED_IDENTITY_DATA[lookup];
    } catch(e) {}

    let name = data ? data.name : `Unit ${lookup}`;
    let desc = data ? (data.levels && data.levels[level] ? data.levels[level] : data.desc) : "Industrial Asset";
    let icon = data ? data.icon : null;
    
    return { name, desc, icon };
};

const WealthTracker = () => {
    const gameState = useGameStore(state => state.gameState);
    if (!gameState) return null;

    const rawWealth = gameState.projectedWealth || 0;

    let bracket = Math.floor(rawWealth / 100) * 100;
    bracket = Math.max(0, Math.min(bracket, 4900));

    const windowWidth = 100; 
    const targetX = bracket + 50; 
    const translateX = (windowWidth / 2) - targetX;

    const isExposed = bracket >= 300;

    const stripItems = [];
    for (let w = 0; w <= 5000; w += 100) {
        const isDanger = w >= 300;
        stripItems.push(
            <div key={w} style={{
                position: 'absolute',
                left: `${w}px`,
                width: '100px',
                height: '100%',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                background: isDanger ? 'rgba(244, 67, 54, 0.15)' : 'rgba(223, 177, 39, 0.1)',
                color: isDanger ? '#F44336' : '#dfb127'
            }}>
                ${w}+
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }} title="PROJECTED WEALTH: Estimates your Net Worth after this year's dividends. If you cross the $300 threshold, you MUST have a higher Net Worth than the Baron at year-end, or face a hostile takeover!">
            
            {/* Left Column: Badge Only */}
            <div style={{
                fontSize: '11px', fontWeight: '900', letterSpacing: '1px', padding: '0 12px', borderRadius: '4px',
                backgroundColor: isExposed ? '#F44336' : '#4CAF50', color: isExposed ? '#fff' : '#000',
                boxShadow: isExposed ? '0 0 10px rgba(244, 67, 54, 0.4)' : '0 0 10px rgba(76, 175, 80, 0.4)',
                display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box'
            }}>
                {isExposed ? 'EXPOSED' : 'PROTECTED'}
            </div>

            {/* Right Column: The Mechanical Window */}
            <div style={{ position: 'relative', width: `${windowWidth}px`, height: '100%', overflow: 'hidden', background: '#000', border: '1px solid #333', borderRadius: '4px', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8)', boxSizing: 'border-box' }}>
                <div style={{ position: 'absolute', height: '100%', width: '5000px', left: 0, top: 0, transform: `translateX(${translateX}px)`, transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    {stripItems}
                </div>
                {/* Top and Bottom Target Pointers */}
                <div style={{ position: 'absolute', left: '50%', top: 0, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #facc15', transform: 'translateX(-50%)', zIndex: 2, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}></div>
                <div style={{ position: 'absolute', left: '50%', bottom: 0, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid #facc15', transform: 'translateX(-50%)', zIndex: 2, filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.5))' }}></div>
                {/* Glossy Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none', zIndex: 3 }}></div>
            </div>
        </div>
    );
};

const TopBar = () => {
  const gameState = useGameStore(state => state.gameState);
  const endTurn = useGameStore(state => state.endTurn);
  const toggleAudioSettings = useGameStore(state => state.toggleAudioSettings);

  if (!gameState) return null;

  const MARKET_TRACK = [
    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 
    110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 
    280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 
    450, 460, 470, 480, 490, 500
  ];
  const targets = ['bo', 'nyc', 'prr'];

  return (
    <div style={{ gridArea: '1 / 1 / 2 / 3', backgroundColor: '#1a1a20', borderBottom: '3px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', zIndex: 10, overflowX: 'hidden', minWidth: 0 }}>

      <div style={{ display: 'flex', overflowX: 'auto', flex: 1, minWidth: 0, gap: '4px', paddingBottom: '4px', paddingTop: '4px' }}>
        {MARKET_TRACK.map((val, index) => {
          const activeComps = targets.filter(id => gameState.companies[id] && gameState.companies[id].stockIndex === index);
          return (
            <div key={index} style={{ width: '40px', height: '45px', flexShrink: 0, backgroundColor: '#111', border: '2px solid #555', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative' }}>
              <div style={{ fontSize: '1em', color: '#aaa', fontWeight: 'bold', marginTop: '4px' }}>{val}</div>
              <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '4px' }}>
                {activeComps.map(id => (
                  <div key={id} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: gameState.companies[id].colorStr || '#fff', border: '1px solid #000', boxShadow: '0 1px 3px rgba(0,0,0,0.9)' }} title={gameState.companies[id].name}></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginLeft: '20px', flexShrink: 0, alignItems: 'center', height: '36px' }}>
        <button 
            onClick={endTurn} 
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(220, 38, 38, 0.5)'; }} 
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'; }} 
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = 'none'; }} 
            style={{ 
                background: 'linear-gradient(to bottom, #ef4444, #dc2626)', 
                color: '#fff', 
                border: '1px solid #b91c1c', 
                padding: '0 24px', 
                height: '100%', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: '900', 
                fontSize: '14px', 
                letterSpacing: '1px', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)', 
                transition: 'all 0.1s ease', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}
        >
            END OF YEAR
        </button>
        <WealthTracker />
      </div>
    </div>
  );
};

const BottomLeftPanel = () => {
  const gameState = useGameStore(state => state.gameState);
  const toggleAudioSettings = useGameStore(state => state.toggleAudioSettings);

  if (!gameState) return null;

  const yearsLeft = Math.max(0, (gameState.maxTurns || 12) - gameState.turn + 1);

  return (
    <div style={{ gridArea: '3 / 1 / 4 / 2', backgroundColor: '#1a1a20', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '4px solid #333', borderRight: '2px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.8em', fontWeight: '900', color: '#555', letterSpacing: '1px', textShadow: '1px 1px 0px #000' }}>TIME LEFT</span>
          <span style={{ fontSize: '2.5em', fontWeight: '900', color: '#fff', textShadow: '2px 2px 4px #000' }}>{yearsLeft}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '5px' }}>
          <span style={{ fontSize: '1.5em', fontWeight: '900', color: '#555', letterSpacing: '1px', textShadow: '1px 1px 0px #000' }}>SEED</span>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#aaa' }}>{gameState.currentSeed}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em', fontWeight: '900', color: '#555', textShadow: '1px 1px 0px #000' }}>SETTINGS</span>
              <div onClick={toggleAudioSettings} style={{ cursor: 'pointer', padding: '2px 8px', background: '#222', borderRadius: '4px', border: '1px solid #444', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  <span style={{ fontSize: '1.6em', color: '#fff', textShadow: '1px 1px 2px #000', lineHeight: 1 }}>☰</span>
              </div>
          </div>
      </div>
    </div>
  );
};

const HudOverlays = () => {
    const gameState = useGameStore(state => state.gameState);
    if (!gameState) return null;

    return (
        <>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100, backgroundColor: '#222', border: '2px solid #64B5F6', borderRadius: '6px', padding: '15px', color: 'white', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                <div style={{ color: '#64B5F6', fontWeight: 'bold', fontSize: '1.1em', borderBottom: '1px solid #444', paddingBottom: '5px', marginBottom: '5px' }}>
                    NEXT PENALTY (BLUE)
                </div>
                <div>Penalty per Unit: <span style={{ color: '#E57373', fontWeight: 'bold' }}>${gameState.penaltyPerUnit}</span></div>
                <div>Unfulfilled Units: <span style={{ fontWeight: 'bold' }}>{gameState.blueUnits}</span></div>
                <div style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px dotted #555', fontSize: '1.1em' }}>
                    Total Risk: <span style={{ color: '#F44336', fontWeight: 'bold' }}>-${gameState.totalPenalty}</span>
                </div>
            </div>
        </>
    );
};

const BaronAvatar = () => {
    const gameState = useGameStore(state => state.gameState);
    const canvasRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (window.game) {
                if (!window.game.baronAnimator || typeof window.game.baronAnimator.startLoop !== 'function') {
                    try {
                        window.game.baronAnimator = new BaronAnimator(window.game);
                    } catch (e) {
                        console.warn("Handshake failed: BaronAnimator not found.", e);
                    }
                }
                
                if (window.game.baronAnimator && canvasRef.current) {
                    window.game.baronAnimator.hudCanvas = canvasRef.current;
                    window.game.baronAnimator.hudCtx = canvasRef.current.getContext('2d');
                    
                    const overlayCanvas = document.getElementById('baron-overlay-canvas');
                    if (overlayCanvas) {
                        window.game.baronAnimator.overlayCanvas = overlayCanvas;
                        window.game.baronAnimator.overlayCtx = overlayCanvas.getContext('2d');
                    }
                    
                    if (typeof window.game.baronAnimator.startLoop === 'function') {
                        window.game.baronAnimator.startLoop();
                    }
                }
            }
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    if (!gameState) return null;

    const isDanger = gameState.playerNetWorth >= 300;

    return (
        <div style={{
            position: 'absolute',
            bottom: '160px', 
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            animation: isDanger ? 'pulseRed 1.5s infinite' : 'none',
            backgroundColor: isDanger ? 'rgba(244, 67, 54, 0.15)' : 'rgba(0,0,0,0)',
            padding: '10px',
            borderRadius: '8px',
            border: isDanger ? '2px solid #F44336' : '2px solid transparent',
            transition: 'all 0.3s ease-in-out'
        }}>
            <style>
                {`
                @keyframes pulseRed {
                    0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.6); }
                    70% { box-shadow: 0 0 15px 15px rgba(244, 67, 54, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
                }
                `}
            </style>
            
            {isDanger && (
                <div style={{ color: '#F44336', fontWeight: 'bold', backgroundColor: '#111', padding: '10px', borderRadius: '4px', border: '1px solid #F44336', textAlign: 'right', textShadow: '1px 1px 2px black' }}>
                    ⚠️ THREAT LEVEL CRITICAL<br/>
                    <span style={{ color: '#fff', fontSize: '0.85em'}}>TAKEOVER IMMINENT</span>
                </div>
            )}

            <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#111',
                border: '3px solid #FFD700',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.8)',
                overflow: 'hidden'
            }}>
                <canvas ref={canvasRef} id="baron-face" width="90" height="90" style={{ display: 'block' }}></canvas>
            </div>
        </div>
    );
};

const BaronOverlay = () => {
    return (
        <div id="baron-overlay" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10002, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <canvas id="baron-overlay-canvas" width="300" height="300"></canvas>
            <div id="baron-overlay-text" style={{ position: 'absolute', top: '70%', color: 'white', fontSize: '3em', fontWeight: 'bold', textShadow: '2px 2px 10px black', textAlign: 'center', width: '100%' }}></div>
        </div>
    );
};

export default function App() {
  const initGame = useGameStore(state => state.initGame);
  const isReady = useGameStore(state => state.isReady);

 useEffect(() => {
    const timer = setTimeout(() => { initGame(); }, 100);
    const handleGlobalMouseMove = (e) => {
        if (window.game) {
            window.game.mouseX = e.clientX;
            window.game.mouseY = e.clientY;
        }
    };

    const handleGlobalInteract = () => {
        if (window.game?.audio?.ctx?.state === 'suspended') {
            window.game.audio.ctx.resume();
        }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('click', handleGlobalInteract);
    window.addEventListener('pointerdown', handleGlobalInteract);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('click', handleGlobalInteract);
        window.removeEventListener('pointerdown', handleGlobalInteract);
    };
  }, [initGame]);

  if (!isReady) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', background: '#1e1e1e' }}><h2>Loading Engine...</h2></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `html, body, #root { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background-color: #1e1e1e; } .hidden { display: none !important; }`}} />
      <AllModals />
      <AnimationOverlay />
      <HudOverlays />
      <BaronAvatar />
      <BaronOverlay /> 
      <div style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', gridTemplateRows: '60px minmax(0, 1fr) 180px', width: '100vw', height: '100vh', backgroundColor: '#111' }}>
        <TopBar />
        <LeftSidebar />
        <GameBoard />
        <BottomLeftPanel />
        <ConveyorBelt />
      </div>
    </>
  );
}