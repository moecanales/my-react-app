// ============================================================================
// TIGER TALLY: MANDATE OF CHAOS — Master Game Data
// Romance of the Three Kingdoms × The Bazaar × Stacklands × HoMM × LOTR2
// ============================================================================

window.TIGER_DATA = {
  SEASONS: [
    { id: 'spring', name: 'Spring Planting', icon: '🌸', grainMod: 1.15, desc: '+15% Rice Paddy Harvest · Refugees travel roads' },
    { id: 'summer', name: 'Summer Campaign', icon: '☀️', grainMod: 1.0,  desc: 'Fire Attacks +20% DMG · Normal Harvest' },
    { id: 'autumn', name: 'Autumn Bumper Harvest', icon: '🍂', grainMod: 1.5, desc: '+50% Rice Paddy Harvest · Bazaar Caravans full' },
    { id: 'winter', name: 'Bitter Northern Winter', icon: '❄️', grainMod: 0.6, desc: '-40% Rice Paddy Harvest · Rations crucial for morale' }
  ],

  RATION_LEVELS: [
    { id: 'meager',   label: 'Meager (0.5x)',   mult: 0.5, orderDelta: -10, moraleBonus: -8 },
    { id: 'normal',   label: 'Normal (1.0x)',   mult: 1.0, orderDelta: +2,  moraleBonus: 0  },
    { id: 'generous', label: 'Generous (1.5x)', mult: 1.5, orderDelta: +8,  moraleBonus: +8 },
    { id: 'feast',    label: 'Feast (2.0x)',    mult: 2.0, orderDelta: +15, moraleBonus: +16 }
  ],

  TAX_RATES: [
    { id: 'none',     label: '0% Benevolent', goldPer10Pop: 0,  orderDelta: +7 },
    { id: 'light',    label: '8% Light',      goldPer10Pop: 10, orderDelta: +1 },
    { id: 'standard', label: '15% Standard',  goldPer10Pop: 19, orderDelta: -5 },
    { id: 'heavy',    label: '25% Ruthless',  goldPer10Pop: 32, orderDelta: -14 }
  ],

  WARLORDS: [
    {
      id: 'liubei',
      name: 'Liu Bei (Xuande)',
      title: 'Benevolent Scion of Han',
      crest: '仁',
      color: '#10b981',
      doctrineName: 'Peach Garden Virtue',
      doctrineDesc: 'County Order ≥ 70 attracts +15 bonus volunteer Peasants every Season. Officers attached to adjacent slots grant each other +18% DMG & +10 Morale.',
      startingOfficers: ['guanyu', 'jiianyong'],
      startResources: { gold: 130, grain: 140, iron: 24, wood: 28, peasants: 60, order: 80 },
      startArmory: { spear: 20, shield: 10, crossbow: 0, halberd: 0, horse: 0, catapult: 0 },
      startWarband: [
        { kind: 'unit', unitId: 'spearman', count: 24, officerId: 'guanyu' },
        { kind: 'relic', relicId: 'war_drum' },
        { kind: 'unit', unitId: 'militia', count: 20, officerId: null }
      ]
    },
    {
      id: 'caocao',
      name: 'Cao Cao (Mengde)',
      title: 'Grand Strategist of Wei',
      crest: '霸',
      color: '#3b82f6',
      doctrineName: 'Tuntian Garrison Colonies',
      doctrineDesc: 'Mustered Army Soldiers farm their own rations (+4 Grain per 10 troops every Season!). Conscription County Order penalty is halved (-3 instead of -6).',
      startingOfficers: ['xiahoudun', 'guojia'],
      startResources: { gold: 165, grain: 135, iron: 30, wood: 26, peasants: 60, order: 68 },
      startArmory: { spear: 10, shield: 20, crossbow: 10, halberd: 0, horse: 10, catapult: 0 },
      startWarband: [
        { kind: 'unit', unitId: 'vanguard', count: 22, officerId: 'xiahoudun' },
        { kind: 'relic', relicId: 'mengde_scroll' },
        { kind: 'unit', unitId: 'light_cav', count: 14, officerId: null }
      ]
    },
    {
      id: 'sunquan',
      name: 'Sun Quan (Zhongmou)',
      title: 'Jade-Eyed Tiger of Wu',
      crest: '炎',
      color: '#ef4444',
      doctrineName: 'Yangtze River Arsenals',
      doctrineDesc: 'Silk Road Bazaar offers 25% cheaper prices & +1 item. All Burn / Fire arrow effects deal +45% extra scorch damage.',
      startingOfficers: ['zhouyu', 'huanggai'],
      startResources: { gold: 185, grain: 130, iron: 26, wood: 36, peasants: 55, order: 72 },
      startArmory: { spear: 10, shield: 10, crossbow: 20, halberd: 0, horse: 0, catapult: 0 },
      startWarband: [
        { kind: 'unit', unitId: 'vanguard', count: 18, officerId: 'huanggai' },
        { kind: 'relic', relicId: 'brazier_cart' },
        { kind: 'unit', unitId: 'crossbow', count: 24, officerId: 'zhouyu' }
      ]
    },
    {
      id: 'mateng',
      name: 'Ma Teng (Shoucheng)',
      title: 'Iron Horse-Lord of Xiliang',
      crest: '騎',
      color: '#f59e0b',
      doctrineName: 'Thunder of the Western Steppes',
      doctrineDesc: 'Northern Pastures breed 2× Warhorses per harvest! All Cavalry Stacks gain +22% Charge Damage and +15% Cooldown Haste.',
      startingOfficers: ['machao', 'pangde'],
      startResources: { gold: 125, grain: 145, iron: 28, wood: 24, peasants: 55, order: 70 },
      startArmory: { spear: 20, shield: 0, crossbow: 0, halberd: 10, horse: 20, catapult: 0 },
      startWarband: [
        { kind: 'unit', unitId: 'light_cav', count: 20, officerId: 'machao' },
        { kind: 'relic', relicId: 'ferghana_banner' },
        { kind: 'unit', unitId: 'heavy_cav', count: 12, officerId: 'pangde' }
      ]
    }
  ],

  OFFICERS: {
    guanyu: {
      id: 'guanyu', name: 'Guan Yu', courtesy: 'Yunchang', seal: '關', color: '#059669',
      war: 98, int: 76, pol: 64, cha: 94, cost: 135,
      traitName: 'Green Dragon Crescent',
      battleDesc: 'First strike deals 2.0× Crit! Slaying an enemy stack grants +18 Morale & 35% instant Cooldown to adjacent stacks.',
      governDesc: 'Overseeing Smithy or Training boosts output by +35%.'
    },
    zhangfei: {
      id: 'zhangfei', name: 'Zhang Fei', courtesy: 'Yide', seal: '張', color: '#dc2626',
      war: 99, int: 38, pol: 28, cha: 62, cost: 130,
      traitName: 'Roar at Changban Bridge',
      battleDesc: 'At battle start, stuns the opposing enemy Frontline for 2.5s and shatters -12 Enemy Morale.',
      governDesc: 'Poor administrator, peerless vanguard breaker.'
    },
    zhaoyun: {
      id: 'zhaoyun', name: 'Zhao Yun', courtesy: 'Zilong', seal: '趙', color: '#0ea5e9',
      war: 96, int: 77, pol: 66, cha: 89, cost: 135,
      traitName: 'Seven Times In & Out',
      battleDesc: 'Evades 25% of incoming damage; each strike restores 15% Shield to self and Hastes Right neighbor.',
      governDesc: 'Balanced prefecture patrol (+5 County Order).'
    },
    zhugeliang: {
      id: 'zhugeliang', name: 'Zhuge Liang', courtesy: 'Kongming', seal: '孔', color: '#14b8a6',
      war: 42, int: 100, pol: 96, cha: 92, cost: 160,
      traitName: 'Sleeping Dragon\'s Bagua',
      battleDesc: '+50% Tactics Qi Regen! Every 2nd volley of led/adjacent Ranged stack fires a bonus volley.',
      governDesc: 'Supreme Chancellor: +60% Building Yield where assigned!'
    },
    jiianyong: {
      id: 'jiianyong', name: 'Jian Yong', courtesy: 'Xianhe', seal: '簡', color: '#10b981',
      war: 36, int: 72, pol: 78, cha: 84, cost: 70,
      traitName: 'Jovial Envoy',
      battleDesc: 'Grants +12% Cooldown Haste to adjacent allies.',
      governDesc: '+35% Paddy/Lumber yield & +4 County Order when governing.'
    },
    xiahoudun: {
      id: 'xiahoudun', name: 'Xiahou Dun', courtesy: 'Yuanrang', seal: '夏', color: '#2563eb',
      war: 92, int: 62, pol: 70, cha: 82, cost: 115,
      traitName: 'Swallowed Eye Fury',
      battleDesc: 'Whenever this stack loses HP, retaliates for 45% of its Attack immediately!',
      governDesc: 'Disciplined garrison magistrate (+25% Iron/Smithy yield).'
    },
    guojia: {
      id: 'guojia', name: 'Guo Jia', courtesy: 'Fengxiao', seal: '郭', color: '#6366f1',
      war: 24, int: 98, pol: 84, cha: 78, cost: 135,
      traitName: 'Ten Victories Foresight',
      battleDesc: '+40% Tactics Qi Regen; exposes enemies (+18% damage taken by struck target).',
      governDesc: '+45% Strategist Pavilion / Tax efficiency.'
    },
    zhangliao: {
      id: 'zhangliao', name: 'Zhang Liao', courtesy: 'Wenyuan', seal: '遼', color: '#3b82f6',
      war: 94, int: 82, pol: 68, cha: 85, cost: 130,
      traitName: 'Terror of Xiaoyao Ford',
      battleDesc: 'Strikes reduce enemy Morale by -6 and Haste adjacent Cavalry by +25%.',
      governDesc: 'Veteran border warden.'
    },
    dianwei: {
      id: 'dianwei', name: 'Dian Wei', courtesy: 'Ancient惡來', seal: '典', color: '#1d4ed8',
      war: 97, int: 35, pol: 30, cha: 58, cost: 120,
      traitName: 'Twin Iron Halberds',
      battleDesc: 'Grants +35 Shield per 10 troops at battle start to self and Left neighbor.',
      governDesc: 'Fierce bodyguard.'
    },
    zhouyu: {
      id: 'zhouyu', name: 'Zhou Yu', courtesy: 'Gongjin', seal: '周', color: '#ef4444',
      war: 76, int: 97, pol: 86, cha: 93, cost: 145,
      traitName: 'Maestro of Red Cliffs',
      battleDesc: 'All attacks by this stack & adjacent stacks inflict Burn! +35% Tactics Qi Regen.',
      governDesc: '+45% Timber/Smithy efficiency & melodious court harmony.'
    },
    huanggai: {
      id: 'huanggai', name: 'Huang Gai', courtesy: 'Gongfu', seal: '蓋', color: '#b91c1c',
      war: 86, int: 68, pol: 64, cha: 79, cost: 95,
      traitName: 'Bitter-Flesh Fire Ship',
      battleDesc: 'Gains +30% Armor; strikes splash Scorch fire across 2 enemy stacks.',
      governDesc: 'Strict drillmaster (+25% Iron/Lumber output).'
    },
    ganning: {
      id: 'ganning', name: 'Gan Ning', courtesy: 'Xingba', seal: '甘', color: '#f97316',
      war: 95, int: 74, pol: 42, cha: 72, cost: 125,
      traitName: 'Silken Sails Night Raid',
      battleDesc: 'Bypasses Castle Walls & Frontline to snipe the furthest backline enemy stack!',
      governDesc: 'River corsair.'
    },
    sunshangxiang: {
      id: 'sunshangxiang', name: 'Sun Shangxiang', courtesy: 'Bow-Maiden', seal: '尚', color: '#ec4899',
      war: 87, int: 75, pol: 65, cha: 86, cost: 110,
      traitName: 'jade-Bow Escort',
      battleDesc: '+30% Cooldown Haste on Ranged stacks; heals adjacent Officer stacks slightly on volley.',
      governDesc: 'Inspiring noble (+30% Pasture/Smithy output).'
    },
    machao: {
      id: 'machao', name: 'Ma Chao', courtesy: 'Mengqi', seal: '馬', color: '#f59e0b',
      war: 97, int: 58, pol: 46, cha: 84, cost: 135,
      traitName: 'Splendid Silver Spear',
      battleDesc: '+35% Cavalry Charge DMG! Tramples excess overkill damage onto the next enemy stack.',
      governDesc: '+40% Pasture horse breeding.'
    },
    pangde: {
      id: 'pangde', name: 'Pang De', courtesy: 'Lingming', seal: '龐', color: '#d97706',
      war: 94, int: 66, pol: 54, cha: 74, cost: 115,
      traitName: 'Coffin-Bearing Resolve',
      battleDesc: 'Immune to Morale Rout; deals +40% bonus damage to Shielded foes & Castle Gates.',
      governDesc: 'Stalwart frontier captain.'
    },
    huangzhong: {
      id: 'huangzhong', name: 'Huang Zhong', courtesy: 'Hansheng', seal: '黃', color: '#eab308',
      war: 94, int: 68, pol: 58, cha: 78, cost: 125,
      traitName: 'Hundred-Pace Piercing Arrow',
      battleDesc: 'Ignores Castle Wall cover! +35% Crit chance against enemy Commander stacks.',
      governDesc: 'Venerable elder.'
    },
    diaochan: {
      id: 'diaochan', name: 'Diaochan', courtesy: 'Moon-Blush', seal: '貂', color: '#a855f7',
      war: 38, int: 86, pol: 82, cha: 99, cost: 120,
      traitName: 'Chain-of-Beauty Discord',
      battleDesc: 'Slows the highest-WAR enemy stack by -35% Cooldown Speed and charms -10 Enemy Morale.',
      governDesc: '+8 County Order per Season when governing!'
    },
    xuhuang: {
      id: 'xuhuang', name: 'Xu Huang', courtesy: 'Gongming', seal: '徐', color: '#60a5fa',
      war: 91, int: 74, pol: 66, cha: 78, cost: 110,
      traitName: 'Great Battleaxe Cleave',
      battleDesc: 'Shatters 60% of target Shield before dealing damage.',
      governDesc: 'Orderly camp quartermaster.'
    },
    taishici: {
      id: 'taishici', name: 'Taishi Ci', courtesy: 'Ziyi', seal: '慈', color: '#fb7185',
      war: 94, int: 70, pol: 60, cha: 83, cost: 125,
      traitName: 'Twin Halberd & Bow',
      battleDesc: 'Strikes BOTH frontline and a random backline enemy stack for 65% DMG each!',
      governDesc: 'Filial protector.'
    },
    lubu: {
      id: 'lubu', name: 'Lu Bu', courtesy: 'Fengxian', seal: '呂', color: '#dc2626',
      war: 100, int: 32, pol: 20, cha: 45, cost: 210,
      traitName: 'Sky-Piercer & Red Hare',
      battleDesc: '100 WAR Titan! Sweeps up to 2 adjacent enemy stacks for +45% cleave damage.',
      governDesc: 'Restless warlord (-3 County Order if idle).'
    }
  },

  ARMORY_ITEMS: {
    spear:    { id: 'spear',    name: 'Ash Longspears',      icon: '🔱', wood: 6,  iron: 4,  batch: 10, val: 22 },
    shield:   { id: 'shield',   name: 'Lamellar Shields',    icon: '🛡️', wood: 4,  iron: 10, batch: 10, val: 28 },
    crossbow: { id: 'crossbow', name: 'Chu-Ko-Nu Crossbows', icon: '🏹', wood: 8,  iron: 6,  batch: 10, val: 30 },
    halberd:  { id: 'halberd',  name: 'Heavy Ji Halberds',   icon: '⚔️', wood: 6,  iron: 12, batch: 10, val: 36 },
    horse:    { id: 'horse',    name: 'Warhorses',           icon: '🐎', wood: 0,  iron: 0,  batch: 10, val: 34, bredAtPasture: true },
    catapult: { id: 'catapult', name: 'Thunderbolt Frames',  icon: '☄️', wood: 14, iron: 10, batch: 4,  val: 45 }
  },

  UNITS: {
    militia: {
      id: 'militia', name: 'Yellow-Scarf Militia', icon: '🌾', role: 'Infantry Levy',
      hpPerSoldier: 38, atkPerSoldier: 3.4, cd: 2.7, ranged: false, cavalry: false, siege: false,
      peasantsReq: 10, gearReq: {}, batchSize: 10,
      synergyDesc: 'Swarm Levy: Gains +12% Haste if adjacent to an Officer-led stack.'
    },
    spearman: {
      id: 'spearman', name: 'Longspear Phalanx', icon: '🔱', role: 'Anti-Cav Pike',
      hpPerSoldier: 56, atkPerSoldier: 5.0, cd: 2.9, ranged: false, cavalry: false, siege: false,
      peasantsReq: 10, gearReq: { spear: 10 }, batchSize: 10,
      synergyDesc: 'Pike Wall: Deals +55% bonus DMG vs Cavalry & grants +15% Armor to Left/Right neighbors.'
    },
    vanguard: {
      id: 'vanguard', name: 'Ironclad Shieldguard', icon: '🛡️', role: 'Heavy Frontline',
      hpPerSoldier: 82, atkPerSoldier: 4.6, cd: 3.2, ranged: false, cavalry: false, siege: false,
      peasantsReq: 10, gearReq: { shield: 10 }, batchSize: 10,
      synergyDesc: 'Tortoise Formation: Each activation grants Shield to self AND adjacent slots!'
    },
    crossbow: {
      id: 'crossbow', name: 'Chu-Ko-Nu Marksmen', icon: '🏹', role: 'Repeating Ranged',
      hpPerSoldier: 42, atkPerSoldier: 6.0, cd: 2.8, ranged: true, cavalry: false, siege: false,
      peasantsReq: 10, gearReq: { crossbow: 10 }, batchSize: 10,
      synergyDesc: 'Ranged Volley: Shoots over Castle Walls! Ignites bolts if adjacent to Fire/Brazier.'
    },
    light_cav: {
      id: 'light_cav', name: 'White-Feather Riders', icon: '🐎', role: 'Flanking Cavalry',
      hpPerSoldier: 64, atkPerSoldier: 6.8, cd: 2.5, ranged: false, cavalry: true, siege: false,
      peasantsReq: 10, gearReq: { horse: 10, spear: 10 }, batchSize: 10,
      synergyDesc: 'Flanking Sweep: Once enemy Gate falls, dives enemy Ranged backline for +35% DMG!'
    },
    heavy_cav: {
      id: 'heavy_cav', name: 'Tiger-Leopard Cavalry', icon: '🐆', role: 'Elite Shock Cav',
      hpPerSoldier: 94, atkPerSoldier: 9.2, cd: 3.1, ranged: false, cavalry: true, siege: false,
      peasantsReq: 10, gearReq: { horse: 10, halberd: 10 }, batchSize: 10,
      synergyDesc: 'Thunder Charge: Massive shock blow; Hastes adjacent Cavalry by +15%.'
    },
    catapult: {
      id: 'catapult', name: 'Thunderbolt Catapults', icon: '☄️', role: 'Siege Artillery',
      hpPerSoldier: 135, atkPerSoldier: 18.5, cd: 4.2, ranged: true, cavalry: false, siege: true,
      peasantsReq: 10, gearReq: { catapult: 4 }, batchSize: 4,
      synergyDesc: 'Wall Breaker: Deals 3.5× DMG to Castle Walls & splashes 40% boulder AoE to neighbors!'
    }
  },

  RELICS: {
    brazier_cart: {
      id: 'brazier_cart', name: 'Pitch-Oil Brazier Cart', icon: '🔥', cost: 85,
      cd: 3.8, activeEffect: 'hurl_oil',
      desc: 'Bazaar Adjacency: Adjacent Troop Stacks imbue attacks with Scorch Burn! Every 3.8s hurls flaming pitch at enemies.'
    },
    war_drum: {
      id: 'war_drum', name: 'Bronze Thunder War-Drum', icon: '🥁', cost: 90,
      cd: 3.4, activeEffect: 'drum_rally',
      desc: 'Bazaar Adjacency: Adjacent Stacks gain +25% Cooldown Haste! Pulses +5 Morale & Shield to neighbors every 3.4s.'
    },
    wooden_ox: {
      id: 'wooden_ox', name: 'Kongming\'s Wooden Ox', icon: '🐂', cost: 95,
      cd: 3.6, activeEffect: 'supply_heal',
      desc: 'Bazaar Adjacency: Heals & restores fallen soldiers\' HP in adjacent Stacks every 3.6s! Generates +12 Grain/Season.'
    },
    mengde_scroll: {
      id: 'mengde_scroll', name: 'Mengde\'s Art of War', icon: '📜', cost: 95,
      cd: 4.0, activeEffect: 'qi_surge',
      desc: 'Bazaar Adjacency: Adjacent Stacks gain +22% Attack DMG! Generates +12 Tactics Qi every 4.0s.'
    },
    ferghana_banner: {
      id: 'ferghana_banner', name: 'Heavenly Steed Standard', icon: '🚩', cost: 85,
      cd: 3.5, activeEffect: 'cav_spur',
      desc: 'Bazaar Adjacency: Adjacent Stacks gain +20% Haste (+35% if Cavalry) & +20% Crit Strike!'
    },
    bagua_mirror: {
      id: 'bagua_mirror', name: 'Eight-Trigrams Mirror', icon: '☯️', cost: 105,
      cd: 3.9, activeEffect: 'ward_pulse',
      desc: 'Bazaar Adjacency: Grants adjacent Stacks 22% Damage Reduction & pulses jade Barriers every 3.9s.'
    },
    ballista_wagon: {
      id: 'ballista_wagon', name: 'Repeating Siege Arbalest', icon: '🎯', cost: 100,
      cd: 2.9, activeEffect: 'snipe_bolt',
      desc: 'Fires heavy iron bolts for 95 piercing DMG (2× vs Walls). Adjacent Ranged Stacks gain +20% DMG.'
    },
    peach_wine_cart: {
      id: 'peach_wine_cart', name: 'Oath-Wine Amphora Cart', icon: '🍶', cost: 80,
      cd: 3.7, activeEffect: 'wine_courage',
      desc: 'Bazaar Adjacency: Adjacent Officer-led Stacks deal +30% DMG and cannot be Stunned or Routed!'
    }
  },

  BUILDINGS: [
    {
      id: 'paddy', name: 'Terraced Rice Paddy', upgName: 'Imperial Canal Granary', icon: '🌾',
      statKey: 'pol', maxSlots: 3, upgCost: { gold: 80, wood: 14 },
      desc: 'Assign 10-Peasant stacks to harvest Grain every Watch/Season (scales with Season & POL).'
    },
    {
      id: 'iron_mine', name: 'Mountain Iron Pit', upgName: 'Blast-Bellows Foundry', icon: '⛏️',
      statKey: 'pol', maxSlots: 2, upgCost: { gold: 85, wood: 16 },
      desc: 'Smelts Iron Ingots needed for Spears, Lamellar Shields, Halberds, & Catapults.'
    },
    {
      id: 'lumber', name: 'Bamboo & Oak Forest', upgName: 'Imperial Timberworks', icon: '🎋',
      statKey: 'pol', maxSlots: 2, upgCost: { gold: 75, iron: 10 },
      desc: 'Fells seasoned hardwood for Chu-Ko-Nu Crossbows, Shafts, & Siege Frames.'
    },
    {
      id: 'pasture', name: 'Northern Horse Pasture', upgName: 'Ferghana Royal Stables', icon: '🐎',
      statKey: 'cha', maxSlots: 2, upgCost: { gold: 95, wood: 18 },
      desc: 'Converts Grain + Peasant grooms into Warhorses at Season harvest!'
    },
    {
      id: 'smithy', name: 'Prefecture Blacksmith', upgName: 'Imperial Grand Arsenal', icon: '⚒️',
      statKey: 'pol', maxSlots: 2, upgCost: { gold: 100, iron: 14 },
      desc: 'Overseer & Artisans reduce Armory forging Iron/Wood cost (-20% at Tier 2) & forge bonus gear!'
    },
    {
      id: 'pavilion', name: 'Strategist Pavilion', upgName: 'Eight-Trigrams Altar', icon: '🏯',
      statKey: 'int', maxSlots: 1, upgCost: { gold: 110, wood: 14 },
      desc: 'Unlocks +1 Warband Formation Slot at Tier 2! Boosts starting Battle Tactics Qi & County Order.'
    }
  ],

  STRATAGEMS: [
    {
      id: 'fire_attack', name: 'Southern Wind Fire', icon: '🔥', qiCost: 35,
      desc: 'Engulfs all enemy stacks in blazing fire (instant AoE DMG + heavy Scorch Burn over time).'
    },
    {
      id: 'war_drums', name: 'Thunderous Drums', icon: '🥁', qiCost: 30,
      desc: 'Surges all allied action bars forward by +45% immediately and grants +15 Morale!'
    },
    {
      id: 'stone_maze', name: 'Stone Sentinel Maze', icon: '🪨', qiCost: 40,
      desc: 'Traps & stuns all enemy stacks for 2.6 seconds while sapping -12 Enemy Morale.'
    },
    {
      id: 'straw_boats', name: 'Straw-Boat Ward', icon: '⛵', qiCost: 32,
      desc: 'Grants massive Shield to all allied stacks and immediately triggers allied Ranged stacks!'
    },
    {
      id: 'flood_seven', name: 'Flood Seven Armies', icon: '🌊', qiCost: 45,
      desc: 'Crushes 350 Castle Wall HP, strips all enemy Shields, and slows enemies!'
    }
  ],

  CAMPAIGN_NODES: [
    // ACT I — 184 AD: Yellow Turban Rebellion
    {
      step: 1, act: 1, name: 'Outskirts of Yingchuan', boss: false, wallHp: 0,
      rewardGold: 75, rewardGrain: 45, enemyGeneral: { name: 'Bo Cai', war: 72, int: 45, seal: '波', lootRelic: 'war_drum' },
      enemies: [
        { unitId: 'militia', count: 30 },
        { unitId: 'spearman', count: 22 },
        { unitId: 'crossbow', count: 18 }
      ]
    },
    {
      step: 2, act: 1, name: 'Guangzong Stockade', boss: false, wallHp: 220,
      rewardGold: 95, rewardGrain: 55, enemyGeneral: { name: 'Zhang Bao', war: 81, int: 74, seal: '寶', recruitId: 'xuhuang' },
      enemies: [
        { unitId: 'spearman', count: 22 },
        { unitId: 'vanguard', count: 16 },
        { unitId: 'crossbow', count: 18 }
      ]
    },
    {
      step: 3, act: 1, name: 'Altar of Yellow Heaven (Act I Siege)', boss: true, wallHp: 460,
      rewardGold: 145, rewardGrain: 80, enemyGeneral: { name: 'Zhang Jiao, Way of Peace', war: 76, int: 92, seal: '角', recruitId: 'zhaoyun' },
      enemies: [
        { unitId: 'vanguard', count: 24 },
        { unitId: 'spearman', count: 26 },
        { unitId: 'crossbow', count: 24 },
        { unitId: 'catapult', count: 4 }
      ]
    },
    // ACT II — 190 AD: Hulao Gate & Tyrant Dong Zhuo
    {
      step: 4, act: 2, name: 'Sishui Pass Outpost', boss: false, wallHp: 340,
      rewardGold: 130, rewardGrain: 70, enemyGeneral: { name: 'Hua Xiong', war: 92, int: 52, seal: '華', recruitId: 'taishici' },
      enemies: [
        { unitId: 'vanguard', count: 28 },
        { unitId: 'light_cav', count: 22 },
        { unitId: 'crossbow', count: 24 }
      ]
    },
    {
      step: 5, act: 2, name: 'Xiliang Iron Vanguard', boss: false, wallHp: 0,
      rewardGold: 150, rewardGrain: 85, enemyGeneral: { name: 'Li Jue & Guo Si', war: 85, int: 62, seal: '傕', recruitId: 'zhangliao' },
      enemies: [
        { unitId: 'heavy_cav', count: 20 },
        { unitId: 'light_cav', count: 26 },
        { unitId: 'spearman', count: 28 },
        { unitId: 'crossbow', count: 22 }
      ]
    },
    {
      step: 6, act: 2, name: 'Hulao Blood-Gate (Act II Boss Siege)', boss: true, wallHp: 780,
      rewardGold: 220, rewardGrain: 120, enemyGeneral: { name: 'Lu Bu of Fengxian', war: 100, int: 42, seal: '呂', recruitId: 'lubu' },
      enemies: [
        { unitId: 'vanguard', count: 34 },
        { unitId: 'heavy_cav', count: 26 },
        { unitId: 'light_cav', count: 24 },
        { unitId: 'crossbow', count: 28 },
        { unitId: 'catapult', count: 6 }
      ]
    },
    // ACT III — 208 AD: Red Cliffs & Mandate of Heaven
    {
      step: 7, act: 3, name: 'Changban Slope Crossing', boss: false, wallHp: 0,
      rewardGold: 190, rewardGrain: 100, enemyGeneral: { name: 'Cao Ren\'s Iron Wall', war: 90, int: 78, seal: '仁', recruitId: 'huangzhong' },
      enemies: [
        { unitId: 'vanguard', count: 42 },
        { unitId: 'heavy_cav', count: 28 },
        { unitId: 'spearman', count: 36 },
        { unitId: 'crossbow', count: 34 }
      ]
    },
    {
      step: 8, act: 3, name: 'Red Cliffs Grand Imperial Citadel (Final Mandate)', boss: true, wallHp: 1150,
      rewardGold: 500, rewardGrain: 200, enemyGeneral: { name: 'Grand Imperial Host', war: 96, int: 96, seal: '帝', recruitId: 'zhugeliang' },
      enemies: [
        { unitId: 'vanguard', count: 48 },
        { unitId: 'heavy_cav', count: 36 },
        { unitId: 'spearman', count: 44 },
        { unitId: 'crossbow', count: 42 },
        { unitId: 'catapult', count: 10 }
      ]
    }
  ]
};
