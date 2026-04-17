class AbacusEngine {
    constructor(game) {
        // Reference to the main Game instance to access the seeded PRNG
        this.game = game;

        // THE LEDGER (The Truth / Math)
        this.ledger = {
            green: 3,       // Owned units (Starts at 3)
            blue: 0,        // Contract obligations (Set by IPO)
            redCount: 0     // Market cards drawn this turn (Resets every turn)
        };

        // THE INVENTORY (The Physics / Totems)
        this.inventory = {
            green: [], // Draw Pile
            blue: [],  // Draw Pile
            red: []    // Draw Pile (Market Pool)
        };

        // THE CONVEYOR BELT (The Hand)
        this.belt = []; // Max 5 cards

        // THE DISCARDS (The Graveyard)
        this.discards = {
            green: [],
            blue: [],
            red: []
        };

        // Initialize the physical decks immediately
        this.initPhysicalDecks();
    }

    /**
     * 2. Initialization Logic (The "Ghost Buster" Protocol)
     * Creates the specific finite physical decks.
     */
    initPhysicalDecks() {
        // Green Deck: 4 Cards (A-D)
        this.inventory.green = this._createDeck('green', 4);

        // Blue Deck: 21 Cards (A-U)
        this.inventory.blue = this._createDeck('blue', 21);

        // Red Deck: EXACTLY 7 Cards (A-G)
        this.inventory.red = this._createDeck('red', 7);

        // Shuffle immediately
        this.shuffleAllDecks();
    }

    /**
     * Helper to create a deck of cards with labels
     */
    _createDeck(type, count) {
        const deck = [];
        for (let i = 0; i < count; i++) {
            const label = String.fromCharCode(65 + i); 
            deck.push({ 
                type: type, 
                label: label, 
                level: 1, // Start at Level 1
                // Use seeded random for the unique ID to ensure perfect determinism
                id: `${type}-${label}-${Date.now()}-${Math.floor(this.game.random() * 1000)}` 
            });
        }
        return deck;
    }

    /**
     * Standard Fisher-Yates Shuffle using the Seeded PRNG
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.game.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffleAllDecks() {
        this.shuffle(this.inventory.green);
        this.shuffle(this.inventory.blue);
        this.shuffle(this.inventory.red);
    }

    /**
     * 3. The "Great Reshuffle" (End of Month Reset)
     * Physical reset of the economy.
     */
    resetMonth() {
        // Clear Belt: Move all cards from belt to their respective discards
        while (this.belt.length > 0) {
            const card = this.belt.pop();
            this.discards[card.type].push(card);
        }

        // Reclaim Discards: Move ALL discards back to inventory
        ['green', 'blue', 'red'].forEach(type => {
            if (this.discards[type].length > 0) {
                this.inventory[type].push(...this.discards[type]);
                this.discards[type] = [];
            }
        });

        // Shuffle
        this.shuffleAllDecks();

        // RESTORED: Reset the redCount every year so the price drops back down to $15!
        this.ledger.redCount = 0;
    }

    /**
     * Helper to recycle specific discard pile during draw (Paradox Rule)
     */
    recycleDiscard(type) {
        if (this.discards[type].length > 0) {
            this.inventory[type].push(...this.discards[type]);
            this.discards[type] = [];
            this.shuffle(this.inventory[type]);
        }
    }

    /**
     * 4. The Conveyor Belt (Priority Fill & Strict Physics Rule)
     * Priority: Green -> Blue -> Red
     * Logic: IF Ledger demands Green, we MUST fetch Green. If Green empty, WAIT.
     */
    refillBelt() {
        while (this.belt.length < 5) {
            let card = null;

            // 1. DETERMINE TARGET TIER (Strict Priority)
            const currentGreen = this.belt.filter(c => c.type === 'green').length;
            const currentBlue = this.belt.filter(c => c.type === 'blue').length;
            
            let targetType = 'red'; // Default to Market if all obligations met
            
            if (currentGreen < this.ledger.green) {
                targetType = 'green';
            } else if (currentBlue < this.ledger.blue) {
                targetType = 'blue';
            }
            
            // 2. ATTEMPT TO SOURCE FROM TARGET
            if (targetType === 'green') {
                // Try recycle
                if (this.inventory.green.length === 0) this.recycleDiscard('green');
                
                if (this.inventory.green.length > 0) {
                    card = this.inventory.green.pop();
                } else {
                    // STRICT RULE: We want Green, but none available.
                    // DO NOT FALLBACK. STOP FILLING.
                    break;
                }
            } else if (targetType === 'blue') {
                 // Try recycle (though blue rarely cycles in one turn, good for safety)
                 if (this.inventory.blue.length === 0) this.recycleDiscard('blue');

                 if (this.inventory.blue.length > 0) {
                     card = this.inventory.blue.pop();
                 } else {
                     // STRICT RULE: We want Blue, but none available.
                     // STOP FILLING.
                     break;
                 }
            } else {
                // targetType === 'red' (Market)
                // Try recycle
                if (this.inventory.red.length === 0) this.recycleDiscard('red');
                
                if (this.inventory.red.length > 0) {
                    card = this.inventory.red.pop();
                } else {
                    break; // Market dry (rare)
                }
            }

            // 3. ADD TO BELT IF FOUND
            if (card) {
                // BUGFIX: We no longer increment ledger.redCount or hardcode card.price here!
                // This eliminates the "double dip". Pricing is completely dynamic in GameCore.js 
                // based on the card's position on the belt and how many have been consumed.
                this.belt.push(card);
            }
        }

        // 4. SORT LADDER: Green (1) -> Blue (2) -> Red (3)
        const priority = { 'green': 1, 'blue': 2, 'red': 3 };
        this.belt.sort((a, b) => priority[a.type] - priority[b.type]);
    }

    /**
     * 5. The "Take or Pay" Settlement (Math Logic)
     */
    calculatePenalty(contractPrice) {
        if (this.ledger.blue <= 0) {
            return 0;
        }

        return this.ledger.blue * contractPrice;
    }

    settleMonth(wasPenaltyPaid) {
        if (wasPenaltyPaid) {
            const unusedBlue = Math.max(0, this.ledger.blue);
            this.ledger.green += unusedBlue;
            this.ledger.blue = 0;
        }

        // Regardless of outcome: Call resetMonth()
        this.resetMonth();
    }

    /**
     * 6. Helper Methods Required
     */
    consume(beltIndex) {
        if (beltIndex < 0 || beltIndex >= this.belt.length) {
            console.error("Invalid belt index");
            return null;
        }

        // Remove from belt
        const card = this.belt.splice(beltIndex, 1)[0];

        // Prevents "Infinite Green Steel" and "Infinite Blue Loop" bugs
        if (card.type === 'green') {
            this.ledger.green = Math.max(0, this.ledger.green - 1);
        } else if (card.type === 'blue') {
            this.ledger.blue = Math.max(0, this.ledger.blue - 1);
        }

        // Add to discard
        this.discards[card.type].push(card);

        return card;
    }

    getBelt() {
        return this.belt;
    }

    getInventoryState() {
        return {
            inventory: {
                green: this.inventory.green.length,
                blue: this.inventory.blue.length,
                red: this.inventory.red.length
            },
            discards: {
                green: this.discards.green.length,
                blue: this.discards.blue.length,
                red: this.discards.red.length
            },
            ledger: { ...this.ledger }
        };
    }

    /**
     * SEARCH UTILITY: Returns all cards of a specific type from all locations.
     */
    getAllCards(type) {
        const fromInv = this.inventory[type] || [];
        const fromBelt = this.belt.filter(c => c.type === type);
        const fromDisc = this.discards[type] || [];
        return [...fromInv, ...fromBelt, ...fromDisc];
    }

    /**
     * DESTRUCTIVE ACTION: Permanently removes a card from the game.
     */
    trashCard(cardId) {
        // 1. Try Inventory
        let idx = this.inventory.green.findIndex(c => c.id === cardId);
        if (idx > -1) { this.inventory.green.splice(idx, 1); return true; }
        idx = this.inventory.blue.findIndex(c => c.id === cardId);
        if (idx > -1) { this.inventory.blue.splice(idx, 1); return true; }
        idx = this.inventory.red.findIndex(c => c.id === cardId);
        if (idx > -1) { this.inventory.red.splice(idx, 1); return true; }

        // 2. Try Discards
        idx = this.discards.green.findIndex(c => c.id === cardId);
        if (idx > -1) { this.discards.green.splice(idx, 1); return true; }
        idx = this.discards.blue.findIndex(c => c.id === cardId);
        if (idx > -1) { this.discards.blue.splice(idx, 1); return true; }
        idx = this.discards.red.findIndex(c => c.id === cardId);
        if (idx > -1) { this.discards.red.splice(idx, 1); return true; }

        // 3. Try Belt
        idx = this.belt.findIndex(c => c.id === cardId);
        if (idx > -1) { this.belt.splice(idx, 1); return true; }

        console.warn("Trash failed: Card not found", cardId);
        return false;
    }

    /**
     * EVOLUTION: Upgrades a specific card instance to the next level.
     */
    evolveCard(cardId) {
        const allCards = this.getAllCards('green')
            .concat(this.getAllCards('blue'))
            .concat(this.getAllCards('red'));

        const card = allCards.find(c => c.id === cardId);
        
        if (card && card.level < 3) {
            card.level++;
            // Update Label visual (A -> AA -> AAA)
            card.label = card.label.charAt(0).repeat(card.level);
            return true;
        }
        return false;
    }
}