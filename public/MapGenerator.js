class MapGenerator {
    constructor(game) {
        this.game = game;
    }

    /**
     * Calculates grid dimensions and zone boundaries based on padding and config.
     */
    calculateMapConfig() {
        const padding = this.game.mapPadding || 0;
        this.game.cellWidth = this.game.customCellWidth || 100;
        
        // PHASE 1.6: Dialed back from 11 to 10 to perfectly fit the UI void
        this.game.gridRows = 10; 
        
        // INCREASED ROW SPACING to give connection lines room to breathe
        this.game.cellHeight = 85;
        this.game.gridCols = 45 + padding; // EXPANDED TO 45 COLUMNS
        
        const baseMtnStart = 28; // Shifted Mountains to Col 28
        const mtnStart = baseMtnStart + padding;
        const mtnEnd = 30 + padding; // 3 columns of mountains
        const rustStart = 35 + padding; // Start Rust Belt at Col 35 (last 10 cols)

        this.game.mapZones = {
            mtnStart: mtnStart,
            mtnEnd: mtnEnd,
            rustStart: rustStart,
            chicagoBase: 18 + padding,
            // --- FEDERAL GRANTS ---
            grant1: Math.floor(mtnStart / 3),
            grant2: Math.floor((mtnStart * 2) / 3) + 3,
            grant3: mtnEnd + Math.floor((rustStart - mtnEnd) / 2)
        };
    }

    /**
     * Returns the configuration object for a specific node.
     */
    getNodeConfig(node) {
        const key = (node.type === 'start' || node.type === 'chicago') ? node.type : node.subType;
        return NODE_TYPES[key] || NODE_TYPES['standard'];
    }

    /**
     * Massive procedural generation logic for the game board.
     */
    generateMap() {
        this.game.nodes = []; 
        this.game.connections = [];
        const cols = this.game.gridCols; 
        const rows = this.game.gridRows;
        
        const { mtnStart, mtnEnd, rustStart, chicagoBase } = this.game.mapZones;
        
        if (typeof REGIONAL_NAMES === 'undefined' || !REGIONAL_NAMES.west_coast) {
            console.error("Map Generation Failed: REGIONAL_NAMES undefined. Check game_data.js integrity.");
            this.game.addLog("CRITICAL ERROR: Map Data Missing. Reload Page.", "danger");
            return;
        }

        const namePools = {
            west: [...REGIONAL_NAMES.west_coast].sort(() => 0.5 - this.game.random()),
            basin: [...REGIONAL_NAMES.basin].sort(() => 0.5 - this.game.random()),
            rockies: [...REGIONAL_NAMES.rockies].sort(() => 0.5 - this.game.random()),
            plains: [...REGIONAL_NAMES.plains].sort(() => 0.5 - this.game.random()),
            rust: [...REGIONAL_NAMES.rust_belt].sort(() => 0.5 - this.game.random())
        };
        const midWestSplit = Math.floor(mtnStart / 2);
        
        // PHASE 3: Establish exact locked height for scrolling
        const offsetY = 0; // Changed from 60 to 0 (shifts everything UP by one full row)
        const logicalHeight = 660; 
        
        // PHASE 5, 6, & 6.1: Brought the mainland back into view and pulled it closer to the beach
        const offsetX = 280; // UPDATED: Changed to 280

        // --- STRETCHING THE FABRIC OF THE MESH ---
        // Dynamically calculate column X positions to expand as we move East
        const colOffsets = [];
        let currentX = offsetX;
        for (let i = 0; i <= cols; i++) {
            colOffsets.push(currentX);
            let gap = 100;
            // Slightly widened the starting zone gaps to give the coast more visual breathing room
            if (i === 0) gap = 75; 
            else if (i === 1) gap = 85;
            else if (i === 2) gap = 95;
            currentX += gap;
        }

        const logicalWidth = colOffsets[cols] + 100;
        const container = document.getElementById('map-container');
        this.game.width = Math.max(container ? container.offsetWidth : logicalWidth, logicalWidth); 
        this.game.height = logicalHeight;

        let nodeId = 0; 
        const grid = [];
        const chicagoCol = chicagoBase + Math.floor(this.game.random() * 4);
        const bonusCol = chicagoCol + 2;

        const usedNames = new Set();
        const getUniqueName = (pool) => {
            if (pool.length > 0) {
                const name = pool.pop();
                if (!usedNames.has(name)) { usedNames.add(name); return name; }
            }
            for (let i = 0; i < 10; i++) {
                const pre = TOWN_PREFIXES[Math.floor(this.game.random() * TOWN_PREFIXES.length)];
                const suf = TOWN_SUFFIXES[Math.floor(this.game.random() * TOWN_SUFFIXES.length)];
                const name = pre + suf.toLowerCase(); 
                if (!usedNames.has(name)) { usedNames.add(name); return name; }
            }
            const fallback = `Station ${Math.floor(this.game.random() * 9000) + 1000}`;
            usedNames.add(fallback);
            return fallback;
        };

        // --- THE WAVY COASTLINE (Custom Carve on Y-Axis) ---
        const coastCurve = [15, 10, 5, 0, -10, -5, 10, 25, 35, 20, 10];

        // ==========================================
        // STEP 1: GENERATE GENERIC GRID (Columns 1+)
        // ==========================================
        for(let c = 1; c <= cols; c++) {
            grid[c] = [];
            for(let r = 0; r <= rows; r++) {
                const jx = (this.game.random() - 0.5) * 20; 
                const jy = (this.game.random() - 0.5) * 20;
                let type = 'city'; 
                let subType = 'standard'; 
                let value = Math.floor(this.game.random() * 3) * 5 + 5; 
                
                let pool = [];
                if (c <= midWestSplit) pool = namePools.west;
                else if (c < mtnStart) pool = namePools.basin;
                else if (c <= mtnEnd) pool = namePools.rockies;
                else if (c < rustStart) pool = namePools.plains;
                else pool = namePools.rust;

                let displayName = getUniqueName(pool); 

                // Use the dynamically expanding column offsets
                let finalX = colOffsets[c] + jx;
                let finalY = offsetY + (r * (this.game.cellHeight || 85)) + jy;

                // Apply the Wavy Coastline specifically to columns 1 and 2
                if (c === 1 || c === 2) {
                    if (r >= 0 && r < coastCurve.length) {
                        finalX -= (coastCurve[r] / c); // Divide by c to make the wave weaker on Col 2
                    }
                }

                if (c === chicagoCol) { 
                    if (r === Math.floor(rows/2)) { type = 'chicago'; value = 50; displayName = "CHICAGO"; }
                } else if (c === bonusCol) { 
                    if (r === 1) { subType = 'detroit'; value = 20; displayName = "Detroit"; } 
                    else if (r === 7) { subType = 'financial'; value = 20; displayName = "Cleveland"; } 
                    else if (this.game.random() > 0.5) continue; 
                } else {
                    if (c > 1 && this.game.random() > 0.8) continue;
                    const roll = this.game.random(); let isSpecial = false;
                    const isRustBelt = c >= rustStart; const isStarved = (c === 1 || c === 2);
                    
                    let supplyChance = isRustBelt ? 0.25 : 0.17; 
                    let unionChance = isRustBelt ? 0.45 : 0.30; 
                    
                    if (isStarved) { supplyChance = 0; unionChance = 0; }

                    if (roll < supplyChance) { subType = 'supply'; isSpecial = true; }
                    else if (roll < unionChance) { subType = 'union_yard'; isSpecial = true; }
                    else if (roll < unionChance + 0.08) { subType = 'regional_hq'; isSpecial = true; } 
                    else if (roll < unionChance + 0.13) { subType = 'fed_exchange'; isSpecial = true; } 
                    else if (roll < unionChance + 0.21) { subType = 'boomtown'; isSpecial = true; } 
                    else if (roll < unionChance + 0.26) { subType = 'merger'; value += 10; isSpecial = true; } 
                    else if (roll < unionChance + 0.31) { subType = 'signal'; isSpecial = true; } 
                    else if (roll < unionChance + 0.36) { subType = 'parlor'; isSpecial = true; } 
                }

                const node = { id: nodeId++, x: finalX, y: finalY, c: c, r: r, type: type, subType: subType, value: value, name: displayName, revealed: false };
                this.game.nodes.push(node); grid[c][r] = node;
            }
        }

        // ==========================================
        // STEP 2: AUTO-CEILING SHIFT
        // Shift only the generic grid to the ceiling
        // ==========================================
        if (this.game.nodes.length > 0) {
            const minNodeY = Math.min(...this.game.nodes.map(n => n.y));
            const shiftY = 30 - minNodeY; 
            
            this.game.nodes.forEach(n => {
                n.y += shiftY;
            });
        }

        // ==========================================
        // STEP 3: RESTORE TRUE HQ COORDINATES
        // Safely injected AFTER the ceiling shift so they remain pure
        // ==========================================
        grid[0] = [];
        
        // Exact designer coordinates applied here:
        const hqData = [
            { name: "Seattle",       r: 1, x: 250, y: 127 },        
            { name: "Portland",      r: 3, x: 243, y: 242 },      
            { name: "San Francisco", r: 9, x: 250, y: 750 }  
        ];

        hqData.forEach(hq => {
            const node = { id: nodeId++, x: hq.x, y: hq.y, c: 0, r: hq.r, type: 'start', subType: 'start', value: 5, name: hq.name, revealed: false };
            this.game.nodes.push(node);
            grid[0][hq.r] = node;
        });

        const potentialParlors = this.game.nodes.filter(n => n.type === 'city' && n.subType === 'standard');
        for (let i = potentialParlors.length - 1; i > 0; i--) {
            const j = Math.floor(this.game.random() * (i + 1));
            [potentialParlors[i], potentialParlors[j]] = [potentialParlors[j], potentialParlors[i]];
        }
        const targetCount = Math.floor(this.game.random() * 11) + 15;
        potentialParlors.slice(0, targetCount).forEach(node => { node.subType = 'parlor'; });
        
        // ==========================================
        // STEP 4: TRUE PROXIMITY WIRING
        // ==========================================
        const startNodes = this.game.nodes.filter(n => n.type === 'start');
        let seattleTargets = [];

        startNodes.forEach(node => {
            let candidates = this.game.nodes.filter(n => n.c === 1 || n.c === 2);
            
            // Because HQs are accurately pinned, raw distance works perfectly
            candidates.forEach(c => {
                c._dist = Math.sqrt(Math.pow(c.x - node.x, 2) + Math.pow(c.y - node.y, 2));
            });

            candidates.sort((a, b) => a._dist - b._dist);
            let selected = candidates.slice(0, 3);
            
            // SMART CONNECTION / OVERLAP CAP
            if (node.name === "Seattle") {
                seattleTargets = selected.map(n => n.id);
            } else if (node.name === "Portland") {
                const sharedCount = selected.filter(n => seattleTargets.includes(n.id)).length;
                if (sharedCount === 3 && candidates.length > 3) {
                    selected.shift(); 
                    selected.push(candidates[3]);
                }
            }
            
            selected.forEach(target => {
                const variance = Math.floor(this.game.random() * 7) - 3;
                this.game.connections.push({ from: node.id, to: target.id, cost: 0, variance: variance, owner: null });
            });
        });

        // --- NORMAL HORIZONTAL CONNECTIONS ---
        this.game.nodes.filter(n => n.type !== 'start').forEach(node => {
            const nextCol = grid[node.c + 1]; if (!nextCol) return;
            [0, -1, 1].forEach(offset => {
                const neighbor = nextCol[node.r + offset];
                if (neighbor) {
                    const variance = Math.floor(this.game.random() * 7) - 3;
                    this.game.connections.push({ from: node.id, to: neighbor.id, cost: 0, variance: variance, owner: null });
                }
            });
        });

        // Vertical connections within columns
        for(let c = 1; c <= cols; c++) {
            if (!grid[c]) continue;
            for(let r = 0; r < rows - 1; r++) {
                const nodeA = grid[c][r]; const nodeB = grid[c][r+1];
                if (nodeA && nodeB) {
                    const variance = Math.floor(this.game.random() * 7) - 3;
                    this.game.connections.push({ from: nodeA.id, to: nodeB.id, cost: 0, variance: variance, owner: null });
                }
            }
        }

        if (this.game.baronPropertiesEnabled) {
            const startZoneConns = this.game.connections.filter(c => {
                 const n1 = this.game.nodes.find(n => n.id === c.from);
                 return n1 && n1.c <= 3;
            });
            for (let i = startZoneConns.length - 1; i > 0; i--) {
                const j = Math.floor(this.game.random() * (i + 1));
                [startZoneConns[i], startZoneConns[j]] = [startZoneConns[j], startZoneConns[i]];
            }
            for (const conn of startZoneConns) {
                 if (this.game.baron.cash >= CONFIG.propertyBuyCost && this.game.baron.properties.length < (this.game.baronStartPropsLimit || 5)) {
                     conn.owner = 'baron';
                     this.game.baron.properties.push(conn);
                     this.game.baron.cash -= CONFIG.propertyBuyCost;
                 } else {
                     break; 
                 }
            }
        }

        // PREVENT PRIVATE COMPANIES FROM SPAWNING PAST THE RUST BELT LINE
        let validNodes = this.game.nodes.filter(n => 
            n.c >= 5 && 
            n.type !== 'start' && 
            n.type !== 'chicago' && 
            n.c < this.game.mapZones.rustStart 
        );

        for (let i = validNodes.length - 1; i > 0; i--) {
            const j = Math.floor(this.game.random() * (i + 1));
            [validNodes[i], validNodes[j]] = [validNodes[j], validNodes[i]];
        }

        const selectedNodes = validNodes.slice(0, 8);
        const highTiers = ['parlor', 'supply', 'fed_exchange', 'regional_hq', 'boomtown'];

        selectedNodes.forEach((node, index) => {
            if (node.subType === 'standard') {
                node.subType = highTiers[Math.floor(this.game.random() * highTiers.length)];
            }

            const baseVal = 50 + (node.c * 5); 
            const incomeVal = node.value + 40; 
            const mapLetter = String.fromCharCode(65 + index); 
            const pId = `private_${index}`;

            this.game.privateCompanies[pId] = {
                id: pId,
                name: `${node.name} Hub`,
                railheadId: node.id,
                nodes: [node.id],
                baseValue: baseVal,
                incomeValue: incomeVal, 
                purchasePrice: baseVal, 
                owner: null, 
                mapLabel: mapLetter
            };
        });
    }

    revealMap() {
        const builtSet = new Set();
        Object.values(this.game.companies).forEach(c => c.builtNodes.forEach(n => builtSet.add(n)));
        
        this.game.connections.forEach(conn => { 
            if (builtSet.has(conn.from)) this.revealNode(conn.to); 
            if (builtSet.has(conn.to)) this.revealNode(conn.from); 
        });

        this.game.nodes.filter(n => n.type === 'start').forEach(n => n.revealed = true);
        
        Object.values(this.game.privateCompanies || {}).forEach(pc => {
            this.revealNode(pc.railheadId);
        });
        
        builtSet.forEach(nodeId => {
            const node = this.game.nodes.find(n => n.id === nodeId);
            if (node.subType === 'signal') {
                this.game.connections.forEach(c => { 
                    if (c.from === nodeId) { 
                        this.revealNode(c.to); 
                        this.game.connections.forEach(c2 => { if (c2.from === c.to) this.revealNode(c2.to); }); 
                    }
                });
            }
        });
        
        if (this.game.runBonuses && this.game.runBonuses.surveyTeam > 0) {
            const startNodes = this.game.nodes.filter(n => n.type === 'start');
            startNodes.forEach(start => {
                this.game.nodes.forEach(n => {
                    const dx = n.x - start.x;
                    const dy = n.y - start.y;
                    if (Math.sqrt(dx*dx + dy*dy) < 300) n.revealed = true;
                });
            });
        }
    }

    revealNode(id) { 
        const n = this.game.nodes.find(node => node.id === id); 
        if (n) n.revealed = true; 
    }
}