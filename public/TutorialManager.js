class TutorialManager {
    constructor(game) {
        this.game = game;
        this.storyboard = (typeof TUTORIAL_STORYBOARD !== 'undefined') ? TUTORIAL_STORYBOARD.storyboard : [];
        this.currentStepIndex = 0;
        this.isActive = false;
    }

    start() {
        if (!this.storyboard || this.storyboard.length === 0) {
            console.error("Tutorial Data is missing or corrupted.");
            if (this.game.ui) this.game.ui.spawnFloatingMessage("Tutorial data missing!", "bad");
            this.game.startNewRun();
            return;
        }

        // AUTO-INIT FIX: The user clicking the "Play Tutorial" button counts as a 
        // user gesture, so we safely spin up the audio context right here.
        if (this.game.audio && !this.game.audio.initialized) {
            this.game.audio.init();
        }

        // --- NEW FIX: Forcefully hide the Start Screen Overlay ---
        const startOverlay = document.getElementById('start-modal-overlay');
        if (startOverlay) {
            startOverlay.classList.add('hidden');
        }

        this.isActive = true;
        this.currentStepIndex = 0;
        
        // FIX: Top Controls hiding logic removed so they remain visible for Option B Topography
        
        this.game.gridCols = 6;
        this.game.gridRows = 9;
        
        document.body.classList.add('tut-strict-lock'); // Lock down the UI
        
        this.loadStep(this.storyboard[this.currentStepIndex]);
    }

    applySpotlights() {
        // 1. Clear any existing spotlights and glows
        document.querySelectorAll('.tutorial-spotlight').forEach(el => el.classList.remove('tutorial-spotlight'));
        document.querySelectorAll('.tutorial-glow-minor').forEach(el => el.classList.remove('tutorial-glow-minor'));
        document.body.classList.remove('tut-highlight-stats');
        
        // 2. Apply new targets based on the current step
        const step = this.storyboard[this.currentStepIndex];
        if (step) {
            if (step.focusUI) {
                step.focusUI.forEach(targetId => {
                    const el = document.getElementById(targetId);
                    if (el) el.classList.add('tutorial-spotlight');
                });
            }
            if (step.focusMinor) {
                step.focusMinor.forEach(targetId => {
                    const el = document.getElementById(targetId);
                    if (el) el.classList.add('tutorial-glow-minor');
                });
            }
            if (step.highlightStats) {
                document.body.classList.add('tut-highlight-stats');
            }
        }
    }

    loadStep(stepData) {
        if (!stepData) return;
        console.log(`Loading Tutorial Step: ${stepData.id}`);

        // 1. OVERRIDE LEDGER
        this.game.year = stepData.ledger.year;
        this.game.playerCash = stepData.ledger.playerCash;
        this.game.baron.cash = stepData.ledger.baronCash;

        // 2. MAP OVERRIDE & FOG OF WAR
        const CELL_W = this.game.customSettings?.cellWidth || 100;
        const CELL_H = 60;
        const OFFSET = 50;
        stepData.nodes.forEach(n => {
            if (n.x === undefined) n.x = OFFSET + (n.c * CELL_W);
            if (n.y === undefined) n.y = OFFSET + (n.r * CELL_H);
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
            // HACK REMOVED: Step 16 logic was stripped out so the clickNext trigger remains intact.
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
        this.game.ui.update();
        this.game.renderer.resize();
        this.game.renderer.draw();
        this.game.renderer.renderSteelBoard();
        this.showDialogue(stepData.dialogue, stepData.trigger);
        this.applySpotlights(); // NEW: Trigger the visual highlights
    }

    showDialogue(text, trigger) {
        let overlay = document.getElementById('tutorial-center-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tutorial-center-modal';
            document.body.appendChild(overlay);
        }

        // NEW: Toggle CSS Reading Mode based on trigger type
        if (trigger.type === 'clickNext') {
            document.body.classList.add('tut-reading-mode');
        } else {
            document.body.classList.remove('tut-reading-mode');
        }

        const isIntro = (this.currentStepIndex === 0);

        let nextBtnHTML = '';
        if (trigger.type === 'clickNext') {
            const btnText = (this.currentStepIndex === this.storyboard.length - 1) ? 'GOT IT (Return to Menu)' : 'CONTINUE';
            nextBtnHTML = `<button class="smart-btn tutorial-highlight" onclick="game.tutorial.advance()" style="background:var(--accent-gold); color:black; font-size:1.0em; padding:10px; margin-top:15px; border: 2px solid #fff;">${btnText}</button>`;
        } else {
            nextBtnHTML = `<button class="smart-btn" onclick="if(game.audio) game.audio.stopVoiceover(); document.getElementById('tutorial-center-modal').classList.add('hidden')" style="background:#333; color:#fff; border-color:#555; padding:10px; font-size:1.0em; margin-top:15px;">GOT IT (Close to play)</button>`;
        }

        // 30% Smaller, always centered using flexbox.
        let boxStyles = "margin: 0 auto; position: relative; width: 90%; max-width: 420px; padding: 20px;";

        // NEW: Dynamic Play/Pause Button for Voiceover
        let voiceBtnState = (this.game.audio && this.game.audio.isVoicePaused) ? "▶️ Play Voice" : "⏸️ Pause Voice";
        let voiceBtnHTML = `<button id="tut-voice-btn" onclick="if(game.audio) { const isPaused = game.audio.toggleVoicePause(); this.innerText = isPaused ? '▶️ Play Voice' : '⏸️ Pause Voice'; }" style="position:absolute; top:10px; right:10px; background:transparent; border:1px solid #555; color:#aaa; cursor:pointer; font-size:0.75em; padding:4px 8px; border-radius:4px; z-index:100; transition:all 0.2s;" onmouseover="this.style.color='#fff'; this.style.borderColor='#fff'" onmouseout="this.style.color='#aaa'; this.style.borderColor='#555'">${voiceBtnState}</button>`;

        overlay.innerHTML = `
            <div class="tutorial-dialogue-box" style="background:#16213e; border:3px solid var(--accent-gold); text-align:center; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.8); pointer-events: auto; ${boxStyles}">
                ${voiceBtnHTML}
                <div class="tutorial-baron-avatar" style="width:75px; height:75px; margin:-55px auto 10px auto; background:#0f3460; border:2px solid var(--accent-gold); border-radius:50%; overflow:hidden; display:flex; justify-content:center; align-items:center; box-shadow:0 5px 15px rgba(0,0,0,0.5);">
                    <canvas id="tutorial-baron-canvas" width="65" height="65"></canvas>
                </div>
                <div style="font-weight:900; color:var(--baron-color); margin-bottom:8px; font-size:1.0em; letter-spacing:2px;">THE BARON SAYS:</div>
                <div style="font-size:0.95em; color:#ddd; line-height:1.5; text-align:left; border-top:1px solid #444; padding-top:12px;">${text}</div>
                ${nextBtnHTML}
            </div>
        `;
        
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '9500';
        
        // ALLOW BACKGROUND SCROLLING
        overlay.style.pointerEvents = 'none';
        
        // Centering
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        // Dim logic
        if (isIntro) {
            overlay.style.background = 'rgba(0, 0, 0, 0.1)'; 
        } else {
            overlay.style.background = 'transparent'; 
        }
        
        if (this.game.audio) {
            const currentSceneId = this.storyboard[this.currentStepIndex].id;
            this.game.audio.playVoiceover(currentSceneId);
        }

        overlay.classList.remove('hidden');

        setTimeout(() => {
            const canvas = document.getElementById('tutorial-baron-canvas');
            if (canvas && this.game.baronAnimator) {
                const ctx = canvas.getContext('2d');
                // Scaled down the drawing size to 0.45 to match the new 65x65 canvas
                this.game.baronAnimator.drawCharacter(canvas, ctx, 32, 43, Date.now() / 1000, 'normal', 0.45);
            }
        }, 50);
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
                    this.game.ui.spawnFloatingMessage("The Baron told you to swap the cards first! Put Legacy Plate in the right-most slot.", "bad");
                    if (this.game.audio) this.game.audio.playError();
                    return false; // Block the build
                }
            }
            // --- END NEW ---

            if (currentTrigger.type === 'onNodeBuilt' && target !== targetId.toString()) {
                this.game.ui.spawnFloatingMessage("Wrong location. Look for the pulsing gold ring.", "bad");
                if (this.game.audio) this.game.audio.playError();
                return false;
            }
            if (this.currentLocks.buildTrack) {
                this.game.ui.spawnFloatingMessage("Focus on the task at hand.", "bad");
                if (this.game.audio) this.game.audio.playError();
                return false;
            }
        }

        if (actionType === 'buyStock' && this.currentLocks.buyStock) {
            this.game.ui.spawnFloatingMessage("The Baron forbids this action right now.", "bad");
            if (this.game.audio) this.game.audio.playError();
            return false;
        }
        
        if (actionType === 'endYear' && this.currentLocks.endYear) {
            this.game.ui.spawnFloatingMessage("You must complete your actions first.", "bad");
            if (this.game.audio) this.game.audio.playError();
            return false;
        }

        return true; 
    }

    advance() {
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
            document.querySelectorAll('.tutorial-glow-minor').forEach(el => el.classList.remove('tutorial-glow-minor'));

            // 3. Remove Overlays
            document.getElementById('tutorial-center-modal')?.remove();
            document.getElementById('tutorial-hard-blocker')?.remove(); 
            
            // 4. Restore UI
            const topControls = document.querySelector('.top-bar-controls');
            if (topControls) topControls.style.display = 'flex';
            
            if (this.game.ui) this.game.ui.spawnFloatingMessage("TUTORIAL COMPLETE. Good luck.", "good");
            
            // 5. Execute Seamless Hard Reload
            window.location.reload(); 
        } catch (e) {
            console.error("Critical Error during tutorial cleanup:", e);
            window.location.reload(); // Absolute fallback
        }
    }
}