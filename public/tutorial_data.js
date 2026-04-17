const TUTORIAL_STORYBOARD = {
    "storyboard": [
        {
            "id": 1,
            "ledger": { "year": 1, "playerCash": 100, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 20, "track": 3, "price": 25, "stockPrice": 25, "parValue": 25, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "stockPrice": 20, "parValue": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "A", "B", "D"],
            "dialogue": "[The Baron]: Welcome to the railroad business. I am the Baron. Look closely at the bottom right-hand corner of your screen: you have $100 in Personal Cash, and your Net Worth is $100. That is YOUR money. The railroad companies have their own separate Treasuries. Do not confuse the two! My goal is simple: I will amass a higher Net Worth than you. I will be nice and give you a safety threshold—but the moment your Net Worth crosses $300, if my wealth is higher than yours, I will launch a hostile takeover and seize everything.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "focusUI": ["hud-right-panel"],
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 2,
            "ledger": { "year": 1, "playerCash": 100, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 20, "track": 3, "price": 25, "stockPrice": 25, "parValue": 25, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "stockPrice": 20, "parValue": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "A", "B", "D"],
            "dialogue": "[The Baron]: Look at the companies on your screen. Central Pacific has track, but no shares available. O R and N has shares, but no track to build with. The Great Northern, however, has twenty dollars in its Treasury, three track segments, and one share available for twenty-five dollars. Spend your Personal Cash to buy that share now. This gives you controlling interest and puts cash in their Treasury.",
            "locks": { "endYear": true, "buyStock": false, "buildTrack": true },
            "focusUI": ["company-card-bo"],
            "focusMinor": ["company-card-prr", "company-card-nyc"],
            "highlightStats": true,
            "trigger": { "type": "onStockBought", "target": "gn" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 3,
            "ledger": { "year": 1, "playerCash": 75, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 45, "track": 3, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "stockPrice": 20, "parValue": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "A", "B", "D"],
            "dialogue": "[The Baron]: Excellent. Your Cash is now $75, but because GN's stock price rose to $30, your Net Worth actually increased to $105! More importantly, GN's Treasury is now $45, and since you own a share, you have the controlling interest to spend it. We need to build East toward Chicago. Look at the map. Seattle connects to a gray Standard City. Building there will cost GN $13, but it guarantees $15 in yearly income for its shareholders.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "focusNodes": [0, 28],
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": "4a",
            "ledger": { "year": 1, "playerCash": 75, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 45, "track": 3, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "stockPrice": 20, "parValue": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "A", "B", "D"],
            "dialogue": "[The Baron]: It is time to expand. But there is a catch. The company pays the bank for labor, but it must buy the physical Steel from YOU. Look at the Conveyor Belt below. To lay one unit of track, you must consume the right-most card. Right now, that is 'Townsite Subsidy'.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "trigger": { "type": "clickNext", "target": "" },
            "focusUI": ["steel-dashboard-container"],
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": "4b",
            "ledger": { "year": 1, "playerCash": 75, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 45, "track": 3, "price": 30, "stockPrice": 30, "parValue": 30, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "stockPrice": 20, "parValue": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "A", "B", "D"],
            "dialogue": "[The Baron]: But wait! You can click and swap cards of the same color. Swap 'Townsite Subsidy' with 'Legacy Plate'!",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "trigger": { "type": "onCardsSwapped", "target": "" },
            "focusUI": ["steel-dashboard-container"],
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 4.5,
            "ledger": { "year": 1, "playerCash": 75, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 45, "track": 3, "price": 30, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "green", "green", "green"],
            "beltLabels": ["E", "S", "D", "B", "A"],
            "dialogue": "[The Baron]: Excellent! Legacy Plate is now loaded in the consumption slot. It pays you $25 if you build out of a Headquarters! Click \"Build Track\" on GN, then click the highlighted Standard City to expand your empire.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "28" },
            "focusNodes": [0, 28],
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 5,
            "ledger": { "year": 1, "playerCash": 110, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 32, "track": 2, "price": 30, "playerShares": 1, "baronShares": 0, "income": 15, "maxShares": 1 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["blue", "blue", "blue", "green", "green"],
            "beltLabels": ["I", "E", "S", "D", "B"],
            "dialogue": "[The Baron]: Splendid. The Legacy Plate paid you $25, and the company paid you $10 for the steel. Notice your Personal Cash jumped to $110, pushing your Net Worth to $140! You are making money by forcing the company to buy your steel. Now, look at the next card on your belt: Refined I-Beam. If consumed, it injects $15 directly into the Company's Treasury. Click \"Build Track\" and connect the Standard City to the purple Regional HQ to the East. Watch GN's Treasury absorb the cost!",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "10" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 6,
            "ledger": { "year": 1, "playerCash": 120, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 31, "track": 1, "price": 20, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["red", "blue", "blue", "blue", "green"],
            "beltLabels": ["C", "I", "E", "S", "D"],
            "dialogue": "[The Baron]: The Refined I-Beam triggered, dumping $15 into GN's Treasury! More importantly, connecting to the Regional HQ expanded the company. It issued 2 new shares and the stock price dropped. GN needs to reach the Supply Depot to get more track, but it needs more capital to comfortably make the push. Buy another share of Great Northern now!",
            "locks": { "endYear": true, "buyStock": false, "buildTrack": true },
            "trigger": { "type": "onStockBought", "target": "gn" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 7,
            "ledger": { "year": 1, "playerCash": 100, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 51, "track": 1, "price": 20, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 3 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["red", "blue", "blue", "blue", "green"],
            "beltLabels": ["C", "I", "E", "S", "D"],
            "dialogue": "[The Baron]: GN has track remaining, but the Supply Depot is 2 units away. Building there will consume TWO cards from your belt, putting both 'Townsite Subsidy' and 'CP Acquisition' in the firing line! Click 'Build Track' on GN and select the Supply Depot to see what happens.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "13" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 7.5,
            "ledger": { "year": 1, "playerCash": 125, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 15, "track": 2, "price": 20, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 3 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["red", "red", "red", "blue", "blue"],
            "beltLabels": ["A", "B", "C", "I", "E"],
            "dialogue": "[The Baron]: Did you notice that? Great Northern only had one track segment, but the route required two! As long as a company has at least one track, the bank allows you to build into a track deficit. Fortunately, arriving at a Supply Depot immediately grants three track segments, wiping out your debt and leaving you with a surplus of two.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "focusUI": ["company-card-bo"],
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 8,
            "ledger": { "year": 1, "playerCash": 125, "baronCash": 100 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 30, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 0 },
                "gn": { "treasury": 15, "track": 2, "price": 20, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 3 },
                "orn": { "treasury": 0, "track": 0, "price": 20, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 2 }
            },
            "belt": ["red", "red", "red", "blue", "blue"],
            "beltLabels": ["A", "B", "C", "I", "E"],
            "dialogue": "[The Baron]: That blue CP Acquisition card just triggered! But wait... Central Pacific has no shares available to issue! The card fizzled and I got nothing! You got lucky. However, the other card consumed was your Townsite Subsidy, which paid you $5 for the standard gray city in Great Northern's network. Now you see why card order matters! Maximize your green benefits, and try to burn my blue tolls when their conditions can't be met. Next, build GN to the Federal Exchange. This node forces every company to issue a new share to the market, diluting their stock and instantly dropping their share prices.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "15" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 9,
            "ledger": { "year": 1, "playerCash": 135, "baronCash": 125 },
            "companies": {
                "cp": { "treasury": 45, "track": 1, "price": 25, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 1, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "blue"],
            "beltLabels": ["D", "A", "B", "C", "I"],
            "dialogue": "[The Baron]: The Exchange did its job, but my Maintenance Fee card just triggered! Don't worry—my blue card tolls are paid directly by the Bank. They don't come out of the company's treasury. It is time to pivot. CP and OR&N just issued new shares. OR&N is cheap, but it has no track to build with. Central Pacific, however, has track ready in San Francisco. Buy a share of CP so we can take control of it.",
            "locks": { "endYear": true, "buyStock": false, "buildTrack": true },
            "trigger": { "type": "onStockBought", "target": "cp" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 10,
            "ledger": { "year": 1, "playerCash": 110, "baronCash": 125 },
            "companies": {
                "cp": { "treasury": 70, "track": 1, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 1, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "blue"],
            "beltLabels": ["D", "A", "B", "C", "I"],
            "dialogue": "[The Baron]: You now control Central Pacific! There is a powerful Union Yard hidden further East down this line—it gives 1 free track to EVERY company, which will jumpstart OR&N later. Build CP from San Francisco to the nearby Supply Depot to push through the fog and gather the track segments we will need.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "29" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 11,
            "ledger": { "year": 1, "playerCash": 120, "baronCash": 175 },
            "companies": {
                "cp": { "treasury": 54, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 1, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["E", "D", "A", "B", "C"],
            "dialogue": "[The Baron]: Central Pacific reached the Depot, and the Depot Rent card just triggered! The Bank just printed a massive $50 and handed it directly to me! Since the Bank pays my tolls, CP's treasury is perfectly fine. Now, build from the Supply Depot to the Union Yard. The Union Yard is incredibly powerful; it grants 1 free track segment to every single company on the board.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "17" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 12,
            "ledger": { "year": 1, "playerCash": 130, "baronCash": 175 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 1, "price": 15, "playerShares": 0, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["F", "E", "D", "A", "B"],
            "dialogue": "[The Baron]: The Union Yard did its job! Look at the OR&N dashboard—it now has 1 track segment, even though it hasn't built anything yet! To start building with OR&N, you need to be a shareholder. Spend $15 to buy a share of OR&N now.",
            "locks": { "endYear": true, "buyStock": false, "buildTrack": true },
            "trigger": { "type": "onStockBought", "target": "orn" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 13,
            "ledger": { "year": 1, "playerCash": 115, "baronCash": 175 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 15, "track": 1, "price": 15, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["F", "E", "D", "A", "B"],
            "dialogue": "[The Baron]: Now that you control O R and N and have its treasury funded, build straight out of Portland to the adjacent pink Parlor node. The connection costs exactly $15, which is all the money the company has! The card in the firing line is 'Industrial Espionage'.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": false },
            "trigger": { "type": "onNodeBuilt", "target": "19" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 14,
            "ledger": { "year": 1, "playerCash": 155, "baronCash": 145 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["G", "F", "E", "D", "A"],
            "dialogue": "[The Baron]: Welcome to the Parlor! O R and N survived the build with exactly $0 in its treasury! Normally, a menu would appear here allowing you to upgrade your cards. But more importantly, the Espionage card triggered, stealing $50 straight from my wallet into yours! How infuriating. Click 'END YEAR' to finish your turn.",
            "locks": { "endYear": false, "buyStock": true, "buildTrack": true },
            "focusUI": ["btn-end-year"],
            "trigger": { "type": "onEndYear", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 15,
            "ledger": { "year": 1, "playerCash": 155, "baronCash": 145 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["G", "F", "E", "D", "A"],
            "dialogue": "[The Baron]: That brings us to the end of the year! Now that you've completed the tutorial, here is what you need to know for a real game. Before Year 1 even begins, you will pick your I.P.O. selection.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 16,
            "ledger": { "year": 2, "playerCash": 210, "baronCash": 130 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["G", "F", "E", "D", "A"],
            "dialogue": "[The Baron]: Your I.P.O. package dictates your starting stock prices, a special bonus, and your Steel Contract. This contract tells you exactly how many blue Contract cards you are mandatory to buy each year.",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        },
        {
            "id": 17,
            "ledger": { "year": 2, "playerCash": 210, "baronCash": 130 },
            "companies": {
                "cp": { "treasury": 37, "track": 3, "price": 25, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 1 },
                "gn": { "treasury": 0, "track": 2, "price": 15, "playerShares": 2, "baronShares": 0, "income": 0, "maxShares": 4 },
                "orn": { "treasury": 0, "track": 0, "price": 15, "playerShares": 1, "baronShares": 0, "income": 0, "maxShares": 3 }
            },
            "belt": ["red", "red", "red", "red", "red"],
            "beltLabels": ["G", "F", "E", "D", "A"],
            "dialogue": "[The Baron]: Aggressive contracts push stock prices higher, but force you into painful purple cards if you fall behind. You are now ready to face the real iron network. Click 'Got it' to return to the main menu!",
            "locks": { "endYear": true, "buyStock": true, "buildTrack": true },
            "trigger": { "type": "clickNext", "target": "" },
            "nodes": [
                { "id": 0, "c": 0, "r": 3, "type": "start", "subType": "start", "name": "Seattle", "value": 5, "revealed": true },
                { "id": 1, "c": 0, "r": 5, "type": "start", "subType": "start", "name": "Portland", "value": 5, "revealed": true },
                { "id": 2, "c": 0, "r": 7, "type": "start", "subType": "start", "name": "San Francisco", "value": 5, "revealed": true },
                { "id": 10, "c": 2, "r": 3, "type": "city", "subType": "regional_hq", "name": "Reg. HQ", "value": 15, "revealed": true },
                { "id": 13, "c": 4, "r": 3, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true },
                { "id": 15, "c": 5, "r": 3, "type": "city", "subType": "fed_exchange", "name": "Fed. Exch", "value": 20, "revealed": true },
                { "id": 17, "c": 2, "r": 7, "type": "city", "subType": "union_yard", "name": "Union Yard", "value": 10, "revealed": true },
                { "id": 19, "c": 1, "r": 5, "type": "city", "subType": "parlor", "name": "Parlor", "value": 15, "revealed": true },
                { "id": 28, "c": 1, "r": 3, "type": "city", "subType": "standard", "name": "Standard City", "value": 15, "revealed": true },
                { "id": 29, "c": 1, "r": 7, "type": "city", "subType": "supply", "name": "Supply Depot", "value": 5, "revealed": true }
            ],
            "connections": [
                { "from": 0, "to": 28, "cost": 1, "variance": -2, "units": 1 },
                { "from": 10, "to": 28, "cost": 1, "variance": 1, "units": 1 },
                { "from": 10, "to": 13, "cost": 2, "variance": 3, "units": 2 },
                { "from": 13, "to": 15, "units": 1 },
                { "from": 1, "to": 19, "cost": 1, "variance": 0, "units": 1 },
                { "from": 2, "to": 29, "cost": 2, "variance": 1, "units": 1 },
                { "from": 17, "to": 29, "cost": 3, "variance": 2, "units": 1 }
            ]
        }
    ]
};