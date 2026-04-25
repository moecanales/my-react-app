// TutorialManager.js
class TutorialManager {
    constructor(game) {
        this.game = game;
        this.storyboard = (typeof TUTORIAL_STORYBOARD !== 'undefined') ? TUTORIAL_STORYBOARD.storyboard : [];
        this.currentStepIndex = 0;
        this.isActive = false;
        this.stepStartTime = 0;
    }

    start() {
        if (!this.storyboard || this.storyboard.length === 0) {
            console.error("Tutorial Data is missing or corrupted.");
            if (this.game.ui) this.game.ui.spawnFloatingMessage("Tutorial data missing!", "bad");
            this.game.startNewRun();
            return;
        }

        // --- NEW: THE ANTI-ANIMATION MUTE ---
        // Prevents the sidebar from visibly animating from sandbox data to tutorial data
        const flashFix = document.createElement('style');
        flashFix.innerHTML = '* { transition: none !important; }';
        document.head.appendChild(flashFix);
        setTimeout(() => flashFix.remove(), 100);

        // AUTO-INIT FIX: The user clicking the "Play Tutorial" button counts as a 
        // user gesture, so we safely spin up the audio context right here.
        if (this.game.audio && !this.game.audio.initialized) {
            this.game.audio.init();
        }

        // --- NEW: Force music to stay off during the tutorial ---
        if (this.game.audio) {
            if (typeof this.game.audio.toggleThemeLoop === 'function') {
                this.game.audio.toggleThemeLoop(false);
            }
            if (typeof this.game.audio.setMusicVolume === 'function') {
                this.game.audio.setMusicVolume(0); // Instantly silences the active buffer
            }
        }

        // --- NEW FIX: Forcefully hide the Start Screen Overlay ---
        const startOverlay = document.getElementById('start-modal-overlay');
        if (startOverlay) {
            startOverlay.classList.add('hidden');
        }

        this.isActive = true;
        this.currentStepIndex = 0;
        
        // --- NEW: KILLS THE IPO PHASE SO TUTORIAL CAN RUN ---
        this.game.inIPOPhase = false; 
        
        // FIX: Top Controls hiding logic removed so they remain visible for Option B Topography
        
        this.game.gridCols = 6;
        this.game.gridRows = 9;
        
        // --- NEW TASK 6: Patch Step 0 to point to BOTH correct UI elements ---
        if (this.storyboard.length > 0) {
            this.storyboard[0].focusUI = ['player-cash-pill', 'player-networth-pill'];
            if (this.storyboard[0].dialogue) {
                this.storyboard[0].dialogue = this.storyboard[0].dialogue.replace("bottom right-hand corner", "top left");
            }
        }
        
        this.loadStep(this.storyboard[this.currentStepIndex]);
    }

    applySpotlights() {
        // Obsolete in React: Handled declaratively via Zustand focusUI state sync.
    }

    loadStep(stepData) {
        if (!stepData) return;

        // --- NEW: Start the Engine Lock Stopwatch for Step 0 ---
        if (this.currentStepIndex === 0) {
            this.stepStartTime = Date.now();
        }

        console.log(`Loading Tutorial Step: ${stepData.id}`);

        // 1. OVERRIDE LEDGER
        this.game.year = stepData.ledger.year;
        this.game.playerCash = stepData.ledger.playerCash;
        this.game.baron.cash = stepData.ledger.baronCash;

        // 2. MAP OVERRIDE & FOG OF WAR
        const CELL_W = this.game.customSettings?.cellWidth || 100;
        const CELL_H = 60;
        
        const OFFSET_X = 250; 
        const OFFSET_Y = 225; 

        stepData.nodes.forEach(n => {
            if (n.x === undefined) n.x = OFFSET_X + (n.c * CELL_W);
            if (n.y === undefined) n.y = OFFSET_Y + (n.r * CELL_H);
            n.revealed = (n.type === 'start');

            if (n.type === 'start') {
                if (n.id === 0 || n.id === '0') n.name = "Northern Hub";
                if (n.id === 1 || n.id === '1') n.name = "Central Hub";
                if (n.id === 2 || n.id === '2') n.name = "Southern Hub";
            }
        });

        this.game.nodes = stepData.nodes;
        this.game.connections = stepData.connections;

        // 3. OVERRIDE COMPANIES, TRANSLATE IDs, & HARDCODE ROUTES (Restores HQ Squares)
        const idMap = { 'gn': 'bo', 'orn': 'nyc', 'cp': 'prr' };
        const startNodeMap = { 'bo': 0, 'nyc': 1, 'prr': 2 };

        Object.keys(stepData.companies).forEach(sceneKey => {
            const gameKey = idMap[sceneKey] || sceneKey; 
            const compData = stepData.companies[sceneKey];
            const comp = this.game.companies[gameKey];

            if (comp) {
                // --- BRUTE FORCE TUTORIAL PATCH V3 ---
                // The raw JSON is missing maxShares, causing NaN math errors in the UI.
                // We forcefully sanitize the data before the engine loads it.
                compData.maxShares = compData.maxShares || 5;
                compData.playerShares = compData.playerShares || 0;
                compData.baronShares = compData.baronShares || 0;

                // Dialogue explicitly states Central Pacific ('prr') has "no shares available"
                if (gameKey === 'prr') {
                    compData.baronShares = compData.maxShares - compData.playerShares;
                }
                // --------------------------------------

                comp.treasury = compData.treasury;
                comp.trackSegments = compData.track;
                comp.stockIndex = Math.max(0, CONFIG.marketTrack.indexOf(compData.price));
                comp.income = compData.income;
                comp.maxShares = compData.maxShares;

                this.game.playerShares[gameKey] = compData.playerShares;
                this.game.baron.shares[gameKey] = compData.baronShares;
                comp.sharesIssued = compData.playerShares + compData.baronShares;

                let startNodeId = startNodeMap[gameKey];
                let active = startNodeId;
                comp.builtNodes = [startNodeId];
                comp.builtConnections = [];

                // HARDCODED MAP ROUTES TO ENSURE OWNERSHIP RAYS & HQ SQUARES RENDER
                if (gameKey === 'bo') { // GN
                    if (stepData.id >= 5) { active = 28; comp.builtNodes.push(28); comp.builtConnections.push("0-28"); }
                    if (stepData.id >= 6) { active = 10; comp.builtNodes.push(10); comp.builtConnections.push("10-28"); }
                    if (stepData.id >= 7.5) { active = 13; comp.builtNodes.push(13); comp.builtConnections.push("10-13"); }
                    if (stepData.id >= 9) { active = 15; comp.builtNodes.push(15); comp.builtConnections.push("13-15"); }
                }
                if (gameKey === 'prr') { // CP
                    if (stepData.id >= 11) { active = 29; comp.builtNodes.push(29); comp.builtConnections.push("2-29"); }
                    if (stepData.id >= 12) { active = 17; comp.builtNodes.push(17); comp.builtConnections.push("17-29"); }
                }
                if (gameKey === 'nyc') { // OR&N
                    if (stepData.id >= 14) { active = 19; comp.builtNodes.push(19); comp.builtConnections.push("1-19"); }
                }

                comp.headNode = active;
                comp.activeLines = [active];
            }
        });

        // 4. OVERRIDE BELT & SANITIZE CORRUPT DATA
        this.game.abacus.belt = [];
        const reversedTypes = [...stepData.belt].reverse();
        const reversedLabels = [...stepData.beltLabels].reverse();
        
        for (let i = 0; i < reversedTypes.length; i++) {
            if (reversedTypes[i] === 'empty') continue;
            
            let type = reversedTypes[i];
            let label = reversedLabels[i];
            
            if (type === 'green' && label === 'S') label = 'A';

            this.game.abacus.belt.push({
                type: type, label: label, level: 1, id: `tut-card-${stepData.id}-${i}`
            });
        }

        // --- NEW: AUTO-INJECT MISSING SPOTLIGHTS & TRIGGERS ---
        // This dynamically assigns the focusUI arrays for all remaining steps so the CSS lock lifts!
        if (!stepData.focusUI) {
            if (stepData.trigger.type === 'onStockBought') {
                const targetComp = idMap[stepData.trigger.target] || stepData.trigger.target;
                stepData.focusUI = [`company-card-${targetComp}`];
            } else if (stepData.trigger.type === 'onNodeBuilt') {
                // Infer the active company based on the tutorial phase
                let targetComp = 'bo'; // Great Northern
                if (stepData.id >= 9 && stepData.id <= 11) targetComp = 'prr'; // Central Pacific
                if (stepData.id >= 12 && stepData.id <= 15) targetComp = 'nyc'; // OR&N
                stepData.focusUI = [`company-card-${targetComp}`];
            }
        }
        // --- END NEW ---

        setTimeout(() => { if (this.game.renderer) this.game.renderer.snapToStartNodes(); }, 100);

        // --- NEW: DISENGAGE BUILD MODE ---
        this.game.activeCompanyForBuild = null;
        if (this.game.renderer && this.game.renderer.canvas) {
            this.game.renderer.canvas.style.cursor = 'default';
        }
        // --- END NEW ---

        this.currentLocks = stepData.locks;
        this.game.revealMap(); // FIXED: Map reveals AFTER tracks are injected
        
        // Safety check before drawing
        if (this.game.renderer) {
            this.game.renderer.resize();
            this.game.renderer.draw();
            this.game.renderer.renderSteelBoard();
        }
        
        this.showDialogue(stepData.dialogue, stepData.trigger);
        this.applySpotlights(); // Obsolete, but left for backward compatibility structure
        
        // --- NEW: SYNC REACT UI ---
        if (this.game.onStateChanged) this.game.onStateChanged();
    }

    showDialogue(text, trigger) {
        // Toggle CSS Reading Mode based on trigger type
        if (trigger.type === 'clickNext') {
            document.body.classList.add('tut-reading-mode');
        } else {
            document.body.classList.remove('tut-reading-mode');
        }

        // Play voiceover
        if (this.game.audio) {
            const currentSceneId = this.storyboard[this.currentStepIndex].id;
            this.game.audio.playVoiceover(currentSceneId);
        }

        // Force the React bridge to sync state and trigger the TutorialOverlay component
        if (this.game.onStateChanged) this.game.onStateChanged();
    }

    handleAction(actionType, targetId) {
        if (!this.isActive) return true;

        const currentTrigger = this.storyboard[this.currentStepIndex].trigger;
        
        let mappedTriggerType = '';
        if (actionType === 'buyStock') mappedTriggerType = 'onStockBought';
        if (actionType === 'buildTrack') mappedTriggerType = 'onNodeBuilt';
        if (actionType === 'endYear') mappedTriggerType = 'onEndYear'; 
        if (actionType === 'swapCards') mappedTriggerType = 'onCardsSwapped'; // NEW: Hook for the belt puzzle

        let target = currentTrigger.target;
        const idMap = { 'gn': 'bo', 'orn': 'nyc', 'cp': 'prr' };
        if (idMap[target]) target = idMap[target];

        if (currentTrigger.type === mappedTriggerType && target === targetId.toString()) {
            if (this.game.ui) this.game.ui.closeModal(); 
            setTimeout(() => this.advance(), 600); 
            return true; 
        }

        if (actionType === 'buildTrack') {
            // --- NEW: STRICT TUTORIAL RAILS FOR STEP 4.5 ---
            // FIX: Ensure we are checking for the specific Build Step ID (4.5) since the array shifted
            const stepId = this.storyboard[this.currentStepIndex].id;
            if (stepId === 4.5 || stepId === '4.5') {
                // Enforce that 'Legacy Plate' (A) was swapped into the consumption slot (index 0)
                if (!this.game.abacus.belt[0] || this.game.abacus.belt[0].label !== 'A') {
                    if (this.game.audio) this.game.audio.playError();
                    return false; // Block the build
                }
            }
            // --- END NEW ---

            if (currentTrigger.type === 'onNodeBuilt' && target !== targetId.toString()) {
                if (this.game.audio) this.game.audio.playError();
                return false;
            }
            if (this.currentLocks.buildTrack) {
                if (this.game.audio) this.game.audio.playError();
                return false;
            }
        }

        if (actionType === 'buyStock' && this.currentLocks.buyStock) {
            if (this.game.audio) this.game.audio.playError();
            return false;
        }
        
        if (actionType === 'endYear' && this.currentLocks.endYear) {
            if (this.game.audio) this.game.audio.playError();
            return false;
        }

        return true; 
    }

    advance() {
        // --- THE ULTIMATE VAULT LOCK ---
        // Completely block advance() during the first 6 seconds of Step 0
        if (this.currentStepIndex === 0) {
            const elapsed = Date.now() - (this.stepStartTime || 0);
            const lockTime = 6000; // 6 seconds

            if (elapsed < lockTime) {
                const timeLeft = Math.ceil((lockTime - elapsed) / 1000);
                // Play buzzer sound
                if (this.game.audio && typeof this.game.audio.playError === 'function') {
                    this.game.audio.playError();
                }
                // Spawn visual feedback
                if (this.game.ui && typeof this.game.ui.spawnFloatingMessage === 'function') {
                    this.game.ui.spawnFloatingMessage(`Listen to the Baron! (${timeLeft}s)`, 'bad');
                }
                console.log(`Tutorial locked. ${timeLeft} seconds remaining.`);
                return; // ABORT THE ADVANCE ENTIRELY
            }
        }

        if (this.game.audio) this.game.audio.stopVoiceover();
        
        this.currentStepIndex++;
        if (this.currentStepIndex < this.storyboard.length) {
            this.loadStep(this.storyboard[this.currentStepIndex]);
        } else {
            this.end();
        }
    }

    end() {
        try {
            if (this.game.audio) this.game.audio.stopVoiceover();
            
            this.isActive = false;
            
            // 1. Scrub CSS Locks
            document.body.classList.remove('tut-strict-lock'); 
            document.body.classList.remove('tut-reading-mode'); 
            document.body.classList.remove('tut-highlight-stats');
            
            // 2. Scrub Spotlights & Glows
            document.querySelectorAll('.tutorial-spotlight').forEach(el => el.classList.remove('tutorial-spotlight'));
            document.querySelectorAll('.tutorial-spotlight-silver').forEach(el => el.classList.remove('tutorial-spotlight-silver'));
            document.querySelectorAll('.tutorial-glow-minor').forEach(el => el.classList.remove('tutorial-glow-minor'));

            // 3. Remove Overlays
            document.getElementById('tutorial-center-modal')?.remove();
            document.getElementById('tutorial-hard-blocker')?.remove(); 
            
            // 4. Restore UI
            const topControls = document.querySelector('.top-bar-controls');
            if (topControls) topControls.style.display = 'flex';
            
            if (this.game.onStateChanged) this.game.onStateChanged();
            
            // 5. Execute Seamless Hard Reload
            window.location.reload(); 
        } catch (e) {
            console.error("Critical Error during tutorial cleanup:", e);
            window.location.reload(); // Absolute fallback
        }
    }
}

// --- NEW: Expose class globally for React/Vite ---
window.TutorialManager = TutorialManager;