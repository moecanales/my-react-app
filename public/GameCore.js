/**
 * GameCore.js (Decoupled for React/Zustand Bridge)
 * Refactored to remove DOM dependencies, UIManager, and MapRenderer,
 * while retaining 100% of the original business logic, event queues, and math.
 */

class Game {
    constructor() {
        window.Game = this.constructor; // CRITICAL: Exposes class to window for React instantiation
        window.game = this; // Legacy support
        
        this.width = 1200;
        this.height = 700;
        
        this.metaData = this.loadMetaData();
        this.difficultyMultiplier = 1.0;
        this.year = 1;
        this.pointsEarnedThisRun = 0;

        // --- THE SEED STATE ---
        this.currentSeed = "";
        this._prngState = 0;
        
        // --- PERK STAGING ---
        this.nextRunPerks = []; // Store purchased perks here
        
        // --- CONFIG STATE (Decoupled from DOM) ---
        this.customSettings = {
            mapPadding: 22, // Default missing expansion columns
            baronPropertyLimit: 20,
            economyModel: 'B',
            townsitePromotionEnabled: false,
            baronPropertiesEnabled: false,
            speculatorFee: 5,
            cellWidth: 100
        };
        
        this.level = 1;
        this.turn = 1;
        this.targetNetWorth = 300; // Aligned with the $300 Net Worth Takeover rule
        
        // --- STUBBED MODULES FOR REACT COMPATIBILITY ---
        this.audio = { playCash:()=>{}, playError:()=>{}, playBaron:()=>{}, playBuild:()=>{}, playClick:()=>{}, playWin:()=>{}, toggleThemeLoop:()=>{}, init:()=>{} };
        this.baronAnimator = { triggerHUD:()=>{}, triggerOverlay:()=>{} };
        this.tutorial = { isActive: false, handleAction: ()=>true };
        
        // UI & Renderer Stubs to prevent breaking legacy File A logic
        this.ui = { 
            addLog: (msg, type) => console.log(`[LOG - ${type}]: ${msg}`),
            update: () => this._sync(),
            showStartScreen: () => {},
            showTrashSelector: () => {},
            showCharterPurchaseModal: () => {},
            showParlorModal: () => {},
            showProxyModal: () => {},
            closeModal: () => {},
            renderSteelBoard: () => {},
            showStrategyModal: () => {},
            openPerkShop: () => {},
            spawnFloatingMessage: (msg, type) => console.log(`[FLOAT - ${type}]: ${msg}`),
            showNodeActionsModal: () => {},
            showLiquidationModal: () => {},
            refreshLiquidation: () => {},
            showTurnSummary: () => {},
            showModal: () => {},
            getCardInfo: (card) => ({ name: `[${card.label}]` })
        };
        
        this.renderer = {
            resize: () => {},
            startAnimLoop: () => {},
            draw: () => {},
            snapToStartNodes: () => {},
            renderSteelBoard: () => {},
            animations: [],
            canvas: { style: { cursor: 'default' } }
        };

        this.runBonuses = { surveyTeam: 0 }; 
        
        // --- INITIAL STATE ---
        this.playerCash = (typeof CONFIG !== 'undefined' && CONFIG.startCash) ? CONFIG.startCash : 100;
        this.playerShares = { prr: 0, bo: 0, nyc: 0 };
        this.interactedThisTurn = { prr: false, bo: false, nyc: false };
        this.soldThisTurn = { prr: false, bo: false, nyc: false }; 
        this.hasActed = false; 
        this.inIPOPhase = false; 
        this.isGameOver = false; 
        this.currentPackages = []; 
        this.bonuses = { influence: false, taxFreeInventory: 0 };
        this.priceModifiers = { blue: 0, red: 0 }; // Tracks permanent reductions
        this.contractFailureCount = 0; // Tracks consecutive contract failures for scaling penalties

        // --- Parlor State ---
        this.parlorRerollCost = 25; // Lowered starting cost
        this.parlorRerollCount = 0;  
        this.parlorOffers = [];

        // --- EVENT QUEUE (NEW) ---
        this.eventQueue = [];
        this.isResolvingEvents = false;

        // --- Turn Statistics for Financial Report ---
        this.turnStats = {
            laborPaid: 0,
            tollsPaid: 0,
            steelRevenue: 0,
            sourcingCost: 0,
            mountainTax: 0,
            rustTax: 0,
            blueWaiversAvailable: 0 
        };

        this.baron = {
            cash: (typeof CONFIG !== 'undefined' && CONFIG.baronStartCash) ? CONFIG.baronStartCash : 100, 
            debt: 0, 
            shares: { prr: 0, bo: 0, nyc: 0 },
            properties: [], 
            neglect: { prr: 0, bo: 0, nyc: 0 },
            totalKickbacks: 0
        };
        
        // --- FINANCIAL LEDGER STATE ---
        this.turnLedger = { startPlayerCash: this.playerCash, startBaronCash: this.baron.cash, operations: [], boardMeetings: [], settlements: [] };
        
        // --- PRIVATE COMPANIES STATE ---
        this.privateCompanies = {}; 
        
        // --- STEEL ECONOMY STATE ---
        this.abacus = new AbacusEngine(this);
        this.currentContractPrice = 0; 
        this.monthlyContractVolume = 0; 

        // --- CONNECT MODULES ---
        this.mapGen = new MapGenerator(this);
        this.baronAI = new BaronAI(this); // INTEGRATED BARON AI MODULE

        // --- DEBUG SUITE ---
        this.initDebug();

        // Economy Model Selection Defaults (Loaded from Config State)
        this.activeContractModel = this.customSettings.economyModel; 
        this.townsitePromotionEnabled = this.customSettings.townsitePromotionEnabled; 
        this.baronPropertiesEnabled = this.customSettings.baronPropertiesEnabled;   
        this.speculatorFee = this.customSettings.speculatorFee;
        
        // Map Config
        this.customCellWidth = this.customSettings.cellWidth; 

        this.companies = {};
        this.nodes = [];
        this.connections = []; 
        
        this.activeCompanyForBuild = null;
        this.junctionDiscount = false; 
        
        // CONFIG & DEFAULTS
        this.mapPadding = this.customSettings.mapPadding; 
        this.baronPropertyLimit = this.customSettings.baronPropertyLimit; 
        
        // History for Undo
        this.liquidationHistory = [];
        
        this.initCompanies();
        this.calculateMapConfig();
    }

    // --- REACT STATE BRIDGE METHODS ---
    getSnapshot() {
        return {
            playerCash: this.playerCash,
            baronCash: this.baron.cash,
            turn: this.turn,
            year: this.year,
            companies: JSON.parse(JSON.stringify(this.companies)),
            nodes: this.nodes || [],
            connections: this.connections || [],
            activeCompanyForBuild: this.activeCompanyForBuild,
            abacus: {
                belt: this.abacus ? [...this.abacus.belt] : [],
                ledger: this.abacus ? {...this.abacus.ledger} : {}
            },
            isGameOver: this.isGameOver,
            parlorOffers: [...this.parlorOffers],
            eventQueue: [...this.eventQueue],
            turnStats: {...this.turnStats},
            priceModifiers: {...this.priceModifiers},
            currentPackages: [...this.currentPackages],
            inIPOPhase: this.inIPOPhase
        };
    }

    _sync() {
        if (this.onStateChanged) {
            this.onStateChanged(this.getSnapshot());
        }
    }

    // --- SEEDED PRNG SYSTEM ---
    
    seedPRNG(seedStr) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
        }
        h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
        this._prngState = h >>> 0;
    }

    random() {
        let t = this._prngState += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // --- FINANCIAL LEDGER HELPER ---
    recordLedger(category, desc, playerNet, baronNet, details = []) {
        if (!this.turnLedger) {
            this.turnLedger = { startPlayerCash: this.playerCash, startBaronCash: this.baron.cash, operations: [], boardMeetings: [], settlements: [] };
        }
        if (this.turnLedger[category]) {
            this.turnLedger[category].push({ desc, playerNet, baronNet, details });
        }
        this._sync();
    }

    // --- MAP GENERATOR BRIDGE METHODS ---
    calculateMapConfig() { this.mapGen.calculateMapConfig(); }
    getNodeConfig(node) { return this.mapGen.getNodeConfig(node); }
    generateMap() { this.mapGen.generateMap(); }
    revealMap() { this.mapGen.revealMap(); }
    revealNode(id) { this.mapGen.revealNode(id); }

    // --- BARON AI BRIDGE METHODS (DELEGATED TO BaronAI.js) ---
    countNetworkFeatures(companyId, predicateFn, targetNodeId = null) { return this.baronAI.countNetworkFeatures(companyId, predicateFn, targetNodeId); }
    countSharedHubs(companyId, targetNodeId = null) { return this.baronAI.countSharedHubs(companyId, targetNodeId); }
    calculateBaronKickback(cardLabel, companyId, targetNodeId, cardLevel = 1) { return this.baronAI.calculateBaronKickback(cardLabel, companyId, targetNodeId, cardLevel); }
    processBaron() { this.baronAI.processBaron(); }
    performProxyFight(level = 1) { this.baronAI.performProxyFight(level); }

    // --- GENERAL GAME LOGIC ---
    addLog(msg, type) { if (this.ui) this.ui.addLog(msg, type); }

    // --- EVENT QUEUE LOGIC ---
    queueEvent(eventData) {
        this.eventQueue.push(eventData);
        if (!this.isResolvingEvents) {
            this.processNextEvent();
        }
    }

    processNextEvent() {
        if (this.eventQueue.length === 0) {
            this.isResolvingEvents = false;
            this._sync();
            return;
        }

        this.isResolvingEvents = true;
        const nextEvent = this.eventQueue.shift();

        if (nextEvent.type === 'trash') {
            this.ui.showTrashSelector(null, nextEvent.count);
        } else if (nextEvent.type === 'charter') {
            this.ui.showCharterPurchaseModal(nextEvent.level);
        } else if (nextEvent.type === 'parlor') {
            this.triggerParlorEncounter();
        } else if (nextEvent.type === 'proxy') {
            this.ui.showProxyModal(nextEvent.companyId);
        }
        this._sync();
    }

    initDebug() {
        this.debug = {
            triggerParadox: () => {
                this.abacus.ledger.green = 10;
                this.abacus.inventory.green = []; 
                if (this.abacus.discards.green.length === 0) {
                    this.abacus.discards.green = this.abacus._createDeck('green', 4);
                }
                this.ui.update();
                this.ui.addLog("DEBUG: Paradox Ready.", "danger");
            },
            addCash: (amount) => {
                this.playerCash += amount;
                this.ui.update();
                this.ui.addLog(`DEBUG: Added $${amount} cash.`);
            }
        };
        window.game = this;
    }

    loadMetaData() {
        try {
            const data = localStorage.getItem('row_roguelite_save');
            return data ? JSON.parse(data) : { totalPoints: 0, highScore: 0 };
        } catch (e) {
            return { totalPoints: 0, highScore: 0 };
        }
    }

    saveMetaData() {
        try {
            localStorage.setItem('row_roguelite_save', JSON.stringify(this.metaData));
        } catch (e) {
            console.error("Failed to save metadata", e);
        }
    }

    isRustBelt(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        return node && node.c >= this.mapZones.rustStart;
    }

    isMountain(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        return node && node.c >= this.mapZones.mtnStart && node.c <= this.mapZones.mtnEnd;
    }

    getPrivateCompanyCost(baseValue) {
        const tax = this.year === 1 ? 0 : 5 * Math.pow(2, this.year - 1);
        return baseValue + tax;
    }

    embezzlePrivateNetwork(privateId, publicId, priceStr) {
        const price = parseInt(priceStr);
        const pComp = this.privateCompanies[privateId];
        const pubComp = this.companies[publicId];
        
        // Backend Validation: Absolute max is Purchase Price * 2
        const maxAllowed = (pComp.purchasePrice || pComp.baseValue) * 2;
        if (price > maxAllowed) {
            this.addLog(`EMBEZZLEMENT FAILED: Price exceeds absolute maximum of $${maxAllowed}.`, "bad");
            return false;
        }

        if (pubComp.treasury >= price) {
            pubComp.treasury -= price;
            this.playerCash += price;
            pComp.owner = publicId;
            pubComp.activeLines.push(pComp.railheadId);
            pubComp.builtNodes.push(pComp.railheadId); 
            
            this.recordLedger('operations', `Embezzled ${pComp.name} to ${pubComp.short}`, price, 0);

            this.addLog(`EMBEZZLEMENT: Sold ${pComp.name} to ${pubComp.short} for $${price}. New railhead established!`, "good");
            this.ui.update();
            this.renderer.draw();
            this._sync();
            return true;
        }
        return false;
    }

    predictSteelConsumption(units) {
        let virtualBelt = this.abacus.belt.map((c, i) => ({ originalIndex: i, type: c.type }));
        let simLedger = { ...this.abacus.ledger };
        let simInv = {
            green: this.abacus.inventory.green.length + this.abacus.discards.green.length,
            blue: this.abacus.inventory.blue.length + this.abacus.discards.blue.length,
            red: this.abacus.inventory.red.length + this.abacus.discards.red.length
        };

        let highlights = { beltIndices: [], greenDeck: false, blueDeck: false, redDeck: false };

        for (let i = 0; i < units; i++) {
            while (virtualBelt.length < 5) {
                let targetType = 'red';
                const curG = virtualBelt.filter(c => c.type === 'green').length;
                const curB = virtualBelt.filter(c => c.type === 'blue').length;
                
                if (curG < simLedger.green) targetType = 'green';
                else if (curB < simLedger.blue) targetType = 'blue';

                if (simInv[targetType] > 0) {
                    simInv[targetType]--;
                    virtualBelt.push({ originalIndex: -1, type: targetType });
                    highlights[`${targetType}Deck`] = true;
                } else {
                    break; 
                }

                virtualBelt.sort((a, b) => {
                    const p = { 'green': 1, 'blue': 2, 'red': 3 };
                    return p[a.type] - p[b.type];
                });
            }
            
            if (virtualBelt.length > 0) {
                const card = virtualBelt.shift();
                if (card.originalIndex !== -1) highlights.beltIndices.push(card.originalIndex);
                if (card.type === 'green') simLedger.green = Math.max(0, simLedger.green - 1);
                else if (card.type === 'blue') simLedger.blue = Math.max(0, simLedger.blue - 1);
            }
        }
        return highlights;
    }

    calculateSlotPrice(index) {
        if (!this.abacus || !this.abacus.belt || !this.abacus.belt[index]) return 0;
        const card = this.abacus.belt[index];
        
        if (card.type === 'green') return 0;
        
        if (card.type === 'blue') {
            let activeWaivers = this.turnStats.blueWaiversAvailable || 0;
            // Calculate dynamic waivers up to this index
            for (let i = 0; i < index; i++) {
                let c = this.abacus.belt[i];
                let proxy = c.proxy ? c.proxy : c;
                if (c.type === 'blue') activeWaivers--;
                else if (proxy.type === 'green' && proxy.label.charAt(0) === 'C') {
                    activeWaivers += (proxy.level || 1);
                }
            }
            if (activeWaivers > 0) return 0; // Waived
            return Math.max(1, this.currentContractPrice - (this.priceModifiers.blue || 0));
        }
        
        if (card.type === 'red') {
            // Count how many red cards are ahead of this one on the belt
            let redAhead = 0;
            for (let i = 0; i < index; i++) {
                if (this.abacus.belt[i].type === 'red') redAhead++;
            }
            // Add already purchased red steel this turn
            const totalRedInQueue = (this.abacus.ledger.redCount || 0) + redAhead;
            // Every 4 units increases the price bracket by $15
            return Math.ceil((totalRedInQueue + 1) / 4) * 15;
        }
        return 0;
    }

    setProxyCard(type, label, level, companyId) {
        if (this.abacus.belt.length === 0) this.abacus.refillBelt();
        if (this.abacus.belt.length > 0) {
            this.abacus.belt.forEach(c => delete c.proxy);
            this.abacus.belt[0].proxy = { type, label, level };
            this.addLog(`PROXY LOCKED: Next card played overridden by [${type.toUpperCase()} ${label}]!`, "good");
        }
        this.ui.closeModal();
        this.renderer.renderSteelBoard();
        this.ui.update();
        this._sync();
    }

    updateMarketUI() {
        if (this.renderer) {
            this.renderer.renderSteelBoard();
        }
        this._sync();
    }

    consumeSteel(units, companyId = null, targetNodeId = null) {
        let totalCost = 0;
        let sources = [];
        let cardsUsed = []; 
        let baronCut = 0; 

        const builderId = companyId || this.activeCompanyForBuild;
        const builder = builderId ? this.companies[builderId] : null;

        for (let i = 0; i < units; i++) {
            if (this.abacus.belt.length === 0) this.abacus.refillBelt();
            
            const card = this.abacus.consume(0); 
            if (card) {
                cardsUsed.push(card); 
                const costCard = card;
                const effectCard = card.proxy ? card.proxy : card;
                const effectLevel = effectCard.level || 1;
                
                if (costCard.type === 'green') {
                    sources.push("Inventory");
                    this.addLog(`Consumed [GREEN ${costCard.label}] -> FREE`, "neutral");
                } else if (costCard.type === 'blue') {
                    let cost = this.currentContractPrice;
                    if (this.turnStats.blueWaiversAvailable > 0) {
                        this.turnStats.blueWaiversAvailable--; 
                        cost = 0;
                        sources.push("Contract (Waived)");
                        this.addLog(`Consumed [BLUE ${costCard.label}] -> WAIVED (Free)`, "good");
                    } else {
                        cost = Math.max(1, cost - this.priceModifiers.blue);
                        sources.push("Contract");
                        this.addLog(`Consumed [BLUE ${costCard.label}] -> Paid $${cost}`, "neutral");
                    }
                    totalCost += cost;
                } else if (costCard.type === 'red') {
                    // It is always at index 0 when being consumed
                    const effectivePrice = this.calculateSlotPrice(0);
                    totalCost += effectivePrice; 
                    this.baron.cash += effectivePrice;
                    this.baron.totalKickbacks += effectivePrice;
                    baronCut += effectivePrice;
                    sources.push(`Baron ($${effectivePrice})`);
                    this.addLog(`Consumed [MARKET ${costCard.label}] -> Paid Baron $${effectivePrice}`, "bad");
                    
                    // Increment the red tracking ledger for future positional pricing
                    this.abacus.ledger.redCount = (this.abacus.ledger.redCount || 0) + 1;

                    // --- NEW ANIMATOR HOOK ---
                    if (effectivePrice >= 100) this.baronAnimator.triggerOverlay('laugh', `-$${effectivePrice} TO BARON!`);
                    else this.baronAnimator.triggerHUD('laugh');
                }
                
                if (card.proxy) this.addLog(`PROXY ACTIVATED: Executing [${effectCard.type.toUpperCase()} ${effectCard.label}] instead!`, "good");

                if (effectCard.type === 'green') {
                    if (effectCard.label.charAt(0) === 'A') {
                        let validCondition = false;
                        if (builder && builder.activeLines) {
                            validCondition = builder.activeLines.some(id => {
                                const head = this.nodes.find(n => n.id === id);
                                return head && (head.type === 'start' || head.subType === 'union_yard');
                            });
                        }
                        if (validCondition) {
                            const bonus = effectLevel === 3 ? 75 : (effectLevel === 2 ? 50 : 25);
                            this.playerCash += bonus;
                            this.recordLedger('operations', `Legacy Plate Bonus`, bonus, 0);
                            this.addLog(`Activation (Legacy Plate): +$${bonus} to Player Cash.`, "good");
                        }
                    } else if (effectCard.label.charAt(0) === 'B') {
                        const bonus = effectLevel === 3 ? 60 : (effectLevel === 2 ? 30 : 15);
                        if (builder) { builder.treasury += bonus; this.addLog(`Activation (I-Beam): +$${bonus} to ${builder.short} Treasury.`, "good"); }
                    } else if (effectCard.label.charAt(0) === 'C') {
                        this.turnStats.blueWaiversAvailable = (this.turnStats.blueWaiversAvailable || 0) + effectLevel;
                        this.addLog(`Activation (Rebate): Gained ${effectLevel} Blue Waiver(s).`, "good");
                    } else if (effectCard.label.charAt(0) === 'D') {
                        let cityCount = 0;
                        if (builder && builder.builtNodes) {
                            cityCount = builder.builtNodes.filter(nId => {
                                const n = this.nodes.find(node => node.id === nId);
                                return n && n.subType === 'standard';
                            }).length;
                            if (targetNodeId && !builder.builtNodes.includes(targetNodeId)) {
                                const targetN = this.nodes.find(n => n.id === targetNodeId);
                                if (targetN && targetN.subType === 'standard') cityCount++;
                            }
                        }
                        const bonus = (effectLevel === 3 ? 15 : (effectLevel === 2 ? 10 : 5)) * Math.max(0, cityCount);
                        this.playerCash += bonus;
                        this.recordLedger('operations', `Townsite Subsidy (${cityCount} Cities)`, bonus, 0);
                        this.addLog(`Activation (Subsidy): +$${bonus} (${cityCount} Cities) to Player Cash.`, "good");
                    }
                } 
                else if (effectCard.type === 'red') {
                    switch (effectCard.label.charAt(0)) {
                        case 'A': 
                            const purgeCount = effectLevel === 1 ? 1 : (effectLevel === 2 ? 2 : 4);
                            this.addLog(`Activation (Audit Purge): Select ${purgeCount} card(s) to trash!`, "danger"); 
                            this.queueEvent({ type: 'trash', count: purgeCount }); 
                            break;
                        case 'B':
                            const stealAmount = effectLevel === 1 ? 50 : (effectLevel === 2 ? 100 : 200);
                            const actualSteal = Math.min(this.baron.cash, stealAmount);
                            this.baron.cash -= actualSteal; this.playerCash += actualSteal;
                            this.recordLedger('operations', `Industrial Espionage`, actualSteal, -actualSteal);
                            this.addLog(`Activation (Espionage): Stole $${actualSteal} from Baron!`, "good");
                            if (actualSteal >= 100) this.baronAnimator.triggerOverlay('angry', 'THIEF!');
                            else this.baronAnimator.triggerHUD('angry');
                            break;
                        case 'C':
                            this.priceModifiers.blue += (effectLevel === 1 ? 1 : (effectLevel === 2 ? 2 : 4));
                            this.addLog(`Activation (Reform): Contract base price permanently reduced.`, "good"); break;
                        case 'D': 
                            const rails = effectLevel === 1 ? 7 : (effectLevel === 2 ? 14 : 28);
                            if (builder) { builder.trackSegments += rails; this.addLog(`Activation (Integration): +${rails} free track to ${builder.short}.`, "good"); } break;
                        case 'E':
                            if (effectLevel === 1 && builder) { builder.treasury *= 2; this.addLog(`Activation (Panic): ${builder.short} Treasury dynamically doubled!`, "good"); }
                            else if (effectLevel === 2) {
                                if (builder) builder.treasury *= 2;
                                const others = Object.values(this.companies).filter(c => c.id !== builderId);
                                if (others.length > 0) others[0].treasury *= 2;
                                this.addLog(`Activation (Panic Lvl 2): 2 Company Treasuries doubled!`, "good");
                            } else if (effectLevel === 3) {
                                Object.values(this.companies).forEach(c => c.treasury *= 2);
                                this.addLog(`Activation (Panic Lvl 3): ALL Company Treasuries doubled!`, "good");
                            } break;
                        case 'F': 
                            this.performProxyFight(effectLevel); 
                            this.baronAnimator.triggerOverlay('angry', 'MY SHARES!'); 
                            break;
                        case 'G': 
                            this.queueEvent({ type: 'charter', level: effectLevel }); 
                            break;
                    }
                }
                else if (effectCard.type === 'blue') {
                    const labelChar = effectCard.label.charAt(0);
                    if (labelChar === 'O' || labelChar === 'Q' || labelChar === 'S') {
                        let targetCompId = '';
                        if (labelChar === 'O') targetCompId = 'bo'; 
                        if (labelChar === 'Q') targetCompId = 'nyc'; 
                        if (labelChar === 'S') targetCompId = 'prr'; 
                        const targetComp = this.companies[targetCompId];
                        
                        if (effectLevel === 1) {
                            if (targetComp.sharesIssued < targetComp.maxShares) {
                                const price = CONFIG.marketTrack[targetComp.stockIndex];
                                this.baron.shares[targetCompId]++; targetComp.sharesIssued++; targetComp.treasury += price;
                                targetComp.stockIndex = Math.min(CONFIG.marketTrack.length - 1, targetComp.stockIndex + 1);
                                this.addLog(`Activation (${targetComp.short} Acquisition): Baron acquired 1 share for $${price}!`, "bad");
                                if (this.audio) this.audio.playBaron();
                                this.baronAnimator.triggerOverlay('laugh', 'HOSTILE BUY!'); 
                            }
                        } else if (effectLevel === 3) {
                            if (targetComp.sharesIssued < targetComp.maxShares) {
                                const price = CONFIG.marketTrack[targetComp.stockIndex];
                                this.playerShares[targetCompId]++; targetComp.sharesIssued++; targetComp.treasury += price;
                                targetComp.stockIndex = Math.min(CONFIG.marketTrack.length - 1, targetComp.stockIndex + 1);
                                this.addLog(`Hostile Takeover (${targetComp.short}): You gained 1 free share!`, "good");
                                if (this.audio) this.audio.playCash();
                                this.baronAnimator.triggerOverlay('shocked', 'MY ASSETS?!'); 
                            }
                        }
                    } else if (labelChar === 'U') {
                        const unowned = Object.values(this.privateCompanies || {}).filter(pc => !pc.owner);
                        if (effectLevel === 1) {
                            if (unowned.length > 0) {
                                const sorted = unowned.sort((a, b) => b.baseValue - a.baseValue);
                                for (let pc of sorted) {
                                    const cost = this.getPrivateCompanyCost(pc.baseValue);
                                    if (this.baron.cash >= cost) {
                                        this.baron.cash -= cost; pc.owner = 'baron';
                                        pc.purchasePrice = cost; 
                                        this.recordLedger('operations', `Baron Asset Purchase`, 0, -cost);
                                        this.addLog(`Activation (Trust Syndicate): Baron acquired Private Asset [${pc.mapLabel}]!`, "bad");
                                        this.baronAnimator.triggerOverlay('laugh', 'HOSTILE BUY!'); 
                                        break;
                                    }
                                }
                            }
                        } else if (effectLevel === 3) {
                            if (unowned.length > 0) {
                                const randPc = unowned[Math.floor(this.random() * unowned.length)];
                                randPc.owner = 'player';
                                randPc.purchasePrice = this.getPrivateCompanyCost(randPc.baseValue); 
                                this.addLog(`Hostile Takeover (Trust Syndicate): You acquired Private Asset [${randPc.mapLabel}] for FREE!`, "good");
                                this.baronAnimator.triggerOverlay('shocked', 'MY ASSETS?!'); 
                            }
                        }
                    }
                }
                
                if (card.proxy) delete card.proxy;
            }
            if (this.abacus.belt.length === 0) this.abacus.refillBelt();
        }
        
        this.abacus.refillBelt();
        this.updateMarketUI(); 
        this._sync();
        return { cost: totalCost, sources: sources, cards: cardsUsed, baronCut: baronCut };
    }

    initCompanies() {
        if(typeof CONFIG === 'undefined') return;
        CONFIG.companies.forEach(c => {
            this.companies[c.id] = { 
                ...c, treasury: 0, income: 0, sharesIssued: 0, headNode: null, activeLines: [], 
                builtNodes: [], builtConnections: [], revenueStreams: [], grantsClaimed: [], 
                trackSegments: c.startTrack, colorStr: c.color, stockIndex: 4,
                dividendPolicy: 'full', isBankrupt: false
            };
        });
    }

    generateIPOPackages() {
        if(typeof TYCOON_PROFILES === 'undefined' || typeof CONTRACT_MODELS === 'undefined' || typeof STRATEGY_BONUSES === 'undefined') return;
        const profiles = [...TYCOON_PROFILES].sort(() => 0.5 - this.random());
        const contracts = [...CONTRACT_MODELS[this.activeContractModel || 'B']].sort(() => 0.5 - this.random());
        const bonusKeys = Object.keys(STRATEGY_BONUSES).sort(() => 0.5 - this.random());
        
        this.currentPackages = [];
        
        for (let i = 0; i < 3; i++) {
            const tier = contracts[i % contracts.length];
            const vol = Math.floor(this.random() * (tier.maxVol - tier.minVol + 1)) + tier.minVol;
            
            this.currentPackages.push({ 
                profile: profiles[i % profiles.length], contract: { tier: tier, volume: vol }, 
                bonus: STRATEGY_BONUSES[bonusKeys[i % bonusKeys.length]] 
            });
        }
    }
    
    restoreIPO() { this.ui.showStrategyModal(); }
    
    hideIPO() { 
        this.inIPOPhase = false;
        this._sync();
    }

    buyPerk(perkId, cost) {
        if (this.metaData.totalPoints >= cost) {
            this.metaData.totalPoints -= cost; 
            this.saveMetaData(); 
            this.nextRunPerks.push(perkId);
            this.ui.spawnFloatingMessage("PERK ACQUIRED!", "good"); 
            this.ui.openPerkShop(); 
            this.audio.playCash();
            this._sync();
        } else {
            this.ui.spawnFloatingMessage("Not enough points!", "bad"); 
            this.audio.playError();
        }
    }

    applyActivePerks() {
        if (!this.nextRunPerks || this.nextRunPerks.length === 0) return;
        this.nextRunPerks.forEach(p => {
            if (p === 'capital') this.playerCash += 50;
            if (p === 'reserves') this.abacus.ledger.green += 2;
            if (p === 'survey') this.runBonuses.surveyTeam = 1; 
            if (p === 'insider' && this.companies['bo']) { this.playerShares['bo']++; this.companies['bo'].sharesIssued++; }
        });
        this.nextRunPerks = [];
    }

    saveConfigState(newSettings) {
        if (newSettings) {
            this.customSettings = { ...this.customSettings, ...newSettings };
        }
    }

    saveConfigAndStart(newSettings) { this.saveConfigState(newSettings); if (this.ui) this.ui.closeModal(); this.startNewRun(); }
    saveConfigAndClose(newSettings) { this.saveConfigState(newSettings); if (this.ui) { this.ui.closeModal(); this.ui.spawnFloatingMessage("Settings Saved!", "good"); } }

    startDailyRun() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateSeed = `${year}-${month}-${day}`; 
        this.startNewRun(dateSeed);
    }

    startNewRun(userSeed = null) {
        if (!userSeed) userSeed = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        this.currentSeed = userSeed;
        this.seedPRNG(this.currentSeed);
        
        this.mapPadding = this.customSettings.mapPadding;
        this.baronPropertyLimit = this.customSettings.baronPropertyLimit;
        this.activeContractModel = this.customSettings.economyModel;
        this.townsitePromotionEnabled = this.customSettings.townsitePromotionEnabled;
        this.baronPropertiesEnabled = this.customSettings.baronPropertiesEnabled;
        this.customCellWidth = this.customSettings.cellWidth;
        
        this.initialBaronCash = 100; this.initialPlayerCash = 100;
        this.year = 1; this.difficultyMultiplier = 1.0; this.runBonuses = { surveyTeam: 0 }; 
        
        this.restartGame(); 
        this.applyActivePerks();
        this.ui.update();
        this.audio.init();
        this.audio.toggleThemeLoop(true);
        this._sync();
    }

    restartGame() {
        this.level = 1; this.turn = 1; this.targetNetWorth = 300; 
        this.playerCash = this.initialPlayerCash || 100;
        this.playerShares = { prr: 0, bo: 0, nyc: 0 }; 
        this.interactedThisTurn = { prr: false, bo: false, nyc: false };
        this.soldThisTurn = { prr: false, bo: false, nyc: false };
        this.hasActed = false; this.isGameOver = false; this.contractFailureCount = 0;
        
        this.priceModifiers = { blue: 0, red: 0 }; 
        
        this.baron = { cash: this.initialBaronCash || 100, debt: 0, shares: { prr: 0, bo: 0, nyc: 0 }, neglect: { prr: 0, bo: 0, nyc: 0 }, properties: [], totalKickbacks: 0 };
        this.turnLedger = { startPlayerCash: this.playerCash, startBaronCash: this.baron.cash, operations: [], boardMeetings: [], settlements: [] };

        this.abacus = new AbacusEngine(this);
        this.privateCompanies = {}; 
        
        this.initCompanies();
        this.calculateMapConfig();
        this.startLevel();
        this.updateMarketUI(); 
        this._sync();
    }

    softReset() {
        console.log("Executing Bulletproof Soft Reset...");
        try {
            if (this.ui && typeof this.ui.closeModal === 'function') {
                this.ui.closeModal(); 
            }

            this.level = 1;
            this.turn = 1;
            this.year = 1;
            this.targetNetWorth = 300;
            this.playerCash = this.initialPlayerCash || 100;
            this.playerShares = { prr: 0, bo: 0, nyc: 0 };
            this.interactedThisTurn = { prr: false, bo: false, nyc: false };
            this.soldThisTurn = { prr: false, bo: false, nyc: false };
            this.hasActed = false;
            this.isGameOver = false;
            this.contractFailureCount = 0;

            this.priceModifiers = { blue: 0, red: 0 };
            this.baron = { cash: this.initialBaronCash || 100, debt: 0, shares: { prr: 0, bo: 0, nyc: 0 }, neglect: { prr: 0, bo: 0, nyc: 0 }, properties: [], totalKickbacks: 0 };
            this.turnLedger = { startPlayerCash: this.playerCash, startBaronCash: this.baron.cash, operations: [], boardMeetings: [], settlements: [] };

            this.nodes = [];
            this.connections = [];
            this.activeCompanyForBuild = null;

            this.abacus = new AbacusEngine(this); 
            this.privateCompanies = {};
            this.initCompanies();
            this.calculateMapConfig();

            if (this.renderer) {
                this.renderer.animations = [];
                this.renderer.selectedBeltIndex = null;
                this.renderer.predictedHighlights = null;
                this.renderer.resize();
                this.renderer.draw();
                if (this.renderer.canvas) this.renderer.canvas.style.cursor = 'default';
            }
            this.updateMarketUI();

            if (this.ui) {
                this.ui.addLog("System: Market Open...", "neutral");
                this.ui.update(); 
                this.ui.showStartScreen();
            }

            this._sync();
            console.log("Bulletproof Soft Reset Complete.");
        } catch (e) {
            console.error("Critical Error during softReset. Failsafe activated:", e);
        }
    }

    startLevel() {
        this.renderer.resize(); this.generateMap(); this.resetTurnState(false); this.revealMap(); this.renderer.draw(); 
        this.ui.update(); this.renderer.snapToStartNodes();

        this.inIPOPhase = true;
        this.generateIPOPackages();
        setTimeout(() => { this.ui.showStrategyModal(); }, 100);
        this._sync();
    }

    applyPackage(index) {
        const pkg = this.currentPackages[index];
        pkg.profile.apply(this);
        const { high, mid, low } = pkg.profile;
        pkg.bonus.activate(this, high, mid, low);
        
        this.currentContractPrice = pkg.contract.tier.price;
        this.monthlyContractVolume = pkg.contract.volume; 
        this.abacus.ledger.blue = pkg.contract.volume;
        
        this.abacus.resetMonth(); this.abacus.refillBelt(); this.inIPOPhase = false; 
        this.ui.update(); this.audio.playCash();
        this.updateMarketUI(); 
        this._sync();
    }

    resetTurnState(redraw = true) {
        this.turn = 1; this.interactedThisTurn = { prr: false, bo: false, nyc: false }; this.hasActed = false; 
        this.turnStats = { laborPaid: 0, tollsPaid: 0, steelRevenue: 0, sourcingCost: 0, mountainTax: 0, rustTax: 0, blueWaiversAvailable: 0 };
        this.turnLedger = { startPlayerCash: this.playerCash, startBaronCash: this.baron.cash, operations: [], boardMeetings: [], settlements: [] };
        
        const startNodes = this.nodes.filter(n => n.type === 'start');
        if (startNodes.length > 0) {
            Object.keys(this.companies).forEach((k, i) => {
                const comp = this.companies[k];
                comp.headNode = startNodes[i % startNodes.length].id;
                comp.activeLines = [comp.headNode]; comp.builtNodes = [comp.headNode]; comp.builtConnections = []; 
                comp.trackSegments = comp.startTrack; comp.grantsClaimed = []; 
                comp.dividendPolicy = 'full';
            });
            if (redraw) { this.revealMap(); this.renderer.draw(); }
        }
        this._sync();
    }

    getSegmentCostBreakdown(companyId, fromId, toId) {
        const n1 = this.nodes.find(n => n.id === fromId); const n2 = this.nodes.find(n => n.id === toId);
        if (!n1 || !n2) return { total: 999 };
        
        const conn = this.connections.find(c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId));
        const variance = conn ? (conn.variance || 0) : 0;
        const isBaronOwned = conn ? (conn.owner === 'baron') : false;
        
        const units = this.calculateUnits(fromId, toId); 
        const steelRevenue = units * 10;
        
        let laborCost = (units * 5) + (units * variance);
        if (this.isRustBelt(toId)) {
            laborCost = Math.ceil(laborCost * 1.75);
        }
        
        let mountainTax = 0; 
        if (this.isMountain(toId)) {
            mountainTax = 14 + (n2.c - this.mapZones.mtnStart) * 5;
        }
        
        let toll = isBaronOwned ? laborCost : 0;
        let finalLabor = isBaronOwned ? 0 : laborCost;
        let predSourcing = 0; 
        
        let kickbackTotal = 0;
        if (this.abacus && this.abacus.belt) {
            const cardsToConsume = Math.min(units, this.abacus.belt.length);
            for (let i = 0; i < cardsToConsume; i++) {
                const card = this.abacus.belt[i];
                const effectCard = card.proxy ? card.proxy : card;
                
                if (effectCard.type === 'blue') {
                    kickbackTotal += this.calculateBaronKickback(effectCard.label, companyId, toId, effectCard.level || 1);
                }
            }
        }
        
        for (let i = 0; i < units; i++) {
             let cost = (this.abacus && this.abacus.ledger.blue > 0) ? this.currentContractPrice : 15;
             predSourcing += Math.max(1, cost - this.priceModifiers.blue);
        }
        
        return { 
            total: steelRevenue + finalLabor + toll + mountainTax, 
            labor: finalLabor, 
            toll: toll, 
            variance: variance, 
            steelRevenue: steelRevenue, 
            mountainTax: mountainTax, 
            units: units, 
            isBaronOwned: isBaronOwned, 
            sourcingCost: predSourcing, 
            baronConditionCost: kickbackTotal 
        };
    }

    calculateUnits(fromId, toId) {
        const n1 = this.nodes.find(n => n.id === fromId); 
        const n2 = this.nodes.find(n => n.id === toId);
        
        const dx = n1.x - n2.x; 
        const dy = n1.y - n2.y; 
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        // Vertical penalty softened to 1.4x from 3x
        if (n1.c === n2.c) {
            dist *= 1.4; 
        }

        let units = 1;

        // Tighten the threshold specifically for 1s and 2s to hit a near 51/49 balance
        // Dropped the 1-cost bucket to 110 to ensure diagonals hit the 2 bucket
        if (dist <= 110) {
            units = 1;
        } else if (dist <= 165) {
            units = 2;
        } else {
            units = 3;
        }
        
        const n2Config = this.getNodeConfig(n2);
        if (n2Config && n2Config.trackCost) {
            units += n2Config.trackCost; 
        }
        
        // Hard-cap the unit cost at 3. The engine permanently bans 4-cost and 5-cost links.
        return Math.min(3, units);
    }

    distToSegment(p, v, w) {
        const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) {
            return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
        }
        
        let t = Math.max(0, Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2));
        return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
    }
    
    buyShare(companyId) {
        if (this.tutorial && this.tutorial.isActive) { if (!this.tutorial.handleAction('buyStock', companyId)) return; }
        const comp = this.companies[companyId];
        const price = typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[comp.stockIndex] : 15;
        
        if (this.playerCash >= price && comp.sharesIssued < comp.maxShares) {
            this.playerCash -= price; 
            this.playerShares[companyId]++; 
            comp.sharesIssued++; 
            comp.treasury += price;
            if(typeof CONFIG !== 'undefined') {
                comp.stockIndex = Math.min(CONFIG.marketTrack.length - 1, comp.stockIndex + 1);
            }
            
            this.interactedThisTurn[companyId] = true;
            this.baron.neglect[companyId] = 0; 
            
            this.recordLedger('operations', `Bought Share: ${comp.short}`, -price, 0);

            this.addLog(`Bought 1 Share of ${comp.short} for $${price}.`, "neutral");
            
            if (this.audio) {
                this.audio.playCash();
            }
            this.hasActed = true; 
            this.ui.update();
            this._sync();
        }
    }

    sellShare(companyId) {
        const comp = this.companies[companyId];
        const price = typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[comp.stockIndex] : 15;
        
        if (this.playerShares[companyId] > 0) {
            this.playerCash += price; 
            this.playerShares[companyId]--; 
            comp.sharesIssued--; 
            
            comp.stockIndex = Math.max(0, comp.stockIndex - 1);
            this.checkBankruptcies(); 
            
            this.interactedThisTurn[companyId] = true;
            this.soldThisTurn[companyId] = true; 
            this.baron.neglect[companyId] = 0; 
            
            this.recordLedger('operations', `Sold Share: ${comp.short}`, price, 0);

            this.addLog(`Voluntarily Sold 1 Share of ${comp.short} for $${price}. (Buying Locked)`, "bad");
            
            if (this.audio) {
                this.audio.playCash();
            }
            this.hasActed = true; 
            this.ui.update();
            this._sync();
        }
    }

    cycleDividendPolicy(companyId) {
        const comp = this.companies[companyId];
        if (comp.dividendPolicy === 'full') comp.dividendPolicy = 'half';
        else if (comp.dividendPolicy === 'half') comp.dividendPolicy = 'withhold';
        else comp.dividendPolicy = 'full';
        
        this.hasActed = true;
        
        if (this.audio) this.audio.playClick();
        this.ui.update();
        this._sync();
    }

    startBuildMode(companyId) {
        if (this.activeCompanyForBuild === companyId) { 
            this.activeCompanyForBuild = null; 
        } else {
            this.activeCompanyForBuild = companyId;
        }
        this.renderer.draw(); 
        this.ui.update();
        this._sync();
    }
    
    handleNodeClick(nodeId) {
        if (this.activeCompanyForBuild) { 
            this.buildTrack(this.activeCompanyForBuild, nodeId); 
            return; 
        }
        
        const present = Object.keys(this.companies).filter(k => this.companies[k].builtNodes.includes(nodeId));
        const buildable = Object.keys(this.companies).filter(k => 
            this.connections.some(conn => 
                (this.companies[k].activeLines.includes(conn.from) && conn.to === nodeId) || 
                (this.companies[k].activeLines.includes(conn.to) && conn.from === nodeId)
            )
        );
         
        this.ui.showNodeActionsModal(present, buildable, this.nodes.find(n => n.id === nodeId));
    }

    buildTrack(companyId, targetNodeId) {
        if (this.tutorial && this.tutorial.isActive) { if (!this.tutorial.handleAction('buildTrack', targetNodeId)) return; }
        const comp = this.companies[companyId];
        
        const conn = this.connections.find(c => 
            (comp.activeLines.includes(c.from) && c.to === targetNodeId) || 
            (comp.activeLines.includes(c.to) && c.from === targetNodeId)
        );
        
        if (!conn) return;

        const connKey = Math.min(conn.from, conn.to) + "-" + Math.max(conn.from, conn.to);
        if (comp.builtConnections.includes(connKey)) return;
        
        const sourceNodeId = comp.activeLines.includes(conn.from) ? conn.from : conn.to;
        const b = this.getSegmentCostBreakdown(companyId, sourceNodeId, targetNodeId);
        
        const targetNode = this.nodes.find(n => n.id === targetNodeId);

        if (comp.treasury >= b.total) {
            this.addLog(`--- ${comp.short} Building to ${targetNode.name} ---`, "neutral");
            this.addLog(`Construction Est: $${b.total} (Units: ${b.units})`, "neutral");
            
            comp.treasury -= b.total; 
            this.playerCash += b.steelRevenue;
            
            if (b.baronConditionCost > 0) {
                this.baron.cash += b.baronConditionCost;
                this.baron.totalKickbacks += b.baronConditionCost;
                this.addLog(`Baron Toll Enforced: Paid $${b.baronConditionCost}.`, "log-baron");
                this.baronAnimator.triggerHUD('laugh'); 
            } else if (b.baronConditionCost < 0) {
                this.playerCash += Math.abs(b.baronConditionCost); 
                this.addLog(`Bank Rebate Triggered: Player gained $${Math.abs(b.baronConditionCost)}.`, "good");
                this.baronAnimator.triggerHUD('angry'); 
            }
            
            const consumption = this.consumeSteel(b.units, companyId, targetNodeId);
            this.playerCash -= consumption.cost;

            let pNet = b.steelRevenue - consumption.cost + (b.baronConditionCost < 0 ? Math.abs(b.baronConditionCost) : 0);
            let bNet = (b.baronConditionCost > 0 ? b.baronConditionCost : 0) + (consumption.baronCut || 0);
            
            let trackDetails = [];
            consumption.cards.forEach(card => {
                const effectCard = card.proxy ? card.proxy : card;
                let cardTypeStr = effectCard.type === 'green' ? 'Inventory' : (effectCard.type === 'blue' ? 'Contract' : 'Market');
                
                const cardInfo = this.ui ? this.ui.getCardInfo(effectCard) : { name: `[${effectCard.label}]` };

                trackDetails.push({ name: `Used: ${cardInfo.name} (${cardTypeStr})`, value: 0, cardData: effectCard });
            });
            if (b.baronConditionCost > 0) trackDetails.push({ name: "Baron Toll Triggered", value: b.baronConditionCost, isBaron: true });
            if (b.baronConditionCost < 0) trackDetails.push({ name: "Player Rebate Triggered", value: Math.abs(b.baronConditionCost), isPlayer: true });

            this.recordLedger('operations', `Built Track: ${targetNode.name} (C${targetNode.c}, R${targetNode.r})`, pNet, bNet, trackDetails);

            comp.headNode = targetNodeId; 
            if (!comp.builtNodes.includes(targetNodeId)) {
                comp.builtNodes.push(targetNodeId);
            }
            
            const oldHeadIndex = comp.activeLines.indexOf(sourceNodeId);
            if (oldHeadIndex !== -1) comp.activeLines.splice(oldHeadIndex, 1); 
            if (!comp.activeLines.includes(targetNodeId)) comp.activeLines.push(targetNodeId); 

            comp.builtConnections.push(Math.min(conn.from, conn.to) + "-" + Math.max(conn.from, conn.to));
            comp.trackSegments -= b.units;
            
            this.turnStats.steelRevenue += b.steelRevenue;
            this.turnStats.sourcingCost += consumption.cost;
            this.turnStats.laborPaid += b.labor;
            this.turnStats.tollsPaid += b.toll;
            this.turnStats.mountainTax += b.mountainTax;
            
            if (this.isRustBelt(targetNodeId)) {
                const baseLabor = (b.units * b.variance);
                const actualLabor = Math.ceil(baseLabor * 1.75);
                this.turnStats.rustTax += (actualLabor - baseLabor);
            }
            
            comp.income += targetNode.value;

            const grantsList = [{ id: 'grant2', col: this.mapZones ? this.mapZones.grant2 : 99, amount: 350 }];

            grantsList.forEach(g => {
                if (targetNode.c >= g.col && !comp.grantsClaimed.includes(g.id)) {
                    comp.grantsClaimed.push(g.id);
                    comp.treasury += g.amount;
                    this.addLog(`[FEDERAL GRANT] ${comp.short} crossed Col ${g.col}! +$${g.amount} to Treasury!`, "good");
                    if (this.audio) this.audio.playCash();
                }
            });
            
            const nodeConfig = this.getNodeConfig(targetNode);
            if (nodeConfig && nodeConfig.onBuild) nodeConfig.onBuild(this, comp, targetNode);
            
            this.checkBankruptcies(); 
            
            this.interactedThisTurn[companyId] = true; 
            this.hasActed = true;
            this.baron.neglect[companyId] = 0; 
            
            this.revealMap(); 
            this.ui.update(); 
            this.renderer.draw();
            
            if (this.audio) this.audio.playBuild();
            this._sync();
        }
    }

    triggerParlorEncounter() {
        if (this.tutorial && this.tutorial.isActive) return; 

        this.generateParlorOffers();
        this.parlorRerollCost = 25; 
        this.parlorRerollCount = 0;
        this.ui.showParlorModal();
        if (this.audio) {
            this.audio.playCash();
        }
        this._sync();
    }

    getParlorRerollCost() { 
        return this.parlorRerollCost + (this.parlorRerollCount * 25); 
    }

    rerollParlor() {
        const cost = this.getParlorRerollCost();
        
        if (this.playerCash >= cost) {
            this.playerCash -= cost; 
            this.parlorRerollCount++; 
            this.generateParlorOffers();
            
            this.ui.showParlorModal(true); 
            
            this.recordLedger('operations', `Parlor Reroll`, -cost, 0);

            this.addLog(`Paid $${cost} to reroll Parlor offers.`, "neutral");
            
            if (this.audio) {
                this.audio.playCash();
            }
            this._sync();
        } else {
            this.ui.spawnFloatingMessage("Not enough cash to reroll!", "bad");
            if (this.audio) this.audio.playError();
        }
    }

    generateParlorOffers() {
        const types = ['green', 'blue', 'red'];
        this.parlorOffers = [];
        const seenOffers = new Set(); 
        
        while (this.parlorOffers.length < 3) {
            const type = types[Math.floor(this.random() * types.length)];
            let maxLabel = type === 'green' ? 4 : (type === 'blue' ? 21 : 7);
            const label = String.fromCharCode(65 + Math.floor(this.random() * maxLabel));
            const offerKey = `${type}-${label}`;
            
            if (!seenOffers.has(offerKey)) {
                seenOffers.add(offerKey);
                this.parlorOffers.push({ type, label });
            }
        }
        this._sync();
    }

    completeParlorPurchase(offer, cost, mode, cardId = null) {
        if (cost === 0 || this.playerCash >= cost) {
            this.playerCash -= cost;
            
            if (cost > 0) {
                this.recordLedger('operations', `Acquired ${offer.type.toUpperCase()} Card`, -cost, 0);
            }

            if (mode === 'new') {
                const newCard = { 
                    type: offer.type, 
                    label: offer.label, 
                    level: 1, 
                    id: `${offer.type}-${offer.label}-${Date.now()}-${Math.floor(Math.random()*1000)}` 
                };
                
                this.abacus.discards[offer.type].push(newCard);
                this.addLog(`Parlor: Acquired new [${offer.type.toUpperCase()} ${offer.label}] (Sent to Discards)!`, "good");
            } else if (mode === 'evolve') {
                if (this.abacus.evolveCard(cardId)) {
                    this.addLog(`Parlor: Successfully upgraded [${offer.type.toUpperCase()} ${offer.label}]!`, "good");
                }
            }
            
            this.parlorOffers = []; 
            this.parlorRerollCount = 0; 
            this.ui.closeModal(); 
            this.ui.update();
            
            if (this.audio) this.audio.playCash();
            this._sync();
        } else {
            this.ui.spawnFloatingMessage("Not enough cash!", "bad");
            if (this.audio) this.audio.playError();
        }
    }

    endTurn() {
        if (this.tutorial && this.tutorial.isActive) { if (!this.tutorial.handleAction('endYear', '')) return; }
        this.processBaron(); 
        
        if (this.abacus.ledger.blue > 0) {
            const effectivePrice = Math.max(1, this.currentContractPrice - (this.priceModifiers.blue || 0));
            const p = this.abacus.ledger.blue * (effectivePrice + this.contractFailureCount * 5);
            
            this.playerCash -= p; 
            this.baron.cash += p; 
            this.contractFailureCount++;

            this.recordLedger('settlements', `Contract Penalty (${this.abacus.ledger.blue} units)`, -p, p);

            this.addLog(`Failed to fulfill contract! Paid $${p} penalty.`, "bad");
        }
        
        if (this.playerCash < 0) { 
            this.ui.showLiquidationModal("", ""); 
            return; 
        }
        
        this.completeEndTurn();
    }

    completeEndTurn() {
        Object.keys(this.companies).forEach(k => {
            const c = this.companies[k];
            
            let nodeBreakdown = [];
            c.builtNodes.forEach(nodeId => {
                const node = this.nodes.find(n => n.id === nodeId);
                if (node) nodeBreakdown.push({ name: `${node.name} (C${node.c}, R${node.r})`, value: node.value });
            });

            if (c.dividendPolicy === 'withhold') {
                c.treasury += c.income;
                c.stockIndex = Math.max(0, c.stockIndex - 1);
                
                this.recordLedger('boardMeetings', `${c.short} Withheld Income`, 0, 0, nodeBreakdown);
                this.addLog(`${c.short} withheld $${c.income}. Price DOWN.`, "neutral");

            } else if (c.dividendPolicy === 'half') {
                const retained = Math.floor(c.income / 2);
                c.treasury += retained;
                const distributable = c.income - retained;
                const pps = Math.ceil(distributable / c.maxShares);
                
                const playerCut = pps * this.playerShares[k];
                this.playerCash += playerCut;
                this.baron.cash += pps * this.baron.shares[k];
                c.treasury += pps * (c.maxShares - this.playerShares[k] - this.baron.shares[k]);
                
                this.recordLedger('boardMeetings', `${c.short} Dividends (Half)`, playerCut, pps * this.baron.shares[k], nodeBreakdown);
                this.addLog(`${c.short} paid half dividends. You got $${playerCut}. Price FLAT.`, "neutral");

            } else {
                const pps = Math.ceil(c.income / c.maxShares);
                
                const playerCut = pps * this.playerShares[k];
                this.playerCash += playerCut;
                this.baron.cash += pps * this.baron.shares[k];
                c.treasury += pps * (c.maxShares - this.playerShares[k] - this.baron.shares[k]);
                if (typeof CONFIG !== 'undefined') {
                    c.stockIndex = Math.min(CONFIG.marketTrack.length - 1, c.stockIndex + 1);
                }
                
                this.recordLedger('boardMeetings', `${c.short} Dividends (Full)`, playerCut, pps * this.baron.shares[k], nodeBreakdown);
                this.addLog(`${c.short} paid full dividends. You got $${playerCut}. Price UP.`, "good");
            }
        });
        
        this.checkBankruptcies(); 
        
        Object.values(this.privateCompanies || {}).forEach(pc => {
            if (pc.owner === 'player') {
                this.playerCash += pc.incomeValue;
                this.recordLedger('settlements', `Private Asset: ${pc.mapLabel}`, pc.incomeValue, 0);
                this.addLog(`Private Asset (${pc.name}) paid you $${pc.incomeValue}.`, "good");
            } else if (pc.owner === 'baron') {
                this.baron.cash += pc.incomeValue;
                this.recordLedger('settlements', `Private Asset: ${pc.mapLabel}`, 0, pc.incomeValue);
                this.addLog(`Private Asset (${pc.name}) paid Baron $${pc.incomeValue}.`, "log-baron");
            } else if (pc.owner && this.companies[pc.owner]) {
                this.companies[pc.owner].treasury += pc.incomeValue;
            }
        });

        this.abacus.settleMonth(this.playerCash >= 0);
        this.abacus.ledger.blue = this.monthlyContractVolume || 0;
        this.abacus.refillBelt();
        
        this.activeCompanyForBuild = null;
        if (this.renderer && this.renderer.canvas) {
            this.renderer.canvas.style.cursor = 'default';
        }

        this.turn++; 
        this.hasActed = false; 
        
        Object.keys(this.companies).forEach(k => {
            this.interactedThisTurn[k] = false;
            this.soldThisTurn[k] = false; 
        });

        this.addLog(`--- STARTING YEAR ${this.year + this.turn - 1} ---`, "neutral");
        
        const pNet = this.calculateNetWorth(); 
        const bNet = this.calculateBaronNetWorth();
        
        if (this.turn > (typeof CONFIG !== 'undefined' ? CONFIG.maxTurns : 12)) { 
            this.showGameOver(bNet, pNet, "DEADLINE PASSED"); 
            return; 
        }
        
        if (pNet >= this.targetNetWorth && bNet >= pNet) { 
            this.showGameOver(bNet, pNet, "BARON TAKEOVER"); 
            return; 
        }
        
        this.ui.showTurnSummary();
        this.turnStats = { 
            laborPaid: 0, tollsPaid: 0, steelRevenue: 0, sourcingCost: 0, 
            mountainTax: 0, rustTax: 0, blueWaiversAvailable: this.turnStats.blueWaiversAvailable || 0 
        };
        this.ui.update();
        this.updateMarketUI(); 
        this._sync();
    }

    liquidateOne(companyId) {
        const comp = this.companies[companyId];
        const price = typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[comp.stockIndex] : 15;
        
        if (this.playerShares[companyId] > 0) {
            this.playerShares[companyId]--; 
            comp.sharesIssued--; 
            this.playerCash += price;
            comp.stockIndex = Math.max(0, comp.stockIndex - 1); 
            this.liquidationHistory.push(companyId);
            
            this.recordLedger('operations', `Liquidated Share: ${comp.short}`, price, 0);

            this.checkBankruptcies(); 
            
            this.addLog(`Liquidated 1 Share of ${comp.short} for $${price}.`, "bad");
            this.ui.refreshLiquidation(); 
            
            if (this.audio) this.audio.playCash();
            this._sync();
        }
    }

    undoLiquidation() {
        if (this.liquidationHistory.length > 0) {
            const companyId = this.liquidationHistory.pop(); 
            const comp = this.companies[companyId];
            if (typeof CONFIG !== 'undefined') {
                comp.stockIndex = Math.min(CONFIG.marketTrack.length - 1, comp.stockIndex + 1);
            }
            const price = typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[comp.stockIndex] : 15;
            
            this.playerCash -= price; 
            this.playerShares[companyId]++; 
            comp.sharesIssued++;
            
            if (this.turnLedger && this.turnLedger.operations.length > 0) {
                this.turnLedger.operations.pop();
            }

            this.addLog(`Undid liquidation of ${comp.short}.`, "neutral");
            this.ui.refreshLiquidation();
            this._sync();
        }
    }

    forfeitGame() {
        if (confirm("Are you sure you want to forfeit?")) {
            this.showGameOver(this.calculateBaronNetWorth(), this.calculateNetWorth(), "FORFEIT");
        }
    }

    showGameOver(baronScore, playerScore, reason) {
        this.isGameOver = true;
        let win = playerScore > baronScore && reason !== "BANKRUPTCY" && reason !== "FORFEIT" && reason !== "DEADLINE PASSED" && reason !== "BARON TAKEOVER" && reason !== "ALL COMPANIES BANKRUPT";
        let msg = win ? "YOU WIN!" : "BARON WINS.";
        
        if (win) this.baronAnimator.triggerOverlay('sad', 'RUINED...');
        else this.baronAnimator.triggerOverlay('laugh', 'I OWN YOU!');
        
        const pointsEarned = Math.max(0, Math.floor(playerScore / 2));
        this.metaData.totalPoints += pointsEarned;
        
        if (playerScore > this.metaData.highScore) {
            this.metaData.highScore = playerScore;
        }
        this.saveMetaData();

        const html = `
            <h2 style="color:${win ? '#4dff4d' : '#ff4d4d'};">${msg}</h2>
            <h3 style="color:#aaa;">${reason}</h3>
            <div style="display:flex; justify-content:space-around; margin: 20px 0;">
                <div>
                    <div style="color:var(--accent-gold); font-size:1.2em;">YOUR NET WORTH</div>
                    <div style="font-size:1.5em; font-weight:bold;">$${playerScore}</div>
                </div>
                <div>
                    <div style="color:var(--baron-color); font-size:1.2em;">BARON NET WORTH</div>
                    <div style="font-size:1.5em; font-weight:bold;">$${baronScore}</div>
                </div>
            </div>
            <div style="color:#4dff4d; margin-bottom: 20px;">
                +${pointsEarned} Meta-Points Earned!
            </div>
        `;
        
        this.ui.showModal(html, { forceReplace: true });
        
        if (this.audio) { 
            if (win) this.audio.playWin(); 
            else this.audio.playError(); 
        }
        this._sync();
    }

    endLevel(reachedChicago) {
        const playerNet = this.calculateNetWorth();
        const baronNet = this.calculateBaronNetWorth();
        this.showGameOver(baronNet, playerNet, "CHICAGO REACHED");
    }

    calculateNetWorth() {
        let stockValue = Object.keys(this.companies).reduce((acc, k) => acc + this.playerShares[k] * (typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[this.companies[k].stockIndex] : 15), 0);
        let privateAssetValue = Object.values(this.privateCompanies || {}).reduce((acc, pc) => pc.owner === 'player' ? acc + pc.baseValue : acc, 0);
        return this.playerCash + stockValue + privateAssetValue;
    }

    getProjectedWealth() {
        let projCash = this.playerCash;
        let projStockValue = 0;

        Object.keys(this.companies).forEach(k => {
            const c = this.companies[k];
            if (c.isBankrupt) return;

            let nextStockIndex = c.stockIndex;
            
            if (c.dividendPolicy === 'full') {
                const pps = Math.ceil(c.income / c.maxShares);
                projCash += pps * this.playerShares[k];
                if(typeof CONFIG !== 'undefined') nextStockIndex = Math.min(CONFIG.marketTrack.length - 1, nextStockIndex + 1);
            } else if (c.dividendPolicy === 'half') {
                const retained = Math.floor(c.income / 2);
                const distributable = c.income - retained;
                const pps = Math.ceil(distributable / c.maxShares);
                projCash += pps * this.playerShares[k];
            } else {
                nextStockIndex = Math.max(0, nextStockIndex - 1);
            }

            projStockValue += this.playerShares[k] * (typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[nextStockIndex] : 15);
        });

        let privateAssetValue = Object.values(this.privateCompanies || {}).reduce((acc, pc) => pc.owner === 'player' ? acc + pc.baseValue : acc, 0);

        return projCash + projStockValue + privateAssetValue;
    }

    calculateBaronNetWorth() {
        let stockValue = Object.keys(this.companies).reduce((acc, k) => acc + this.baron.shares[k] * (typeof CONFIG !== 'undefined' ? CONFIG.marketTrack[this.companies[k].stockIndex] : 15), 0);
        let privateAssetValue = Object.values(this.privateCompanies || {}).reduce((acc, pc) => pc.owner === 'baron' ? acc + pc.baseValue : acc, 0);
        return this.baron.cash + stockValue + privateAssetValue;
    }

    checkBankruptcies() {
        let anyNew = false;
        Object.keys(this.companies).forEach(k => {
            const c = this.companies[k];
            if (!c.isBankrupt && c.stockIndex === 0) {
                c.isBankrupt = true;
                this.addLog(`CRITICAL: ${c.name} has gone BANKRUPT! Trading frozen.`, "danger");
                anyNew = true;
                
                if (this.activeCompanyForBuild === k) {
                    this.activeCompanyForBuild = null;
                    if (this.renderer && this.renderer.canvas) this.renderer.canvas.style.cursor = 'default';
                }
            }
        });

        if (anyNew) {
            if (this.audio) this.audio.playError();
            
            const allDead = Object.values(this.companies).every(c => c.isBankrupt);
            if (allDead) {
                setTimeout(() => this.showGameOver(this.calculateBaronNetWorth(), this.calculateNetWorth(), "ALL COMPANIES BANKRUPT"), 1000);
            }
        }
    }

    checkChicagoVictory(company) {
        const chicagoNode = this.nodes.find(n => n.type === 'chicago');
        if (!chicagoNode || !company.builtNodes.includes(chicagoNode.id)) return false;

        const startNodes = this.nodes.filter(n => n.type === 'start').map(n => n.id);
        let visited = new Set();
        let queue = [chicagoNode.id];
        visited.add(chicagoNode.id);

        let hasConnected = false;

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (startNodes.includes(currentId)) {
                hasConnected = true;
                break;
            }

            this.connections.forEach(conn => {
                const connKey = Math.min(conn.from, conn.to) + "-" + Math.max(conn.from, conn.to);
                if (company.builtConnections.includes(connKey)) {
                    const neighborId = (conn.from === currentId) ? conn.to : (conn.to === currentId ? conn.from : null);
                    if (neighborId !== null && !visited.has(neighborId)) {
                        visited.add(neighborId);
                        queue.push(neighborId);
                    }
                }
            });
        }

        if (hasConnected) {
            this.isGameOver = true;
            this.addLog(`${company.short} BRIDGED THE CONTINENT TO CHICAGO! The race is over!`, "good");
            setTimeout(() => this.endLevel(true), 500);
        } else {
            this.addLog(`ALERT: ${company.short} reached Chicago, but the transcontinental link is incomplete!`, "danger");
            if (this.audio) this.audio.playError();
        }
    }
}

window.Game = Game;