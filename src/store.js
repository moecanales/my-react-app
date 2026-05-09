// store.js
import { create } from 'zustand';
import { toPng } from 'html-to-image';
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

  snap.projectedWealth = typeof gameInstance.getProjectedWealth === 'function' 
      ? gameInstance.getProjectedWealth() 
      : 0;

  snap.tutorial = (gameInstance.tutorial && gameInstance.tutorial.isActive) ? {
      isActive: gameInstance.tutorial.isActive,
      currentStepIndex: gameInstance.tutorial.currentStepIndex,
      stepData: gameInstance.tutorial.storyboard ? gameInstance.tutorial.storyboard[gameInstance.tutorial.currentStepIndex] : null,
      locks: gameInstance.tutorial.currentLocks || {}
  } : null;

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
  startTutorial: () => {
      if (window.game) {
          window.game.inIPOPhase = false;
          
          // Instantiate the tutorial manager using the global reference
          if (window.TutorialManager) {
              window.game.tutorial = new window.TutorialManager(window.game);
          }
          
          // Safely invoke start
          if (window.game.tutorial && typeof window.game.tutorial.start === 'function') {
              window.game.tutorial.start();
              syncState(set);
              set({ showStartMenu: false, showLedger: false, showLiquidation: false });
          } else {
              console.error("TutorialManager failed to load or start is not a function.");
          }
      }
  },
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
    if (gameInstance.tutorial && gameInstance.tutorial.isActive) {
        const allowed = gameInstance.tutorial.handleAction('buyStock', id);
        if (!allowed) return;
    }
    gameInstance.buyShare(id);
    syncState(set);
  },
  
  endTurn: () => {
    if (!gameInstance) return;
    if (gameInstance.tutorial && gameInstance.tutorial.isActive) {
        const allowed = gameInstance.tutorial.handleAction('endYear', '');
        if (!allowed) return;
    }
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
      if (gameInstance.tutorial && gameInstance.tutorial.isActive) {
          const allowed = gameInstance.tutorial.handleAction('swapCards', '');
          if (!allowed) return;
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

    if (gameInstance.tutorial && gameInstance.tutorial.isActive) {
        const allowed = gameInstance.tutorial.handleAction('buildTrack', targetNodeId);
        if (!allowed) return;
    }

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