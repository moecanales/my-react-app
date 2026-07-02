// TutorialManager.js

class TutorialManager {
    constructor(game) {
        this.game = game;
        this.storyboard = (typeof TUTORIAL_STORYBOARD !== 'undefined') ? TUTORIAL_STORYBOARD.storyboard : [];
        this.currentStepIndex = 0;
        this.isActive = false;
        this.stepStartTime = 0;
        this.isTransitioning = false; // NEW: The Vault Lock to prevent double-skipping
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
        this.isTransitioning = false;
        
        // --- NEW: KILLS THE IPO PHASE SO TUTORIAL CAN RUN ---
        this.game.inIPOPhase = false; 
        
        // FIX: Top Controls hiding logic removed so they remain visible for Option B Topography
        
        this.game.gridCols = 6;
        this.game.gridRows = 9;
        
        // --- NEW TASK 6: Patch Step 0 to point to BOTH correct UI elements ---
        if (this.storyboard.length > 0) {
            this.storyboard[0].focusUI = ['player-cash-pill', 'player-networth-pill'];
        }

        // --- NEW FIX: RIGGED DECK FOR OPTION 1 ---
        // We override the native refill engine so it pulls the exact tutorial sequence 
        // without TutorialManager having to brutally overwrite the belt state mid-animation.
        this.riggedDraws = [
            { type: 'blue', label: 'I' }, { type: 'red', label: 'C' }, 
            { type: 'red', label: 'B' }, { type: 'red', label: 'A' }, 
            { type: 'red', label: 'D' }, { type: 'red', label: 'E' }, 
            { type: 'red', label: 'F' }, { type: 'red', label: 'G' }
        ];
        
        if (!this.game.abacus._originalRefillBelt) {
            this.game.abacus._originalRefillBelt = this.game.abacus.refillBelt;
        }
        
        this.game.abacus.refillBelt = () => {
            while (this.game.abacus.belt.length < 5 && this.riggedDraws.length > 0) {
                const nextCard = this.riggedDraws.shift();
                this.game.abacus.belt.push({
                    type: nextCard.type,
                    label: nextCard.label,
                    level: 1,
                    id: `tut-rigged-${nextCard.type}-${nextCard.label}-${Date.now()}-${Math.random()}`
                });
            }
            if (this.game.abacus.belt.length < 5) {
                this.game.abacus._originalRefillBelt.call(this.game.abacus);
            }
        };

        // --- NEW FIX: UNIVERSAL MATH OVERRIDE ---
        // The React UI uses physical distance via calculateUnits() for hover targets, ignoring the JSON. 
        // We temporarily hijack the native math to force the UI to read our JSON overrides.
        if (!this.game._originalCalculateUnits) {
            this.game._originalCalculateUnits = this.game.calculateUnits;
        }
        this.game.calculateUnits = (fromId, toId) => {
            const conn = this.game.connections.find(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
            if (conn && conn.units !== undefined) return conn.units;
            return this.game._originalCalculateUnits.call(this.game, fromId, toId);
        };
        
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
                compData.maxShares = compData.maxShares ?? 5;
                compData.playerShares = compData.playerShares ?? 0;
                compData.baronShares = compData.baronShares ?? 0;

                comp.treasury = compData.treasury;
                comp.trackSegments = compData.track;
                comp.stockIndex = Math.max(0, CONFIG.marketTrack.indexOf(compData.price));
                comp.income = compData.income;

                this.game.playerShares[gameKey] = compData.playerShares;
                this.game.baron.shares[gameKey] = compData.baronShares;
                
                // --- THE VOID SHARE BYPASS ---
                // React UI guards against maxShares=0 by defaulting to 1 (preventing divide-by-zero).
                // If it is truly 0, we give it 1 max share and 1 ghost issued share to trick the UI math (1-1=0).
                if (compData.maxShares === 0) {
                    comp.maxShares = 1;
                    comp.sharesIssued = 1;
                } else {
                    comp.maxShares = compData.maxShares;
                    comp.sharesIssued = compData.playerShares + compData.baronShares;
                }

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

        // 4. OVERRIDE BELT (STEP 0 ONLY)
        // The "Split Brain" fix: We only load the scripted belt on the first step.
        // For all subsequent steps, the native engine handles the belt natively, 
        // completely eliminating React key collisions and visual flashing.
        if (this.currentStepIndex === 0) {
            this.game.abacus.belt = [];
            const reversedTypes = [...stepData.belt].reverse();
            const reversedLabels = [...stepData.beltLabels].reverse();
            
            for (let i = 0; i < reversedTypes.length; i++) {
                if (reversedTypes[i] === 'empty') continue;
                
                let type = reversedTypes[i];
                let label = reversedLabels[i];
                
                if (type === 'green' && label === 'S') label = 'A'; // Sanitize legacy data

                this.game.abacus.belt.push({
                    type: type, 
                    label: label, 
                    level: 1, 
                    id: `tut-card-${type}-${label}-${i}`
                });
            }
        }

        // --- NEW: AUTO-INJECT MISSING SPOTLIGHTS & TRIGGERS ---
        // This dynamically assigns the focusUI arrays for all remaining steps so the CSS lock lifts!
        if (!stepData.focusUI) {
            if (stepData.trigger.type === 'onStockBought') {
                const targetComp = idMap[stepData.trigger.target] || stepData.trigger.target;
                stepData.focusUI = [`company-card-${targetComp}`];
            } else if (stepData.trigger.type === 'onNodeBuilt' || stepData.trigger.type === 'onBuildIntercepted') {
                // Infer the active company based on the tutorial phase
                let targetComp = 'bo'; // Great Northern
                if (stepData.id >= 9 && stepData.id <= 11) targetComp = 'prr'; // Central Pacific
                if (stepData.id >= 12 && stepData.id <= 15) targetComp = 'nyc'; // OR&N
                stepData.focusUI = [`company-card-${targetComp}`];
            }
        }

        // --- NEW: AUTO-ARM ACTIVE COMPANY FOR BUILD STEPS ---
        // This ensures the player is never caught unarmed when a tutorial step expects a map click.
        if (stepData.trigger && (stepData.trigger.type === 'onNodeBuilt' || stepData.trigger.type === 'onBuildIntercepted')) {
            let activeComp = 'bo'; // Great Northern
            if (stepData.id >= 9 && stepData.id <= 11) activeComp = 'prr'; // Central Pacific
            if (stepData.id >= 12 && stepData.id <= 15) activeComp = 'nyc'; // OR&N
            
            this.game.activeCompanyForBuild = activeComp;
        } else {
            // Safely disarm if the step is just dialogue, buying stock, or ending the year
            this.game.activeCompanyForBuild = null;
        }

        setTimeout(() => { if (this.game.renderer) this.game.renderer.snapToStartNodes(); }, 100);

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
        console.log(`[DIAGNOSTIC - Tutorial Intercept] Action: ${actionType}, Target: ${targetId}`);
        if (!this.isActive) return true;
        
        const currentTrigger = this.storyboard[this.currentStepIndex].trigger;

        // CRITICAL BUG FIX: The UI requests permission first, locking the door. 1.45s later, the Engine 
        // requests permission. We MUST give the Engine's delayed request a VIP pass through the lock!
        if (this.isTransitioning) {
            if (actionType === 'buildTrack' && currentTrigger.type === 'onNodeBuilt') {
                return true; // Let the engine finish what the UI started
            }
            return false; 
        }

        let mappedTriggerType = '';
        if (actionType === 'buyStock') mappedTriggerType = 'onStockBought';
        if (actionType === 'buildTrack') mappedTriggerType = 'onNodeBuilt';
        if (actionType === 'endYear') mappedTriggerType = 'onEndYear'; 
        if (actionType === 'swapCards') mappedTriggerType = 'onCardsSwapped'; 

        let target = currentTrigger.target;
        const idMap = { 'gn': 'bo', 'orn': 'nyc', 'cp': 'prr' };
        if (idMap[target]) target = idMap[target];

        // --- NEW: THE THEATRICAL INTERCEPTOR ---
        if (actionType === 'buildTrack' && currentTrigger.type === 'onBuildIntercepted' && target === targetId.toString()) {
            
            // Forcefully cancel the active build mode so the UI resets
            this.game.activeCompanyForBuild = null;
            if (this.game.renderer && this.game.renderer.canvas) {
                this.game.renderer.canvas.style.cursor = 'default';
            }
            
            // THE ASSASSIN: The native game engine opens the "Establish Rail Service" modal 
            // synchronously during this click event. We use tiny timeouts to slam it shut 
            // the exact millisecond after the engine finishes opening it.
            if (this.game.ui) {
                this.game.ui.closeModal();
                setTimeout(() => { if (this.game.ui) this.game.ui.closeModal(); }, 10);
                setTimeout(() => { if (this.game.ui) this.game.ui.closeModal(); }, 50); // Double-tap to be certain
            }
            
            if (this.game.onStateChanged) this.game.onStateChanged();

            this.isTransitioning = true;
            setTimeout(() => {
                this.isTransitioning = false;
                this.advance();
            }, 250); // Short delay for dramatic effect
            
            return false; // IMPORTANT: Return false to block the engine from actually building the track!
        }

        if (currentTrigger.type === mappedTriggerType && target === targetId.toString()) {
            if (this.game.ui) this.game.ui.closeModal(); 
            
            // LOCK THE ENGINE DOWN
            this.isTransitioning = true;
            
            // --- THE ALTERNATE UNIVERSE BRANCH ---
            // If this is a track build, we skip the blind timer completely. 
            // We wait patiently for the React animation in App.jsx to tell us it is finished.
            if (actionType === 'buildTrack') {
                return true; 
            }
            
            setTimeout(() => {
                this.isTransitioning = false; // RELEASE THE LOCK
                this.advance(); 
            }, 600); 
            return true; 
        }

        if (actionType === 'buildTrack') {
            // STRICT TUTORIAL RAILS FOR STEP 4.5
            const stepId = this.storyboard[this.currentStepIndex].id;
            if (stepId === 4.5 || stepId === '4.5') {
                // Enforce that 'Legacy Plate' (A) was swapped into the consumption slot (index 0)
                if (!this.game.abacus.belt[0] || this.game.abacus.belt[0].label !== 'A') {
                    if (this.game.audio) this.game.audio.playError();
                    return false; // Block the build
                }
            }

            // --- NEW: THE DELAYED NATIVE VIP PASS ---
            // The React UI takes ~1.5s to animate cards before natively calling buildTrack.
            // If the user's browser is slow, advance() might fire and lock the game BEFORE 
            // the native engine finishes. This grants a VIP pass to the delayed native execution.
            const prevStep = this.currentStepIndex > 0 ? this.storyboard[this.currentStepIndex - 1] : null;
            if (prevStep && prevStep.trigger.type === 'onNodeBuilt' && targetId.toString() === prevStep.trigger.target) {
                return true; 
            }

            // Block wrong node clicks during an intercept phase
            if (currentTrigger.type === 'onBuildIntercepted' && target !== targetId.toString()) {
                if (this.game.audio) this.game.audio.playError();
                console.error("[DIAGNOSTIC - REJECTED] Blocked by onBuildIntercepted check.");
                return false;
            }

            if (currentTrigger.type === 'onNodeBuilt' && target !== targetId.toString()) {
                if (this.game.audio) this.game.audio.playError();
                console.error(`[DIAGNOSTIC - REJECTED] Wrong node clicked. Expected ${target}, got ${targetId}`);
                return false;
            }
            if (this.currentLocks.buildTrack) {
                if (this.game.audio) this.game.audio.playError();
                console.error("[DIAGNOSTIC - REJECTED] Blocked by currentLocks.buildTrack.");
                return false;
            }
        }

        if (actionType === 'buyStock') {
            // STRICT TUTORIAL RAILS: Block unscripted stock purchases
            if (currentTrigger.type === 'onStockBought' && target !== targetId.toString()) {
                if (this.game.audio) this.game.audio.playError();
                console.error(`[DIAGNOSTIC - REJECTED] Wrong stock clicked. Expected ${target}, got ${targetId}`);
                return false;
            }
            
            if (this.currentLocks.buyStock) {
                if (this.game.audio) this.game.audio.playError();
                return false;
            }
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

        // Just in case advance() gets called from a CONTINUE button double-click, lock it out
        if (this.isTransitioning && this.currentStepIndex !== 0) return;
        this.isTransitioning = false; // Reset the state safely

        if (this.game.audio) this.game.audio.stopVoiceover();
        
        this.currentStepIndex++;
        if (this.currentStepIndex < this.storyboard.length) {
            this.loadStep(this.storyboard[this.currentStepIndex]);
        } else {
            this.end();
        }
    }

    advanceFromReact() {
        // --- ALTERNATE UNIVERSE ---
        // This is the direct hook triggered from App.jsx's animation loop.
        if (!this.isActive) return;
        this.isTransitioning = false; // Explicitly drop the vault lock
        this.advance();
    }

    end() {
        try {
            // 1. Instantly stop audio
            if (this.game && this.game.audio && typeof this.game.audio.stopVoiceover === 'function') {
                this.game.audio.stopVoiceover();
            }
            
            // PERMANENT LOCK
            this.isTransitioning = true; 

            // 2. Hide the tutorial modal
            const wrapper = document.getElementById('tutorial-modal-wrapper');
            if (wrapper) wrapper.style.display = 'none';

            // 3. THROW THE REACT CURTAIN
            // Instantly tell React to cover the screen with the completely opaque Cinematic Boot Sequence
            try {
                const uiTarget = window.game?.ui || this.game?.ui;
                if (uiTarget && typeof uiTarget.triggerCinematicBoot === 'function') {
                    uiTarget.triggerCinematicBoot();
                }
            } catch (bridgeErr) {
                console.error("React cinematic boot execution failed:", bridgeErr);
            }

            // 4. SECRET ENGINE REBUILD
            // With the screen perfectly hidden by the React component, we silently rebuild the engine
            setTimeout(() => {
                this.isActive = false;
                if (this.game) this.game.tutorial = null;
                if (window.game) window.game.tutorial = null;

                const targetGame = this.game || window.game;
                if (targetGame) {
                    delete targetGame.gridCols;
                    delete targetGame.gridRows;
                    
                    // --- CRITICAL CRASH FIX: RESTORE, DON'T JUST DELETE ---
                    if (targetGame._originalCalculateUnits) {
                        targetGame.calculateUnits = targetGame._originalCalculateUnits;
                        delete targetGame._originalCalculateUnits;
                    }
                    if (targetGame.abacus && targetGame.abacus._originalRefillBelt) {
                        targetGame.abacus.refillBelt = targetGame.abacus._originalRefillBelt;
                        delete targetGame.abacus._originalRefillBelt;
                    }
                    
                    // --- THE AIRLOCK PROTOCOL ---
                    // 1. Sever the React Bridge
                    const cachedSync = targetGame.onStateChanged;
                    targetGame.onStateChanged = null;

                    try {
                        // 2. The Silent Scrub
                        if (typeof targetGame.softReset === 'function') {
                            targetGame.softReset();
                        }
                    } catch (resetErr) {
                        console.error("Native softReset execution failed:", resetErr);
                    }

                    // 3. State Sanitization
                    targetGame.inIPOPhase = false;
                    targetGame.eventQueue = [];
                    
                    // 4. Reconnect and Sync
                    targetGame.onStateChanged = cachedSync;
                    if (typeof targetGame.onStateChanged === 'function') {
                        targetGame.onStateChanged();
                    }
                }

                // Native DOM Cleanup & Interval Scrubber (Fixes hidden Start Menu bugs)
                try {
                    document.body.classList.remove('tut-strict-lock', 'tut-reading-mode', 'tut-highlight-stats'); 
                    const els = document.querySelectorAll('.tutorial-spotlight, .tutorial-spotlight-silver, .tutorial-glow-minor');
                    for (let i = 0; i < els.length; i++) {
                        els[i].classList.remove('tutorial-spotlight', 'tutorial-spotlight-silver', 'tutorial-glow-minor');
                    }
                    
                    let attempts = 0;
                    const scrubber = setInterval(() => {
                        const startOverlay = document.getElementById('start-modal-overlay');
                        if (startOverlay) {
                            startOverlay.classList.remove('hidden');
                            clearInterval(scrubber);
                        }
                        attempts++;
                        if (attempts > 20) clearInterval(scrubber); 
                    }, 100);
                } catch (domErr) {}

            }, 500);

        } catch (e) {
            console.error("Critical Error during tutorial cleanup choreography:", e);
        }
    }
}

window.TutorialManager = TutorialManager;