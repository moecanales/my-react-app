/**
 * BaronAI.js
 * Encapsulates all logic for the AI opponent, including stock trading,
 * property acquisition, and the dynamic kickback calculation system.
 */
class BaronAI {
    constructor(game) {
        this.game = game;
    }

    /**
     * Helper to count specific features in a company's built network.
     * Updated: Now accepts the targetNodeId to "see into the future" of the current build action.
     */
    countNetworkFeatures(companyId, predicateFn, targetNodeId = null) {
        const comp = this.game.companies[companyId];
        if (!comp) return 0;
        let count = 0;
        
        if (comp.builtNodes) {
            count = comp.builtNodes.reduce((c, nodeId) => {
                const node = this.game.nodes.find(n => n.id === nodeId);
                if (node && predicateFn(node)) return c + 1;
                return c;
            }, 0);
        }

        // Project the target node if it isn't already built
        if (targetNodeId && (!comp.builtNodes || !comp.builtNodes.includes(targetNodeId))) {
            const tNode = this.game.nodes.find(n => n.id === targetNodeId);
            if (tNode && predicateFn(tNode)) count++;
        }

        return count;
    }

    /**
     * Helper to count nodes in a company network that are shared with other companies.
     */
    countSharedHubs(companyId, targetNodeId = null) {
        const comp = this.game.companies[companyId];
        if (!comp) return 0;
        
        const checkNode = (nodeId) => {
            const isShared = Object.values(this.game.companies).some(c => 
                c.id !== companyId && c.builtNodes && c.builtNodes.includes(nodeId)
            );
            return isShared ? 1 : 0;
        };

        let count = 0;
        if (comp.builtNodes) {
            count = comp.builtNodes.reduce((c, nodeId) => c + checkNode(nodeId), 0);
        }
        
        // Project target node
        if (targetNodeId && (!comp.builtNodes || !comp.builtNodes.includes(targetNodeId))) {
            count += checkNode(targetNodeId);
        }

        return count;
    }

    /**
     * The dynamic kickback calculator. Returns the $ surcharge or rebate 
     * based on the card label and company network state.
     * FULLY UPDATED WITH NEW ECONOMY MULTIPLIERS.
     */
    calculateBaronKickback(cardLabel, companyId, targetNodeId, cardLevel = 1) {
        if (!companyId) return 0;
        const comp = this.game.companies[companyId];
        if (!comp) return 0;
        let surcharge = 0;

        // Strip level indicators if checking base identity
        const baseLabel = cardLabel.charAt(0);

        switch (baseLabel) {
            case 'A': surcharge = 50 * this.countNetworkFeatures(companyId, n => n.subType === 'signal', targetNodeId); break;
            case 'B': surcharge = 40 * this.countNetworkFeatures(companyId, n => n.subType === 'regional_hq' || n.subType === 'fed_exchange', targetNodeId); break;
            case 'C': surcharge = 15 * this.countNetworkFeatures(companyId, n => n.subType === 'parlor', targetNodeId); break;
            case 'D': surcharge = 15 * this.countNetworkFeatures(companyId, n => n.subType === 'standard', targetNodeId); break;
            case 'E': surcharge = 5 * (comp.builtNodes.length + (comp.builtNodes.includes(targetNodeId) ? 0 : 1)); break; // Approximating segments via nodes
            case 'F': if (this.game.isRustBelt(targetNodeId)) surcharge = 150; break;
            case 'G': surcharge = 100 * this.countNetworkFeatures(companyId, n => this.game.isMountain(n.id), targetNodeId); break;
            case 'H': 
                const totalShares = Object.values(this.game.companies).reduce((sum, c) => sum + c.sharesIssued, 0);
                surcharge = 15 * totalShares; 
                break;
            case 'I': surcharge = 50 * this.countNetworkFeatures(companyId, n => n.subType === 'supply', targetNodeId); break;
            case 'J': surcharge = 50 * this.countNetworkFeatures(companyId, n => n.subType === 'fed_exchange', targetNodeId); break;
            case 'K': surcharge = 50 * this.countNetworkFeatures(companyId, n => n.subType === 'regional_hq', targetNodeId); break;
            case 'L': surcharge = 50 * this.countSharedHubs(companyId, targetNodeId); break;
            case 'M': surcharge = 15 * this.countNetworkFeatures(companyId, n => n.subType !== 'standard' && n.type !== 'start', targetNodeId); break;
            case 'N': surcharge = 10 * (comp.builtNodes.length + (comp.builtNodes.includes(targetNodeId) ? 0 : 1)); break;
            case 'P': surcharge = Math.floor(comp.treasury * 0.75); break; // Up to 75%
            case 'R': surcharge = 20 * Math.max(0, comp.trackSegments); break;
            case 'T': surcharge = 10 * (this.game.abacus.discards.green.length + this.game.abacus.discards.blue.length + this.game.abacus.discards.red.length); break;
            case 'U': surcharge = 0; break; // Handled as an active effect in GameCore instead of a flat cash toll
        }

        // Logic Scaling: Level 2 cancels the penalty. Level 3 turns it into a player rebate.
        if (cardLevel === 2) {
            surcharge = 0;
        } else if (cardLevel === 3) {
            if (baseLabel === 'G') {
                // Custom scaling for Mountain Toll
                surcharge = -(100 * this.countNetworkFeatures(companyId, n => this.game.isMountain(n.id), targetNodeId));
            } else if (baseLabel === 'F') {
                surcharge = this.game.isRustBelt(targetNodeId) ? -150 : 0;
            } else {
                surcharge = -surcharge;
            }
        }
        
        return surcharge;
    }

    /**
     * Executes the Baron's turn-end logic: buying neglected stocks and properties.
     */
    processBaron() {
        Object.keys(this.game.companies).forEach(k => {
            const c = this.game.companies[k];
            if (c.isBankrupt) return; // ADD THIS LINE: Ignore dead companies
            // Update neglect track
            if (!this.game.interactedThisTurn[k]) this.game.baron.neglect[k]++;
            else this.game.baron.neglect[k] = 0;

            const threshold = (this.game.bonuses.influence ? 3 : 2);
            if (this.game.baron.neglect[k] >= threshold) {
                const price = CONFIG.marketTrack[c.stockIndex];
                if (c.sharesIssued < c.maxShares) { 
                     if (this.game.baron.cash < price) { 
                        this.game.baron.debt += (price - this.game.baron.cash); 
                        this.game.baron.cash = 0; 
                     } else {
                        this.game.baron.cash -= price;
                     }
                     this.game.baron.shares[k]++;
                     c.sharesIssued++;
                     c.treasury += price;
                     c.stockIndex = Math.min(CONFIG.marketTrack.length - 1, c.stockIndex + 1);
                     this.game.ui.addLog(`Baron buys ${c.short} (Neglect).`, "log-baron");
                     this.game.audio.playBaron();
                     this.game.baronAnimator.triggerHUD('laugh'); // NEW ANIMATOR HOOK
                     this.game.baron.neglect[k] = 0; 
                }
            }
        });

        // Property Acquisition logic
        if (this.game.baronPropertiesEnabled) {
            let pBought = 0;
            const cost = Math.max(1, CONFIG.propertyBuyCost);
            while (this.game.baron.cash >= 4 && pBought < this.game.baronPropertyLimit) {
                const unowned = this.game.connections.filter(c => !c.owner);
                if (unowned.length === 0) break; 
                const scored = unowned.map(conn => {
                    let score = 0;
                    const n1 = this.game.nodes.find(n => n.id === conn.from);
                    const n2 = this.game.nodes.find(n => n.id === conn.to);
                    if (!n1 || !n2) return { conn, score: -999 };
                    // Baron prefers connections closer to the east
                    score += (n2.c * 2);
                    return { conn, score };
                }).sort((a, b) => b.score - a.score);

                if (scored.length > 0 && this.game.baron.cash >= cost) {
                    scored[0].conn.owner = 'baron';
                    this.game.baron.properties.push(scored[0].conn);
                    this.game.baron.cash -= cost;
                    pBought++; 
                } else break;
            }
            if (pBought > 0) this.game.ui.addLog(`Baron acquired ${pBought} new properties.`, "log-baron");
        }
    }

    /**
     * Red Card F Effect: Forces the Baron to sell off their largest stock holdings.
     */
    performProxyFight(level = 1) {
        const counts = { 1: 1, 2: 2, 3: 100 }; // 100 as a proxy for 'all'
        const toSellCount = counts[level] || 1;

        // Identify current holdings sorted by total value
        const holdings = Object.keys(this.game.companies)
            .filter(k => this.game.baron.shares[k] > 0 && !this.game.companies[k].isBankrupt) // UPDATE THIS LINE
            .map(k => ({
                id: k,
                shares: this.game.baron.shares[k],
                value: this.game.baron.shares[k] * CONFIG.marketTrack[this.game.companies[k].stockIndex]
            }))
            .sort((a, b) => b.value - a.value);

        const targets = holdings.slice(0, toSellCount);

        targets.forEach(t => {
            const c = this.game.companies[t.id];
            const price = CONFIG.marketTrack[c.stockIndex];
            const revenue = t.shares * price;

            this.game.baron.shares[t.id] = 0;
            this.game.baron.cash += revenue;
            
            c.sharesIssued -= t.shares;
            // Market crashes due to selloff
            c.stockIndex = Math.max(0, c.stockIndex - t.shares);
            
            this.game.ui.addLog(`PROXY FIGHT: Baron liquidates holdings in ${c.short}!`, "bad");
        });

        this.game.checkBankruptcies(); // ADD THIS LINE
        if (targets.length > 0) this.game.audio.playBaron();
    }
}