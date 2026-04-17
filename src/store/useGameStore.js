import { create } from 'zustand';

let gameInstance = null;

// Helper to deeply clone arrays of objects to break memory references for React
const cloneArray = (arr) => arr ? arr.map(c => ({...c})) : [];

const syncState = (set) => {
  if (!gameInstance) return;
  const snap = gameInstance.getSnapshot();
  snap.playerNetWorth = gameInstance.calculateNetWorth();
  snap.baronNetWorth = gameInstance.calculateBaronNetWorth();
  
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
  
  set({ gameState: snap });
};

export const useGameStore = create((set, get) => ({
  gameState: null,
  isReady: false,
  showLedger: false, 
  showAudit: false, 
  showParlorModal: false, 
  showDiscard: false,
  selectedNodeId: null,
  isAnimatingPlay: false,
  animatingCards: [],

  toggleDiscard: () => set(state => ({ showDiscard: !state.showDiscard })),

  initGame: () => {
    if (!gameInstance) {
        gameInstance = new window.Game();
        window.game = gameInstance; 
        
        if (!gameInstance.ui) gameInstance.ui = {};
        
        gameInstance.ui.showParlorModal = () => {
            syncState(set);
            set({ showParlorModal: true });
        };
        
        gameInstance.ui.closeModal = () => {
            syncState(set);
            set({ showParlorModal: false, showLedger: false });
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
    set({ showLedger: true });
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
    
    const state = get();
    const companyId = gameInstance.activeCompanyForBuild;
    
    // If we are actively in Build Track Mode, intercept the click
    if (companyId && gameInstance.companies[companyId]) {
        const comp = gameInstance.companies[companyId];
        const conn = gameInstance.connections.find(c => 
            (comp.activeLines.includes(c.from) && c.to === id) || 
            (comp.activeLines.includes(c.to) && c.from === id)
        );
        
        // Is it a valid connection?
        if (conn) {
            const sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
            const b = gameInstance.getSegmentCostBreakdown(companyId, sourceNodeId, id);
            
            if (comp.treasury >= b.total) {
                // INSTANT BUILD: We have the cash. Skip modals entirely!
                state.executeBuild(companyId, id);
                return;
            }
            // FALLBACK: Not enough money! Let it fall through to open the modal so they can buy shares.
        }
    }
    
    // Default action: Open the Node Actions Modal
    set({ selectedNodeId: id });
  },
  
  closeNodeModal: () => set({ selectedNodeId: null }),

  executeBuild: (companyId, targetNodeId) => {
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
        set({ isAnimatingPlay: true, selectedNodeId: null });

        const cost = b.units;
        const availableCards = gameInstance.abacus.belt;
        const cardsToPlay = [];
        
        for (let i = 0; i < Math.min(cost, availableCards.length); i++) {
            cardsToPlay.push({...availableCards[i]}); 
        }

        const boardEl = document.getElementById('map-container');
        let boardOffset = { left: 0, top: 0, scrollLeft: 0, scrollTop: 0 };
        if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            boardOffset = { left: rect.left, top: rect.top, scrollLeft: boardEl.scrollLeft, scrollTop: boardEl.scrollTop };
        }

        const sourceNode = gameInstance.nodes.find(n => n.id === sourceNodeId);
        const targetNode = gameInstance.nodes.find(n => n.id === targetNodeId);

        // Raw node screen centers
        const sX = sourceNode.x - boardOffset.scrollLeft + boardOffset.left;
        const sY = sourceNode.y - boardOffset.scrollTop + boardOffset.top;
        const eX = targetNode.x - boardOffset.scrollLeft + boardOffset.left;
        const eY = targetNode.y - boardOffset.scrollTop + boardOffset.top;

        const newPlayedCards = cardsToPlay.map((card, idx) => {
            const progress = (idx + 1) / (cost + 1);
            return {
                card,
                stepIndex: idx,
                targetX: sX + (eX - sX) * progress,
                targetY: sY + (eY - sY) * progress
            };
        });

        set({ animatingCards: newPlayedCards });

        setTimeout(() => {
            set(prevState => ({
                animatingCards: prevState.animatingCards.map(c => ({ ...c, isPlunging: true }))
            }));

            setTimeout(() => {
                gameInstance.buildTrack(companyId, targetNodeId);
                syncState(set);
                set({ isAnimatingPlay: false, animatingCards: [] });
            }, 300); 
        }, 1000); 
    }
  },

  rerollParlor: () => {
    window.game.rerollParlor();
    syncState(set);
  },

  completeParlorPurchase: (offer, cost, mode, cardId) => {
    window.game.completeParlorPurchase(offer, 0, mode, cardId);
    syncState(set);
  },

  leaveParlor: () => {
    window.game.parlorOffers = []; 
    if (window.game.ui.closeModal) window.game.ui.closeModal();
    syncState(set);
    set({ showParlorModal: false });
  },

  restartGame: () => {
    if (!gameInstance) return;
    gameInstance.startNewRun();
    if (gameInstance.abacus && gameInstance.abacus.belt.length === 0) {
        gameInstance.abacus.refillBelt();
    }
    syncState(set);
    set({ showLedger: false, showAudit: false, showDiscard: false, showParlorModal: false, selectedNodeId: null });
  }
}));