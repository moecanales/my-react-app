// --- CONFIGURATION & STATIC DATA ---

const NODE_TYPES = {
    start: {
        name: "Headquarters", color: "#fff", shape: "circle", radius: 12, onBuild: null, 
        getDescription: (game, node) => {
            let ownerName = "";
            Object.keys(game.companies).forEach(k => {
                if (game.companies[k].headNode === node.id || (game.companies[k].builtNodes && game.companies[k].builtNodes[0] === node.id)) {
                    ownerName = game.companies[k].name;
                }
            });
            return `Headquarters: ${ownerName}`;
        }
    },
    chicago: {
        name: "CHICAGO", color: "#ffd700", shape: "circle", radius: 15,
        onBuild: (game, company, node) => {
            game.checkChicagoVictory(company);
        },
        getDescription: (game, node) => "The Destination! Ends the game if a continuous transcontinental link is complete."
    },
    detroit: {
        name: "Detroit", color: "#555", shape: "square", radius: 12, 
        onBuild: (game, company, node) => {
            company.trackSegments += 10;
            game.addLog(`${company.short} hits Detroit! +10 Rails!`, "good");
        },
        getDescription: (game, node) => "Iron City: +10 Track Segments."
    },
    financial: {
        name: "Cleveland", color: "#4dff4d", shape: "diamond", radius: 12,
        onBuild: (game, company, node) => {
            company.treasury += 40;
            game.addLog(`${company.short} hits Cleveland! +$40 Treasury!`, "good");
        },
        getDescription: (game, node) => "Financial Hub: +$40 to Treasury."
    },
    mountain: {
        name: "Mountain", color: "#aaa", shape: "triangle", radius: 8, onBuild: null,
        getDescription: (game, node) => "Difficult Terrain. Flat Tax Applied."
    },
    supply: {
        name: "Depot", color: "#eee", shape: "square",
        onBuild: (game, company, node) => {
            company.trackSegments += 3;
            game.addLog("Supply Depot: +3 Fuel.", "good");
        },
        getDescription: (game, node) => "Refuels +3 Track Segments."
    },
    union_yard: {
        name: "Union Yard", color: "#0ff", shape: "hexagon",
        onBuild: (game, company, node) => {
            Object.values(game.companies).forEach(c => c.trackSegments += 1);
            game.addLog("Union Yard: +1 Fuel to ALL.", "good");
        },
        getDescription: (game, node) => "+1 Track to ALL companies."
    },
    regional_hq: {
        name: "Reg. HQ", color: "#bf40bf", shape: "diamond",
        onBuild: (game, company, node) => {
            company.maxShares += 2;
            company.stockIndex = Math.max(0, company.stockIndex - 2);
            game.addLog("Regional HQ: " + company.short + " +2 Max Shares. Price DOWN (-2).", "good");
        },
        getDescription: (game, node) => "+2 Max Shares. Price drops 2 steps."
    },
    fed_exchange: {
        name: "Fed. Exch", color: "#4169e1", shape: "pentagon",
        onBuild: (game, company, node) => {
            Object.values(game.companies).forEach(c => {
                c.maxShares += 1;
                c.stockIndex = Math.max(0, c.stockIndex - 1);
            });
            game.addLog("Fed Exchange: +1 Max Share & Price DOWN (-1) to ALL.", "good");
        },
        getDescription: (game, node) => "+1 Max Share & Price drops 1 step to ALL."
    },
    boomtown: {
        name: "Boomtown", color: "#ff4444", shape: "star",
        onBuild: (game, company, node) => {
            Object.values(game.companies).forEach(c => {
                c.stockIndex = Math.min(CONFIG.marketTrack.length - 1, c.stockIndex + 1);
            });
            game.addLog("Boomtown: All Stocks moved RIGHT (Price Up!).", "good");
        },
        getDescription: (game, node) => "Increases Global Share Price by 1 Step."
    },
    merger: {
        name: "Merger", color: "#ffd700", shape: "diamond", trackCost: 1, 
        onBuild: (game, company, node) => {
            game.addLog(`${company.short} enters a MERGER! Select a proxy card.`, "good");
            game.queueEvent({ type: 'proxy', companyId: company.id });
        },
        getDescription: (game, node) => "Merger: Costs +1 Track to enter. Choose a discarded card to act as a Proxy for your next drawn card."
    },
    signal: {
        name: "Tower", color: "#0ff", shape: "triangle",
        onBuild: (game, company, node) => {},
        getDescription: (game, node) => "Observation Tower. Reveals Fog."
    },
    parlor: {
        name: "Parlor", color: "#e066ff", shape: "hexagon", radius: 10,
        onBuild: (game, company, node) => {
             game.queueEvent({ type: 'parlor' });
        },
        getDescription: (game, node) => "The Parlor. Build here to trigger a reward event."
    },
    standard: {
        name: "City", color: "#666", shape: "circle", onBuild: null,
        getDescription: (game, node) => "Standard City (Gray Node)."
    }
};

// 1. GREEN IDENTITY (Active Effects)
const GREEN_IDENTITY_DATA = {
    'A': { 
        name: "Legacy Plate", short: "LEGACY\nPLATE", 
        levels: {
            1: "You gain <strong>$25</strong> if this company builds from Headquarters or Union Yard.",
            2: "You gain <strong>$50</strong> if this company builds from Headquarters or Union Yard.",
            3: "You gain <strong>$75</strong> if this company builds from Headquarters or Union Yard."
        }
    },
    'B': { 
        name: "Refined I-Beam", short: "I-BEAM\nSTEEL", 
        levels: {
            1: "+$15 directly to this company's Treasury.",
            2: "+$30 directly to this company's Treasury.",
            3: "+$60 directly to this company's Treasury."
        }
    },
    'C': { 
        name: "The Master Rebate", short: "MASTER\nREBATE", 
        levels: {
            1: "Coupon: Waives the cost of 1 Blue Contract for You. (-$[P])",
            2: "Coupon: Waives the cost of 2 Blue Contracts for You. (-$[P] x2)",
            3: "Coupon: Waives the cost of 3 Blue Contracts for You. (-$[P] x3)"
        }
    },
    'D': { 
        name: "Townsite Subsidy", short: "TOWN\nSUBSIDY", 
        levels: {
            1: "You gain +$5 per Standard City in this company's network.",
            2: "You gain +$10 per Standard City in this company's network.",
            3: "You gain +$15 per Standard City in this company's network."
        }
    }
};

// 2. BLUE IDENTITY (Contract Fulfillment)
const BLUE_IDENTITY_DATA = {
    'A': { name: "Signal Rent", short: "SIGNAL\nRENT", levels: { 1: "Baron gains +$50 for every Signal Tower in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Signal Tower in this company's network." } },
    'B': { name: "Shareholder Tribute", short: "SHARE\nTRIBUTE", levels: { 1: "Baron gains +$40 for every Share Node (Reg HQ/Fed Ex) in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$40 per Share Node in this company's network." } },
    'C': { name: "Parlor Patronage", short: "PARLOR\nPATRON", levels: { 1: "Baron gains +$15 for every Parlor Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Parlor Node in this company's network." } },
    'D': { name: "City Surcharge", short: "CITY\nCHARGE", levels: { 1: "Baron gains +$15 for every Standard City in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Standard City in this company's network." } },
    'E': { name: "Maintenance Fee", short: "MAINT.\nFEE", levels: { 1: "Baron gains +$5 for every Built Track Segment owned by this company.", 2: "Clause Negated.", 3: "Rebate: You gain +$5 per Track Segment owned by this company." } },
    'F': { name: "Rust Tariff", short: "RUST\nTARIFF", levels: { 1: "Baron gains +$150 if this company builds into the Rust Belt.", 2: "Clause Negated.", 3: "Rebate: You gain +$150 if this company builds into the Rust Belt." } },
    'G': { name: "Mountain Toll", short: "MTN\nTOLL", levels: { 1: "Baron gains +$100 for every Mountain Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$100 per Mountain Node in this company's network." } },
    'H': { name: "Shareholder Tax", short: "SHARE\nTAX", levels: { 1: "Baron gains +$15 for every share issued (You + Baron).", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Share issued." } },
    'I': { name: "Depot Ground Rent", short: "DEPOT\nRENT", levels: { 1: "Baron gains +$50 for every Depot in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Depot in this company's network." } },
    'J': { name: "Federal Excise", short: "FED\nEXCISE", levels: { 1: "Baron gains +$50 for every Fed. Exchange in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Fed. Exchange in this company's network." } },
    'K': { name: "Regional Levy", short: "REGIONAL\nLEVY", levels: { 1: "Baron gains +$50 for every Regional HQ in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$50 per Regional HQ in this company's network." } },
    'L': { name: "Shared Hub Fee", short: "HUB\nFEE", levels: { 1: "Bank pays Baron +$50 for every node shared by this company and others.", 2: "Clause Negated.", 3: "Rebate: Bank pays You +$50 per Shared Hub." } },
    'M': { name: "Specialty Surcharge", short: "SPECIAL\nFEE", levels: { 1: "Baron gains +$15 for every Special Node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$15 per Special Node in this company's network." } },
    'N': { name: "Expansion Penalty", short: "EXPAND\nPENALTY", levels: { 1: "Baron gains +$10 for every total node in this company's network.", 2: "Clause Negated.", 3: "Rebate: You gain +$10 per Node in this company's network." } },
    'O': { name: "GN Acquisition", short: "GN\nBUY", levels: { 1: "The Baron buys a share of The Great Northern.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free GN share." } },
    'P': { name: "Treasury Match", short: "TREASURY\nMATCH", levels: { 1: "Bank pays Baron an amount equal to 75% of this company's Treasury.", 2: "Clause Negated.", 3: "Rebate: Bank pays You equal to 75% of this company's Treasury." } },
    'Q': { name: "OR&N Acquisition", short: "OR&N\nBUY", levels: { 1: "The Baron buys a share of The OR&N.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free OR&N share." } },
    'R': { name: "Inventory Holding", short: "STOCK\nHOLD", levels: { 1: "Baron gains +$20 for every unbuilt track segment held by this company.", 2: "Clause Negated.", 3: "Rebate: You gain +$20 per unbuilt track segment held by this company." } },
    'S': { name: "CP Acquisition", short: "CP\nBUY", levels: { 1: "The Baron buys a share of The Central Pacific.", 2: "Acquisition Clause Negated.", 3: "Hostile Takeover: You gain a free CP share." } },
    'T': { name: "Asset Surcharge", short: "ASSET\nFEE", levels: { 1: "Baron gains +$10 for every card in the Discard Piles.", 2: "Clause Negated.", 3: "Rebate: You gain +$10 per Discarded Card." } },
    'U': { name: "Trust Syndicate", short: "TRUST\nSYNC", levels: { 1: "Baron acquires the most expensive available Private Company.", 2: "Clause Negated.", 3: "Rebate: You acquire a random Private Company for FREE." } }
};

// 3. RED IDENTITY (Market Imports)
const RED_IDENTITY_DATA = {
    'A': { name: "Audit Purge", short: "AUDIT\nPURGE", levels: { 1: "Trash Card: Select 1 card in the Audit Ledger to permanently remove.", 2: "Trash Card: Select 2 cards to remove.", 3: "Trash Card: Select 4 cards to remove." } },
    'B': { name: "Industrial Espionage", short: "IND.\nSPY", levels: { 1: "Cash Grab: You instantly steal $50 from the Baron's wallet.", 2: "Cash Grab: You instantly steal $100 from the Baron.", 3: "Cash Grab: You instantly steal $200 from the Baron." } },
    'C': { name: "Structural Reform", short: "PRICE\nFIX", levels: { 1: "Price Fix: Permanently reduce base price of Blue cards by $1.", 2: "Price Fix: Permanently reduce base price of Blue cards by $2.", 3: "Price Fix: Permanently reduce base price of Blue cards by $4." } },
    'D': { name: "Vertical Integration", short: "MASS\nSUPPLY", levels: { 1: "This company receives 7 track segments instantly.", 2: "This company receives 14 track segments instantly.", 3: "This company receives 28 track segments instantly." } },
    'E': { name: "Panic on the Floor", short: "PANIC\nFLOOR", levels: { 1: "Hyper-Inflation: Double this company's Treasury.", 2: "Hyper-Inflation: Double 2 companies' Treasuries.", 3: "Hyper-Inflation: Double all companies' Treasuries." } },
    'F': { name: "Proxy Fight", short: "PROXY\nFIGHT", levels: { 1: "Hostile Liquidation: Baron sells all shares of his largest holding.", 2: "Hostile Liquidation: Baron sells top 2 holdings.", 3: "Hostile Liquidation: Baron sells all holdings." } },
    'G': { 
        name: "Charter Acquisition", short: "CHARTER\nBUY", 
        levels: { 
            1: "Action: Purchase an unowned Private Company from the map.", 
            2: "Action: Purchase a Private Company at a 20% discount.", 
            3: "Action: Purchase a Private Company. The Time Tax is waived." 
        } 
    }
};

// --- DATA: TYCOON PROFILES & CONTRACT TIERS ---
const TYCOON_PROFILES = [
    { 
        id: 'heavy', 
        name: 'Heavy Hauler', 
        high: 'prr', mid: 'bo', low: 'nyc',
        desc: 'UP High / ATSF Mid / CB&Q Low',
        apply: (game) => {
            game.companies['prr'].stockIndex = 5; 
            game.companies['bo'].stockIndex = 4; 
            game.companies['nyc'].stockIndex = 3;
        }
    },
    { 
        id: 'central', 
        name: 'Central Trade', 
        high: 'bo', mid: 'nyc', low: 'prr',
        desc: 'ATSF High / CB&Q Mid / UP Low',
        apply: (game) => {
            game.companies['bo'].stockIndex = 5; 
            game.companies['nyc'].stockIndex = 4; 
            game.companies['prr'].stockIndex = 3;
        }
    },
    { 
        id: 'local', 
        name: 'Local Growth', 
        high: 'nyc', mid: 'prr', low: 'bo',
        desc: 'CB&Q High / UP Mid / ATSF Low',
        apply: (game) => {
            game.companies['nyc'].stockIndex = 5; 
            game.companies['prr'].stockIndex = 4; 
            game.companies['bo'].stockIndex = 3;
        }
    }
];

const CONTRACT_MODELS = {
    'A': [ 
        { id: 't1', name: 'Conservative', minVol: 3, maxVol: 6, price: 8, margin: 2 },
        { id: 't2', name: 'Standard', minVol: 7, maxVol: 10, price: 7, margin: 3 },
        { id: 't3', name: 'Aggressive', minVol: 11, maxVol: 15, price: 5, margin: 5 }
    ],
    'B': [ 
        { id: 't1', name: 'Conservative', minVol: 5, maxVol: 8, price: 8, margin: 2 },
        { id: 't2', name: 'Standard', minVol: 9, maxVol: 12, price: 7, margin: 3 },
        { id: 't3', name: 'Aggressive', minVol: 13, maxVol: 17, price: 5, margin: 5 }
    ],
    'C': [ 
        { id: 't1', name: 'Conservative', minVol: 7, maxVol: 10, price: 8, margin: 2 },
        { id: 't2', name: 'Standard', minVol: 11, maxVol: 14, price: 7, margin: 3 },
        { id: 't3', name: 'Aggressive', minVol: 15, maxVol: 18, price: 5, margin: 5 }
    ],
    'D': [ 
        { id: 't1', name: 'Conservative', minVol: 9, maxVol: 12, price: 8, margin: 2 },
        { id: 't2', name: 'Standard', minVol: 13, maxVol: 16, price: 7, margin: 3 },
        { id: 't3', name: 'Aggressive', minVol: 17, maxVol: 20, price: 5, margin: 5 }
    ]
};

// --- STRATEGY BONUSES (Fixed missing logging parameters) ---
const STRATEGY_BONUSES = {
    treasury_high: { 
        id: 'treasury_high', 
        name: 'Capital Injection', 
        desc: 'High Tier Company gets +$25 Treasury.',
        activate: (game, high, mid, low) => { 
            game.companies[high].treasury += 25; 
            game.addLog(`Bonus: ${game.companies[high].name} gets +$25 Treasury.`, "good"); 
        } 
    },
    treasury_low: { 
        id: 'treasury_low', 
        name: 'Grant Aid', 
        desc: 'Low Tier Company gets +$30 Treasury.',
        activate: (game, high, mid, low) => { 
            game.companies[low].treasury += 30; 
            game.addLog(`Bonus: ${game.companies[low].name} gets +$30 Treasury.`, "good"); 
        } 
    },
    track_low: { 
        id: 'track_low', 
        name: 'Surplus Steel', 
        desc: 'Low Tier Company gets +3 Track Segments.',
        activate: (game, high, mid, low) => { 
            game.companies[low].trackSegments += 3; 
            game.addLog(`Bonus: ${game.companies[low].name} gets +3 Track.`, "good"); 
        } 
    },
    share_high: { 
        id: 'share_high', 
        name: 'Stock Split', 
        desc: 'High Tier Co: Max Shares +1, Price drops 1 step.',
        activate: (game, high, mid, low) => { 
            game.companies[high].maxShares += 1; 
            game.companies[high].stockIndex = Math.max(0, game.companies[high].stockIndex - 1); 
            game.addLog(`Bonus: ${game.companies[high].name} Max Shares +1. Price DOWN.`, "good"); 
        } 
    }
};

const REGIONAL_NAMES = {
    west_coast: [
        "Kent", "Kennedy", "Sundown", "Middleton", "Oak Creek", "Pine Junction", "Westwell", "Eastgate", 
        "Northport", "Southbury", "Greenfield", "Bluewood", "Clearford", "Fairgrove", "Millrun", "Rockdale", 
        "Riverview", "Lakehaven", "Springpeak", "Stoneside", "Ashmarsh", "Birchridge", "Cedar Hollow", 
        "Elmpoint", "Maplehill", "Willowland", "Glenstead", "Dalebridge", "Mount Mill", "Hillgate", 
        "Broadwell", "Crosswater", "Grandcliff", "Newton", "Oldmount", "Highfield", "Lowwood", "Midford", 
        "Centercity", "Silvercreek"
    ],
    basin: [
        "Goldgrove", "Copperdale", "Ironview", "Coalhaven", "Wheatpeak", "Cornside", "Woodmarsh", "Hayridge", 
        "Farmhollow", "Ranchpoint", "Plainhill", "Valeland", "Brookstead", "Creekbridge", "Marshmill", 
        "Fieldgate", "Heathwell", "Moorewater", "Wildcliff", "Ashbury", "Belview", "Blackwood", "Brightwater", 
        "Cedarville", "Clinton", "Crestwood", "Deerfield", "Dry Creek", "Eagle Point", "Edgewood", "Fairview", 
        "Forest Hill", "Franklin", "Georgetown", "Gladewater", "Granite Falls", "Hamilton", "Harvest", 
        "Hazelwood", "High Point"
    ],
    rockies: [
        "Hopewell", "Independence", "Jasper", "Kingston", "Lakeside", "Liberty", "Mapleton", "Mayfair", 
        "Millwood", "Newberry", "Oakdale", "Overlook", "Parkside", "Pleasanton", "Prospect", "Redford", 
        "Richfield", "Riverside", "Rockport", "Rosewood", "Sandy Creek", "Shady Grove", "Smithville", 
        "Sterling", "Stony Brook", "Summerfield", "Timberline", "Union", "Valley View", "Walnut Grove", 
        "Waterford", "Wayside", "Westbury", "Whitewater", "Willow Creek", "Woodville", "Yorktown", "Zenith", 
        "Alton", "Baxter"
    ],
    plains: [
        "Canton", "Dayton", "Eldon", "Fenton", "Grafton", "Hilton", "Ironton", "Jaxon", "Kelton", "Layton", 
        "Milton", "Norton", "Orton", "Paxton", "Quinton", "Royston", "Sexton", "Tilton", "Upton", "Vinton", 
        "Walton", "Yaxley", "Arcola", "Brooks", "Colfax", "Drexel", "Elroy", "Filmore", "Gentry", "Huxley", 
        "Inwood", "Judson", "Kirby", "Lennox", "Monroe", "Nesbit", "Otis", "Pike", "Quigley", "Ripley"
    ],
    rust_belt: [
        "Starke", "Thorpe", "Utley", "Vance", "Wythe", "Yates", "Bluebell", "Clover", "Driftwood", "Evergreen", 
        "Fernwood", "Graystone", "Hollowbrook", "Ironwood", "Juniper", "Knotty Pine", "Lone Oak", "Mossy Bank", 
        "Nightfall", "Owl’s Perch", "Pebblebrook", "Quiet Cove", "Raindrop", "Shadowmere", "Thistledown", 
        "Underhill", "Velvet Vale", "Windwhisper", "Yellowleaf", "Zephyr", "Alder", "Briar", "Clay", "Flint", 
        "Gorse", "Hawthorn", "Ivy", "Lark", "Meadow", "Reed"
    ]
};

const TOWN_PREFIXES = [
    'Oak', 'Pine', 'West', 'East', 'North', 'South', 'Green', 'Blue', 'Clear', 'Fair', 'Mill', 'Rock', 
    'River', 'Lake', 'Spring', 'Stone', 'Ash', 'Birch', 'Cedar', 'Elm', 'Maple', 'Willow', 'Glen', 'Dale', 
    'Mount', 'Hill', 'Broad', 'Cross', 'Grand', 'New', 'Old', 'High', 'Low', 'Mid', 'Center', 'Silver', 
    'Gold', 'Copper', 'Iron', 'Coal', 'Wheat', 'Corn', 'Wood', 'Hay', 'Farm', 'Ranch', 'Plain', 'Vale', 
    'Brook', 'Creek', 'Marsh', 'Field', 'Heath', 'Moore', 'Wild'
];

const TOWN_SUFFIXES = [
    'ton', 'ville', 'burg', 'bury', 'port', 'field', 'wood', 'ford', 'creek', 'grove', 'dale', 'view', 
    'haven', 'peak', 'side', 'marsh', 'ridge', 'hollow', 'point', 'land', 'stead', 'bridge', 'gate', 
    'mill', 'run', 'cross', 'well', 'water', 'cliff', 'mount'
];

const CONFIG = {
    companies: [
        // Index 0: TOP - The Great Northern (Green)
        { id: 'bo', name: 'The Great Northern', color: '#33A02C', short: 'GN', maxShares: 6, startTrack: 7 },
        
        // Index 1: MIDDLE - The OR&N (Cyan)
        { id: 'nyc', name: 'The OR&N', color: '#34B3D1', short: 'OR&N', maxShares: 4, startTrack: 5 },
    
        // Index 2: BOTTOM - The Central Pacific (Red)
        { id: 'prr', name: 'The Central Pacific', color: '#EF4444', short: 'CP', maxShares: 5, startTrack: 10 }
    ],
    marketTrack: [
        0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 
        80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 
        225, 250, 275, 300, 
        350, 400, 450, 500  
    ],
    startMarketIndex: 4,
    baseBuildCost: 20,
    startCash: 10, 
    maxTurns: 12,
    netWorthSafeLimit: 300,
    baronStartCash: 10, 
    canvasPadding: 50,
    railroadSteelPrice: 10,
    propertyBuyCost: 1
};

const TRACK_VISIBLE_SLOTS = 5; 
const IMPORT_BATCH_SIZE = 4; 
const SUPPLIER_COLORS = ['#c0392b', '#a93226', '#922b21', '#7b241c', '#641e16']; 
const SUPPLIER_NAMES = ["Baron Tier 1", "Baron Tier 2", "Baron Tier 3", "Baron Tier 4", "Baron Tier 5"];