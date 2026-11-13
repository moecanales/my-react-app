// ============================================================================
// TIGER TALLY: MANDATE OF CHAOS — Core Simulation, Economy & Battle Engine
// ============================================================================

window.TigerEngine = (function () {
  const D = window.TIGER_DATA;
  const SAVE_KEY = 'tiger_tally_save_v1';

  let state = null;

  function createNewRun(lordId) {
    const lord = D.WARLORDS.find(w => w.id === lordId) || D.WARLORDS[0];

    const buildings = {};
    D.BUILDINGS.forEach(b => {
      buildings[b.id] = {
        id: b.id,
        tier: 1,
        workers: 0, // Each worker pip = 10 Peasants assigned!
        officerId: null
      };
    });

    // Pre-assign 30 peasants sensibly so new players immediately see Stacklands production working!
    buildings.paddy.workers = 2;     // 20 peasants on Rice Paddy
    buildings.iron_mine.workers = 1; // 10 peasants on Iron Pit
    buildings.lumber.workers = 1;    // 10 peasants on Bamboo Forest

    // 7-slot Warband Board (5 unlocked initially, 6th via Pavilion Tier 2, 7th at Act II!)
    const warband = [null, null, null, null, null, null, null];
    lord.startWarband.forEach((entry, idx) => {
      warband[idx] = JSON.parse(JSON.stringify(entry));
    });

    // Assign second starting officer to Rice Paddy or Pavilion automatically if not on warband
    const usedOfficers = new Set(warband.filter(Boolean).map(s => s.officerId).filter(Boolean));
    lord.startingOfficers.forEach(oid => {
      if (!usedOfficers.has(oid)) {
        buildings.paddy.officerId = oid;
        usedOfficers.add(oid);
      }
    });

    state = {
      version: 1,
      lordId: lord.id,
      step: 1,              // 1..8 Campaign Nodes across 3 Acts
      seasonIdx: 0,         // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
      year: 184,
      watch: 1,             // 1=Morning, 2=Noon, 3=Dusk, 4=Ready for Campaign Battle
      unlockedSlots: 5,
      gold: lord.startResources.gold,
      grain: lord.startResources.grain,
      iron: lord.startResources.iron,
      wood: lord.startResources.wood,
      freePeasants: lord.startResources.peasants - 40, // 40 pre-assigned to buildings
      order: lord.startResources.order,
      rationId: 'normal',
      taxId: 'light',
      armory: { ...lord.startArmory },
      ownedOfficers: [...lord.startingOfficers],
      officerBuffs: {},     // e.g. { guanyu: { warBonus: 4, intBonus: 0 } }
      relicBag: [],         // Unplaced relics in reserve
      buildings,
      warband,
      activeEncounter: null, // Opened door contents
      watchDoors: [],
      prisonerModal: null,
      runStatus: 'playing',  // 'playing' | 'victory' | 'defeat'
      stats: { battlesWon: 0, duelsWon: 0, weaponsForged: 0, troopsMustered: 0 }
    };

    state.watchDoors = generateWatchDoors();
    saveRun();
    return state;
  }

  function saveRun() {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function loadRun() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lordId && parsed.buildings && parsed.warband) {
        state = parsed;
        return state;
      }
    } catch (_) {}
    return null;
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    state = null;
  }

  function getState() {
    return state;
  }

  function getOfficer(oid) {
    if (!oid || !D.OFFICERS[oid]) return null;
    const base = D.OFFICERS[oid];
    const buff = (state && state.officerBuffs && state.officerBuffs[oid]) || { war: 0, int: 0, pol: 0, cha: 0 };
    return {
      ...base,
      war: base.war + (buff.war || 0),
      int: base.int + (buff.int || 0),
      pol: base.pol + (buff.pol || 0),
      cha: base.cha + (buff.cha || 0)
    };
  }

  function getOfficerLocation(oid) {
    if (!state) return null;
    for (let i = 0; i < state.warband.length; i++) {
      const s = state.warband[i];
      if (s && s.kind === 'unit' && s.officerId === oid) {
        return { area: 'warband', index: i };
      }
    }
    for (const bid of Object.keys(state.buildings)) {
      if (state.buildings[bid].officerId === oid) {
        return { area: 'building', buildingId: bid };
      }
    }
    return { area: 'idle' };
  }

  function unassignOfficerEverywhere(oid) {
    if (!oid || !state) return;
    state.warband.forEach(s => {
      if (s && s.officerId === oid) s.officerId = null;
    });
    Object.values(state.buildings).forEach(b => {
      if (b.officerId === oid) b.officerId = null;
    });
  }

  function assignOfficerToBuilding(oid, buildingId) {
    const b = state.buildings[buildingId];
    if (!b || !state.ownedOfficers.includes(oid)) return false;
    unassignOfficerEverywhere(oid);
    b.officerId = oid;
    saveRun();
    return true;
  }

  function assignOfficerToSlot(oid, slotIdx) {
    const s = state.warband[slotIdx];
    if (!s || s.kind !== 'unit' || !state.ownedOfficers.includes(oid)) return false;
    unassignOfficerEverywhere(oid);
    s.officerId = oid;
    saveRun();
    return true;
  }

  function getTotalAssignedPeasants() {
    if (!state) return 0;
    return Object.values(state.buildings).reduce((sum, b) => sum + b.workers * 10, 0);
  }

  function getTotalPop() {
    if (!state) return 0;
    return state.freePeasants + getTotalAssignedPeasants();
  }

  function getTotalArmySoldiers() {
    if (!state) return 0;
    return state.warband.reduce((sum, s) => {
      if (s && s.kind === 'unit') return sum + s.count;
      return sum;
    }, 0);
  }

  function adjustWorkers(buildingId, deltaPips) {
    const b = state.buildings[buildingId];
    const meta = D.BUILDINGS.find(x => x.id === buildingId);
    if (!b || !meta) return { ok: false, msg: 'Invalid building' };
    const maxPips = meta.maxSlots + (b.tier > 1 ? 1 : 0);

    if (deltaPips > 0) {
      if (b.workers >= maxPips) return { ok: false, msg: 'All worker slots filled (Upgrade building for +1 slot!)' };
      if (state.freePeasants < 10) return { ok: false, msg: 'Need 10 Free Peasants!' };
      b.workers += 1;
      state.freePeasants -= 10;
    } else if (deltaPips < 0) {
      if (b.workers <= 0) return { ok: false, msg: 'No workers assigned here' };
      b.workers -= 1;
      state.freePeasants += 10;
    }
    saveRun();
    return { ok: true };
  }

  // Compute Watch Production & Seasonal Economy Forecast
  function computeEconomyForecast() {
    if (!state) return null;
    const season = D.SEASONS[state.seasonIdx % 4];
    const ration = D.RATION_LEVELS.find(r => r.id === state.rationId) || D.RATION_LEVELS[1];
    const tax = D.TAX_RATES.find(t => t.id === state.taxId) || D.TAX_RATES[1];

    function bldgMult(bid) {
      const b = state.buildings[bid];
      const meta = D.BUILDINGS.find(m => m.id === bid);
      let m = b.tier === 2 ? 1.45 : 1.0;
      if (b.officerId) {
        const off = getOfficer(b.officerId);
        const statVal = off[meta.statKey] || off.pol || 60;
        m += statVal / 180;
        if (b.officerId === 'zhugeliang') m += 0.25;
      }
      return m;
    }

    // Per Watch yield (happens 3 times per Season!)
    const grainWatch = Math.round(state.buildings.paddy.workers * 16 * season.grainMod * bldgMult('paddy'));
    const ironWatch = Math.round(state.buildings.iron_mine.workers * 7 * bldgMult('iron_mine'));
    const woodWatch = Math.round(state.buildings.lumber.workers * 8 * bldgMult('lumber'));

    // End of Season Pasture Warhorses
    let horseSeason = state.buildings.pasture.workers * 6 * (state.buildings.pasture.tier === 2 ? 1.5 : 1);
    if (state.buildings.pasture.officerId === 'machao') horseSeason *= 1.35;
    if (state.lordId === 'mateng') horseSeason *= 2;
    horseSeason = Math.round(horseSeason);
    const pastureGrainCost = state.buildings.pasture.workers * 10;

    // End of Season Food Consumption & Tax
    const pop = getTotalPop();
    const soldiers = getTotalArmySoldiers();
    const rawFoodNeed = Math.round(((pop * 0.35) + (soldiers * 0.45)) * ration.mult);
    const tuntianGrain = state.lordId === 'caocao' ? Math.round((soldiers / 10) * 4) : 0;
    const woodenOxCount = state.warband.filter(s => s && s.kind === 'relic' && s.relicId === 'wooden_ox').length;
    const oxGrain = woodenOxCount * 12;

    const taxGold = Math.round((pop / 10) * tax.goldPer10Pop * bldgMult('pavilion'));

    let orderDelta = ration.orderDelta + tax.orderDelta;
    if (state.buildings.pavilion.tier === 2) orderDelta += 4;
    Object.values(state.buildings).forEach(b => {
      if (b.officerId === 'diaochan') orderDelta += 8;
      if (b.officerId === 'zhaoyun' || b.officerId === 'jiianyong') orderDelta += 4;
    });

    return {
      grainWatch,
      ironWatch,
      woodWatch,
      horseSeason,
      pastureGrainCost,
      rawFoodNeed,
      tuntianGrain,
      oxGrain,
      taxGold,
      orderDelta
    };
  }

  // Triggered each time a Watch advances (1 -> 2 -> 3 -> 4)
  function collectWatchProduction() {
    const fc = computeEconomyForecast();
    state.grain += fc.grainWatch;
    state.iron += fc.ironWatch;
    state.wood += fc.woodWatch;

    // Smithy passive artisan output if workers > 0: small iron/wood polish or gold craft
    if (state.buildings.smithy.workers > 0) {
      state.gold += state.buildings.smithy.workers * (state.buildings.smithy.tier === 2 ? 9 : 5);
    }
    return fc;
  }

  // Forging discrete Armory Gear (Lords of the Realm II Smithy!)
  function getForgeCost(itemId) {
    const item = D.ARMORY_ITEMS[itemId];
    if (!item) return null;
    const smithy = state.buildings.smithy;
    let discount = smithy.tier === 2 ? 0.78 : 1.0;
    discount -= smithy.workers * 0.06;
    if (smithy.officerId) {
      const off = getOfficer(smithy.officerId);
      discount -= (off.pol || 50) / 700;
    }
    discount = Math.max(0.5, discount);
    return {
      wood: Math.max(item.wood > 0 ? 1 : 0, Math.round(item.wood * discount)),
      iron: Math.max(item.iron > 0 ? 1 : 0, Math.round(item.iron * discount)),
      batch: item.batch
    };
  }

  function forgeArmory(itemId) {
    const item = D.ARMORY_ITEMS[itemId];
    if (!item || item.bredAtPasture) return { ok: false, msg: 'Warhorses are bred at the Pasture or bought at Bazaar!' };
    const cost = getForgeCost(itemId);
    if (state.wood < cost.wood || state.iron < cost.iron) {
      return { ok: false, msg: `Need ${cost.wood} Timber & ${cost.iron} Iron!` };
    }
    state.wood -= cost.wood;
    state.iron -= cost.iron;
    state.armory[itemId] = (state.armory[itemId] || 0) + cost.batch;
    state.stats.weaponsForged += cost.batch;
    saveRun();
    return { ok: true, msg: `Forged +${cost.batch} ${item.name}!` };
  }

  // Upgrade Prefecture Building (HoMM Town Hall style!)
  function upgradeBuilding(buildingId) {
    const b = state.buildings[buildingId];
    const meta = D.BUILDINGS.find(m => m.id === buildingId);
    if (!b || !meta) return { ok: false, msg: 'Unknown building' };
    if (b.tier >= 2) return { ok: false, msg: 'Already upgraded to Grand Tier II!' };

    const gCost = meta.upgCost.gold || 0;
    const wCost = meta.upgCost.wood || 0;
    const iCost = meta.upgCost.iron || 0;
    if (state.gold < gCost || state.wood < wCost || state.iron < iCost) {
      return { ok: false, msg: `Need ${gCost} Gold${wCost ? `, ${wCost} Timber` : ''}${iCost ? `, ${iCost} Iron` : ''}!` };
    }
    state.gold -= gCost;
    state.wood -= wCost;
    state.iron -= iCost;
    b.tier = 2;

    if (buildingId === 'pavilion' && state.unlockedSlots < 7) {
      state.unlockedSlots = Math.min(7, state.unlockedSlots + 1);
    }
    saveRun();
    return { ok: true, msg: `Upgraded to ${meta.upgName}!` };
  }

  // Tiger Tally Muster: Conscript Peasants + Discrete Armory Gear -> Numbered HoMM Unit Stack!
  function musterTroops(unitId, preferredSlotIdx = null) {
    const u = D.UNITS[unitId];
    if (!u) return { ok: false, msg: 'Unknown unit' };

    // Allow pulling from freePeasants first, or auto-unassigning 1 worker pip if needed? Keep explicit freePeasants first, with helpful message!
    if (state.freePeasants < u.peasantsReq) {
      return { ok: false, msg: `Need ${u.peasantsReq} Free Peasants! (Unassign 1 worker from a building if needed)` };
    }

    for (const [gKey, gAmt] of Object.entries(u.gearReq)) {
      if ((state.armory[gKey] || 0) < gAmt) {
        const gName = D.ARMORY_ITEMS[gKey]?.name || gKey;
        return { ok: false, msg: `Need ${gAmt} ${gName} in Armory!` };
      }
    }

    // Find target slot: merge into existing stack of same unitId, or empty unlocked slot
    let targetIdx = -1;
    if (preferredSlotIdx !== null && preferredSlotIdx < state.unlockedSlots) {
      const slot = state.warband[preferredSlotIdx];
      if (!slot || (slot.kind === 'unit' && slot.unitId === unitId)) {
        targetIdx = preferredSlotIdx;
      }
    }
    if (targetIdx === -1) {
      targetIdx = state.warband.findIndex((s, idx) => idx < state.unlockedSlots && s && s.kind === 'unit' && s.unitId === unitId);
    }
    if (targetIdx === -1) {
      targetIdx = state.warband.findIndex((s, idx) => idx < state.unlockedSlots && s === null);
    }
    if (targetIdx === -1) {
      return { ok: false, msg: 'All unlocked Warband Slots are full! Dismiss/merge a slot or upgrade Strategist Pavilion.' };
    }

    // Deduct Peasants & Armory Gear
    state.freePeasants -= u.peasantsReq;
    for (const [gKey, gAmt] of Object.entries(u.gearReq)) {
      state.armory[gKey] -= gAmt;
    }

    // Conscription County Order penalty (Lords of the Realm II!)
    const orderHit = state.lordId === 'caocao' ? 3 : 6;
    state.order = Math.max(0, state.order - orderHit);

    if (state.warband[targetIdx]) {
      state.warband[targetIdx].count += u.batchSize;
    } else {
      state.warband[targetIdx] = {
        kind: 'unit',
        unitId,
        count: u.batchSize,
        officerId: null
      };
    }

    state.stats.troopsMustered += u.batchSize;
    saveRun();
    return { ok: true, msg: `Mustered +${u.batchSize} ${u.name} into Slot ${targetIdx + 1}!` };
  }

  // Swap two slots on the 7-slot Warband Board (The Bazaar spatial positioning!)
  function swapWarbandSlots(idxA, idxB) {
    if (idxA < 0 || idxB < 0 || idxA >= state.unlockedSlots || idxB >= state.unlockedSlots || idxA === idxB) return false;
    const tmp = state.warband[idxA];
    state.warband[idxA] = state.warband[idxB];
    state.warband[idxB] = tmp;
    saveRun();
    return true;
  }

  function placeRelicFromBag(bagIdx, slotIdx) {
    if (slotIdx < 0 || slotIdx >= state.unlockedSlots) return { ok: false, msg: 'Slot locked' };
    const relicId = state.relicBag[bagIdx];
    if (!relicId) return { ok: false, msg: 'No relic' };

    const existing = state.warband[slotIdx];
    if (existing && existing.kind === 'unit') {
      return { ok: false, msg: 'Choose an empty slot or swap with another Relic!' };
    }
    state.relicBag.splice(bagIdx, 1);
    if (existing && existing.kind === 'relic') {
      state.relicBag.push(existing.relicId);
    }
    state.warband[slotIdx] = { kind: 'relic', relicId };
    saveRun();
    return { ok: true };
  }

  function storeRelicToBag(slotIdx) {
    const s = state.warband[slotIdx];
    if (!s || s.kind !== 'relic') return false;
    state.relicBag.push(s.relicId);
    state.warband[slotIdx] = null;
    saveRun();
    return true;
  }

  function disbandSlot(slotIdx) {
    const s = state.warband[slotIdx];
    if (!s) return false;
    if (s.kind === 'relic') {
      return storeRelicToBag(slotIdx);
    }
    // Disbanding returns 50% peasants back to fields!
    state.freePeasants += Math.max(5, Math.floor(s.count * 0.5));
    state.warband[slotIdx] = null;
    saveRun();
    return true;
  }

  // ==========================================================================
  // THE BAZAAR ADJACENCY RESOLVER
  // Computes exact Left/Right spatial buffs for each slot on the Warband Board
  // ==========================================================================
  function computeBoardSynergies(board = state.warband, lordId = state.lordId) {
    return board.map((slot, idx) => {
      const syn = {
        dmgPct: 0,
        hastePct: 0,
        armorPct: 0,
        critPct: 0,
        fireImbue: false,
        antiStun: false,
        tags: []
      };
      if (!slot || slot.kind !== 'unit') return syn;

      const unitMeta = D.UNITS[slot.unitId];
      const left = idx > 0 ? board[idx - 1] : null;
      const right = idx < board.length - 1 ? board[idx + 1] : null;
      const neighbors = [left, right].filter(Boolean);

      if (lordId === 'mateng' && unitMeta.cavalry) {
        syn.dmgPct += 22;
        syn.hastePct += 15;
        syn.tags.push({ text: 'Xiliang +22% DMG', cls: 'haste' });
      }

      const selfOff = slot.officerId ? getOfficer(slot.officerId) : null;
      if (selfOff) {
        syn.dmgPct += Math.round(selfOff.war * 0.45);
        syn.hastePct += Math.round(selfOff.int * 0.18);
        if (slot.officerId === 'zhouyu') {
          syn.fireImbue = true;
          syn.tags.push({ text: '🔥 Zhou Yu Fire', cls: 'fire' });
        }
        if (slot.officerId === 'sunshangxiang' && unitMeta.ranged) {
          syn.hastePct += 30;
          syn.tags.push({ text: '⚡ Bow-Maiden +30%', cls: 'haste' });
        }
        if (slot.officerId === 'machao' && unitMeta.cavalry) {
          syn.dmgPct += 35;
          syn.tags.push({ text: '⚡ Silver Spear +35%', cls: 'fire' });
        }
      }

      neighbors.forEach(nb => {
        if (nb.kind === 'relic') {
          if (nb.relicId === 'brazier_cart') {
            syn.fireImbue = true;
            syn.tags.push({ text: '🔥 Scorch Bolts', cls: 'fire' });
          }
          if (nb.relicId === 'war_drum') {
            syn.hastePct += 25;
            syn.tags.push({ text: '🥁 +25% Haste', cls: 'haste' });
          }
          if (nb.relicId === 'mengde_scroll') {
            syn.dmgPct += 22;
            syn.tags.push({ text: '📜 +22% DMG', cls: '' });
          }
          if (nb.relicId === 'ferghana_banner') {
            const h = unitMeta.cavalry ? 35 : 20;
            syn.hastePct += h;
            syn.critPct += 20;
            syn.tags.push({ text: `🚩 +${h}% Haste`, cls: 'haste' });
          }
          if (nb.relicId === 'bagua_mirror') {
            syn.armorPct += 22;
            syn.tags.push({ text: '☯️ +22% Ward', cls: 'shield' });
          }
          if (nb.relicId === 'ballista_wagon' && unitMeta.ranged) {
            syn.dmgPct += 20;
            syn.tags.push({ text: '🎯 +20% Volley', cls: '' });
          }
          if (nb.relicId === 'peach_wine_cart' && slot.officerId) {
            syn.dmgPct += 30;
            syn.antiStun = true;
            syn.tags.push({ text: '🍶 Oath +30% DMG', cls: 'fire' });
          }
          if (nb.relicId === 'wooden_ox') {
            syn.tags.push({ text: '🐂 Ox Regen', cls: 'shield' });
          }
        } else if (nb.kind === 'unit') {
          if (nb.unitId === 'spearman') {
            syn.armorPct += 15;
            syn.tags.push({ text: '🔱 Pike Guard', cls: 'shield' });
          }
          if (nb.unitId === 'vanguard') {
            syn.tags.push({ text: '🛡️ Shield Ally', cls: 'shield' });
          }
          if (nb.unitId === 'heavy_cav' && unitMeta.cavalry) {
            syn.hastePct += 15;
            syn.tags.push({ text: '🐆 Cav Pack +15%', cls: 'haste' });
          }
          if (slot.unitId === 'militia' && nb.officerId) {
            syn.hastePct += 12;
          }
          if (nb.officerId === 'zhouyu') {
            syn.fireImbue = true;
            syn.tags.push({ text: '🔥 Red Cliffs Fire', cls: 'fire' });
          }
          if (nb.officerId === 'zhangliao' && unitMeta.cavalry) {
            syn.hastePct += 25;
            syn.tags.push({ text: '⚡ Zhang Liao +25%', cls: 'haste' });
          }
          if (nb.officerId === 'jiianyong') {
            syn.hastePct += 12;
          }
          // Liu Bei Peach Garden Doctrine: Adjacent Officer-led stacks buff each other!
          if (lordId === 'liubei' && slot.officerId && nb.officerId) {
            syn.dmgPct += 18;
            syn.tags.push({ text: '🍑 Oath +18% DMG', cls: 'haste' });
          }
        }
      });

      return syn;
    });
  }

  // ==========================================================================
  // THE BAZAAR 3-DOOR WATCH ENCOUNTER GENERATOR
  // ==========================================================================
  function pickRandom(arr, n) {
    const copy = [...arr];
    const out = [];
    while (copy.length > 0 && out.length < n) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  function generateWatchDoors() {
    if (!state) return [];
    const discount = state.lordId === 'sunquan' ? 0.75 : 1.0;

    // Door 1: Silk Road Bazaar (Relics + Armory Crates)
    const relicPool = Object.values(D.RELICS);
    const shopCount = state.lordId === 'sunquan' ? 4 : 3;
    const chosenRelics = pickRandom(relicPool, 2).map(r => ({
      kind: 'relic',
      id: r.id,
      name: r.name,
      icon: r.icon,
      desc: r.desc,
      price: Math.round(r.cost * discount),
      sold: false
    }));

    const gearKeys = pickRandom(['spear', 'shield', 'crossbow', 'halberd', 'horse', 'catapult'], shopCount - 2 + 1);
    const gearOffers = gearKeys.map(gk => {
      const g = D.ARMORY_ITEMS[gk];
      return {
        kind: 'armory',
        id: gk,
        name: `${g.batch}× ${g.name}`,
        icon: g.icon,
        desc: `Adds +${g.batch} ${g.name} directly to your Prefecture Armory.`,
        batch: g.batch,
        price: Math.round(g.val * 1.4 * discount),
        sold: false
      };
    });

    const doorBazaar = {
      id: 'bazaar_shop',
      icon: '🏮',
      title: 'Silk Road Arms & Relic Bazaar',
      tag: 'Merchant Caravan',
      desc: 'Browse spatial Warband Relics, Warhorses, & forged Armory crates from western traders.',
      offers: [...chosenRelics, ...gearOffers, {
        kind: 'resource_pack',
        id: 'iron_wood',
        name: 'Imperial Smelter Crate',
        icon: '📦',
        desc: '+16 Iron Ingots & +18 Seasoned Timber for your Smithy.',
        price: Math.round(38 * discount),
        sold: false
      }]
    };

    // Door 2: Peach-Blossom Tavern & Hermit Cottage (ROTK Officers!)
    const unowned = Object.values(D.OFFICERS).filter(o => !state.ownedOfficers.includes(o.id) && o.id !== 'lubu');
    const tavernPicks = pickRandom(unowned, 2).map(o => ({
      kind: 'officer',
      id: o.id,
      name: `${o.name} (${o.courtesy})`,
      icon: o.seal,
      desc: `WAR ${o.war} · INT ${o.int} · POL ${o.pol} · CHA ${o.cha} — ${o.battleDesc}`,
      price: Math.round(o.cost * discount),
      sold: false
    }));

    const doorTavern = {
      id: 'tavern',
      icon: '🍶',
      title: 'Peach-Blossom Winehouse',
      tag: 'Recruit ROTK Generals',
      desc: 'Toast wandering heroes, recruit famed Officers, or host a county feast (+Order & Peasants).',
      offers: [
        ...tavernPicks,
        {
          kind: 'feast',
          id: 'county_feast',
          name: 'Host Prefecture Wine Feast',
          icon: '🥟',
          desc: 'Spend Gold to attract +20 Free Peasants & boost County Order by +12!',
          price: 42,
          sold: false
        }
      ]
    };

    // Door 3: Overland HoMM Map Node / Imperial Dilemma
    const boons = [
      {
        id: 'martial_shrine',
        icon: '⛩️',
        title: 'Ancient Shrine of the War God',
        tag: 'Overland Map Node',
        desc: 'All Generals in your roster permanently gain +4 WAR & +4 INT, plus +35 Gold incense tribute!',
        boonType: 'shrine_stats'
      },
      {
        id: 'abandoned_granary',
        icon: '🏯',
        title: 'Captured Imperial Supply Depot',
        tag: 'Overland Map Node',
        desc: 'Seize +75 Grain, +14 Iron, +14 Timber, and +10 Ash Longspears unguarded!',
        boonType: 'depot_loot'
      },
      {
        id: 'refugee_column',
        icon: '👨‍🌾',
        title: 'Displaced Zhongyuan Refugees',
        tag: 'Prefecture Event',
        desc: 'Welcome +30 Free Peasants into your Commandery workforce & gain +8 County Order!',
        boonType: 'refugees'
      },
      {
        id: 'mercenary_camp',
        icon: '⛺',
        title: 'Xiliang Mercenary Outpost',
        tag: 'HoMM Map Node',
        desc: '14 veteran Chu-Ko-Nu Marksmen & +10 Warhorses rally directly to your banner for free!',
        boonType: 'free_troops'
      }
    ];
    const chosenBoon = boons[Math.floor(Math.random() * boons.length)];

    return [doorBazaar, doorTavern, chosenBoon];
  }

  function selectWatchDoor(doorIdx) {
    const door = state.watchDoors[doorIdx];
    if (!door) return { ok: false };

    if (door.boonType) {
      // Instant Overland Node resolution + advance Watch!
      let summary = '';
      if (door.boonType === 'shrine_stats') {
        state.ownedOfficers.forEach(oid => {
          state.officerBuffs[oid] = state.officerBuffs[oid] || { war: 0, int: 0, pol: 0, cha: 0 };
          state.officerBuffs[oid].war += 4;
          state.officerBuffs[oid].int += 4;
        });
        state.gold += 35;
        summary = 'Shrine Blessing: All owned Generals gained +4 WAR, +4 INT & +35 Gold!';
      } else if (door.boonType === 'depot_loot') {
        state.grain += 75;
        state.iron += 14;
        state.wood += 14;
        state.armory.spear += 10;
        summary = 'Looted Imperial Depot: +75 Grain, +14 Iron, +14 Timber & +10 Longspears!';
      } else if (door.boonType === 'refugees') {
        state.freePeasants += 30;
        state.order = Math.min(100, state.order + 8);
        summary = 'Welcomed +30 Free Peasants & +8 County Order!';
      } else if (door.boonType === 'free_troops') {
        state.armory.horse += 10;
        // Merge or place 14 crossbowmen
        let slotIdx = state.warband.findIndex((s, i) => i < state.unlockedSlots && s && s.kind === 'unit' && s.unitId === 'crossbow');
        if (slotIdx === -1) slotIdx = state.warband.findIndex((s, i) => i < state.unlockedSlots && s === null);
        if (slotIdx !== -1) {
          if (state.warband[slotIdx]) state.warband[slotIdx].count += 14;
          else state.warband[slotIdx] = { kind: 'unit', unitId: 'crossbow', count: 14, officerId: null };
          summary = '+14 Chu-Ko-Nu Marksmen joined Slot ' + (slotIdx + 1) + ' & +10 Warhorses added!';
        } else {
          state.armory.crossbow += 20;
          summary = 'Warband full — gained +20 Crossbows & +10 Warhorses in Armory!';
        }
      }
      advanceWatch();
      saveRun();
      return { ok: true, instantMsg: summary };
    } else {
      state.activeEncounter = door;
      saveRun();
      return { ok: true };
    }
  }

  function buyEncounterOffer(offerIdx) {
    if (!state.activeEncounter) return { ok: false, msg: 'No active encounter' };
    const offer = state.activeEncounter.offers[offerIdx];
    if (!offer || offer.sold) return { ok: false, msg: 'Already acquired' };
    if (state.gold < offer.price) return { ok: false, msg: `Need ${offer.price} Gold Taels!` };

    state.gold -= offer.price;
    offer.sold = true;

    if (offer.kind === 'relic') {
      const emptyIdx = state.warband.findIndex((s, i) => i < state.unlockedSlots && s === null);
      if (emptyIdx !== -1) {
        state.warband[emptyIdx] = { kind: 'relic', relicId: offer.id };
      } else {
        state.relicBag.push(offer.id);
      }
    } else if (offer.kind === 'armory') {
      state.armory[offer.id] = (state.armory[offer.id] || 0) + offer.batch;
    } else if (offer.kind === 'resource_pack') {
      state.iron += 16;
      state.wood += 18;
    } else if (offer.kind === 'officer') {
      if (!state.ownedOfficers.includes(offer.id)) {
        state.ownedOfficers.push(offer.id);
        // Auto-attach to an unled Warband unit if one exists!
        const unled = state.warband.find(s => s && s.kind === 'unit' && !s.officerId);
        if (unled) unled.officerId = offer.id;
      }
    } else if (offer.kind === 'feast') {
      state.freePeasants += 20;
      state.order = Math.min(100, state.order + 12);
    }

    saveRun();
    return { ok: true, msg: `Acquired ${offer.name}!` };
  }

  function finishEncounterAndAdvance() {
    state.activeEncounter = null;
    advanceWatch();
    saveRun();
  }

  function advanceWatch() {
    collectWatchProduction();
    if (state.watch < 3) {
      state.watch += 1;
      state.watchDoors = generateWatchDoors();
    } else {
      state.watch = 4; // Dusk Ready for Campaign Clash!
      state.watchDoors = [];
    }
  }

  // End of Season Resolution after winning a Campaign Node Battle!
  function completeCampaignNodeAndAdvanceSeason(battleResult) {
    const node = D.CAMPAIGN_NODES[state.step - 1];

    // Update surviving soldier counts on Warband (HoMM permanent casualties + 30% field medic recovery!)
    if (battleResult && battleResult.playerSurvivors) {
      battleResult.playerSurvivors.forEach(surv => {
        const slot = state.warband[surv.slotIdx];
        if (slot && slot.kind === 'unit') {
          const lost = Math.max(0, slot.count - surv.livingCount);
          const medicRecovered = Math.round(lost * 0.30); // Field Chirurgeons recover 30% of wounded!
          const finalCount = surv.livingCount + medicRecovered;
          if (finalCount <= 0) {
            state.warband[surv.slotIdx] = null;
          } else {
            slot.count = finalCount;
          }
        }
      });
    }

    // Grant Battle Spoils
    state.gold += node.rewardGold;
    state.grain += node.rewardGrain;
    state.stats.battlesWon += 1;

    if (state.step >= D.CAMPAIGN_NODES.length) {
      state.runStatus = 'victory';
      saveRun();
      return { victory: true };
    }

    // Prisoner Capture Event!
    if (node.enemyGeneral && node.enemyGeneral.recruitId && !state.ownedOfficers.includes(node.enemyGeneral.recruitId)) {
      state.prisonerModal = {
        generalName: node.enemyGeneral.name,
        recruitId: node.enemyGeneral.recruitId
      };
    } else if (node.enemyGeneral && node.enemyGeneral.lootRelic) {
      const rId = node.enemyGeneral.lootRelic;
      const emptyIdx = state.warband.findIndex((s, i) => i < state.unlockedSlots && s === null);
      if (emptyIdx !== -1) state.warband[emptyIdx] = { kind: 'relic', relicId: rId };
      else state.relicBag.push(rId);
    }

    // Unlock 6th/7th Warband Slot upon clearing Act I / Act II Boss!
    if (node.boss && state.unlockedSlots < 7) {
      state.unlockedSlots = Math.min(7, state.unlockedSlots + 1);
    }

    // Season Roll-Over (Lords of the Realm II Rations, Taxes, Pasture Horses, Immigration!)
    const fc = computeEconomyForecast();
    state.gold += fc.taxGold;
    state.grain += fc.tuntianGrain + fc.oxGrain;

    if (fc.horseSeason > 0 && state.grain >= fc.pastureGrainCost) {
      state.grain -= fc.pastureGrainCost;
      state.armory.horse += fc.horseSeason;
    }

    if (state.grain >= fc.rawFoodNeed) {
      state.grain -= fc.rawFoodNeed;
      state.order = Math.max(0, Math.min(100, state.order + fc.orderDelta));
    } else {
      // Famine!
      state.grain = 0;
      state.order = Math.max(0, state.order - 20);
    }

    // Population growth based on County Order (LOTR2 + Liu Bei doctrine)
    if (state.order >= 70) {
      state.freePeasants += 15 + (state.lordId === 'liubei' ? 15 : 0);
    } else if (state.order >= 40) {
      state.freePeasants += 10;
    } else {
      state.freePeasants = Math.max(0, state.freePeasants - 5);
    }

    state.step += 1;
    state.seasonIdx = (state.seasonIdx + 1) % 4;
    if (state.seasonIdx === 0) state.year += 1;
    state.watch = 1;
    state.watchDoors = generateWatchDoors();

    saveRun();
    return { victory: false };
  }

  function resolvePrisonerChoice(choice) {
    if (!state.prisonerModal) return null;
    const recId = state.prisonerModal.recruitId;
    const off = D.OFFICERS[recId];
    let msg = '';

    if (choice === 'recruit' && off) {
      state.ownedOfficers.push(recId);
      const unled = state.warband.find(s => s && s.kind === 'unit' && !s.officerId);
      if (unled) unled.officerId = recId;
      msg = `${off.name} swore allegiance to your Tiger Tally!`;
    } else if (choice === 'ransom') {
      state.gold += 110;
      state.order = Math.min(100, state.order + 10);
      msg = 'Released prisoner with honor: +110 Gold Taels & +10 County Order!';
    } else if (choice === 'execute') {
      const rPool = Object.keys(D.RELICS);
      const rId = rPool[Math.floor(Math.random() * rPool.length)];
      const emptyIdx = state.warband.findIndex((s, i) => i < state.unlockedSlots && s === null);
      if (emptyIdx !== -1) state.warband[emptyIdx] = { kind: 'relic', relicId: rId };
      else state.relicBag.push(rId);
      msg = `Executed captive commander — seized ${D.RELICS[rId].name}!`;
    }
    state.prisonerModal = null;
    saveRun();
    return msg;
  }

  // ==========================================================================
  // REAL-TIME TACTICAL COOLDOWN & CASTLE SIEGE BATTLE INSTANCE
  // ==========================================================================
  function createBattleSession() {
    const node = D.CAMPAIGN_NODES[state.step - 1];
    const synergies = computeBoardSynergies(state.warband, state.lordId);
    const ration = D.RATION_LEVELS.find(r => r.id === state.rationId) || D.RATION_LEVELS[1];

    // Determine Player's Chief Strategist (highest INT owned officer)
    let bestInt = 55;
    let strategistName = 'Prefecture Advisor';
    state.ownedOfficers.forEach(oid => {
      const o = getOfficer(oid);
      if (o && o.int > bestInt) {
        bestInt = o.int;
        strategistName = o.name;
      }
    });

    // Determine Player's Vanguard Duelist (highest WAR officer on Warband, or owned)
    let bestDuelist = null;
    state.warband.forEach(s => {
      if (s && s.officerId) {
        const o = getOfficer(s.officerId);
        if (!bestDuelist || o.war > bestDuelist.war) bestDuelist = o;
      }
    });
    if (!bestDuelist && state.ownedOfficers.length > 0) {
      bestDuelist = getOfficer(state.ownedOfficers[0]);
    }

    const playerSlots = state.warband.map((s, idx) => {
      if (!s) return null;
      if (s.kind === 'relic') {
        const rm = D.RELICS[s.relicId];
        return {
          slotIdx: idx,
          side: 'player',
          kind: 'relic',
          relicId: s.relicId,
          name: rm.name,
          icon: rm.icon,
          cdMax: rm.cd,
          cdNow: Math.random() * 0.6,
          alive: true,
          activeEffect: rm.activeEffect,
          strikingUntil: 0
        };
      }
      const um = D.UNITS[s.unitId];
      const syn = synergies[idx];
      const off = s.officerId ? getOfficer(s.officerId) : null;
      const maxHp = s.count * um.hpPerSoldier;
      const startShield = (s.officerId === 'dianwei') ? Math.round(s.count * 3.5) : 0;

      return {
        slotIdx: idx,
        side: 'player',
        kind: 'unit',
        unitId: s.unitId,
        name: um.name,
        icon: um.icon,
        unitMeta: um,
        startCount: s.count,
        livingCount: s.count,
        hp: maxHp,
        maxHp,
        shield: startShield,
        burn: 0,
        stunTimer: 0,
        exposed: false,
        firstStrikePending: s.officerId === 'guanyu',
        volleyCounter: 0,
        officer: off,
        syn,
        cdMax: um.cd,
        cdNow: Math.random() * 0.5,
        alive: true,
        strikingUntil: 0,
        hitUntil: 0
      };
    });

    // Apply Dian Wei shield to left neighbor too
    playerSlots.forEach((ps, idx) => {
      if (ps && ps.kind === 'unit' && ps.officer && ps.officer.id === 'dianwei' && idx > 0) {
        const left = playerSlots[idx - 1];
        if (left && left.kind === 'unit') left.shield += Math.round(ps.startCount * 3.5);
      }
    });

    // Enemy Line (centered nicely across up to 7 slots)
    const enemySlots = [null, null, null, null, null, null, null];
    node.enemies.forEach((en, i) => {
      const um = D.UNITS[en.unitId];
      const maxHp = en.count * um.hpPerSoldier;
      const isCommanderSlot = i === 0;
      enemySlots[i] = {
        slotIdx: i,
        side: 'enemy',
        kind: 'unit',
        unitId: en.unitId,
        name: um.name,
        icon: um.icon,
        unitMeta: um,
        startCount: en.count,
        livingCount: en.count,
        hp: maxHp,
        maxHp,
        shield: node.boss ? Math.round(maxHp * 0.12) : 0,
        burn: 0,
        stunTimer: 0,
        exposed: false,
        cdMax: um.cd * 1.06,
        cdNow: Math.random() * 0.6,
        alive: true,
        isCommander: isCommanderSlot,
        commanderData: isCommanderSlot ? node.enemyGeneral : null,
        syn: { dmgPct: isCommanderSlot ? Math.round(node.enemyGeneral.war * 0.32) : 10, hastePct: 0, armorPct: 0, critPct: 0, fireImbue: false },
        strikingUntil: 0,
        hitUntil: 0
      };
    });

    const battle = {
      node,
      clock: 0,
      speed: 1,
      paused: true, // Starts in Pre-Battle Duel / Ready state!
      duelResolved: false,
      duelist: bestDuelist,
      enemyGeneral: node.enemyGeneral,
      wallHp: node.wallHp || 0,
      wallMaxHp: node.wallHp || 0,
      playerMorale: Math.max(25, Math.min(100, 68 + ration.moraleBonus + (state.buildings.pavilion.tier === 2 ? 10 : 0))),
      enemyMorale: 75,
      qi: state.buildings.pavilion.tier === 2 ? 45 : 30,
      qiMax: 100,
      strategistInt: bestInt,
      strategistName,
      playerSlots,
      enemySlots,
      logs: [`🏯 Armies arrayed at ${node.name}! Enemy Commander: ${node.enemyGeneral.name} (WAR ${node.enemyGeneral.war}).`],
      finished: false,
      winner: null
    };

    return battle;
  }

  function resolvePreBattleDuel(battle, stance) {
    // Stances: 'cleave' beats 'feint', 'feint' beats 'parry', 'parry' beats 'cleave'
    if (battle.duelResolved) return;
    const aiChoices = ['cleave', 'feint', 'parry'];
    const aiStance = aiChoices[Math.floor(Math.random() * 3)];

    const pWar = battle.duelist ? battle.duelist.war : 65;
    const eWar = battle.enemyGeneral ? battle.enemyGeneral.war : 75;

    let stanceEdge = 0;
    if (
      (stance === 'cleave' && aiStance === 'feint') ||
      (stance === 'feint' && aiStance === 'parry') ||
      (stance === 'parry' && aiStance === 'cleave')
    ) {
      stanceEdge = 22;
    } else if (stance !== aiStance) {
      stanceEdge = -16;
    }

    const pScore = pWar + stanceEdge + (Math.random() * 14 - 7);
    const eScore = eWar + (Math.random() * 14 - 7);

    battle.duelResolved = true;
    battle.paused = false;

    if (pScore >= eScore) {
      battle.enemyMorale = Math.max(10, battle.enemyMorale - 28);
      battle.playerMorale = Math.min(100, battle.playerMorale + 16);
      battle.qi = Math.min(battle.qiMax, battle.qi + 25);
      // Wound enemy commander stack by 20%!
      const cmd = battle.enemySlots[0];
      if (cmd && cmd.alive) {
        applyDamageToStack(battle, cmd, cmd.maxHp * 0.20, true);
      }
      state.stats.duelsWon += 1;
      battle.logs.unshift(`⚔️ DUEL WON! ${battle.duelist?.name || 'Your Champion'} (${stance.toUpperCase()}) unhorsed ${battle.enemyGeneral.name} (${aiStance.toUpperCase()})! Enemy Morale -28!`);
      applyBattleOpeningPassives(battle);
      return { won: true, aiStance };
    } else {
      battle.playerMorale = Math.max(20, battle.playerMorale - 12);
      battle.logs.unshift(`💥 Duel Clash! ${battle.enemyGeneral.name} (${aiStance.toUpperCase()}) parried ${battle.duelist?.name || 'your general'} (${stance.toUpperCase()})! Drums sound the general assault!`);
      applyBattleOpeningPassives(battle);
      return { won: false, aiStance };
    }
  }

  function skipDuelAndStart(battle) {
    if (!battle.duelResolved) {
      battle.duelResolved = true;
      applyBattleOpeningPassives(battle);
    }
    battle.paused = false;
  }

  function applyBattleOpeningPassives(battle) {
    // Zhang Fei roar & Diaochan discord
    battle.playerSlots.forEach(s => {
      if (!s || s.kind !== 'unit' || !s.officer) return;
      if (s.officer.id === 'zhangfei') {
        const front = battle.enemySlots.find(e => e && e.alive);
        if (front) front.stunTimer = Math.max(front.stunTimer, 2.5);
        battle.enemyMorale = Math.max(10, battle.enemyMorale - 12);
        battle.logs.unshift('🦁 Zhang Fei roars like thunder! Enemy Vanguard stunned for 2.5s & -12 Morale!');
      }
      if (s.officer.id === 'diaochan') {
        const strong = battle.enemySlots.filter(e => e && e.alive)[0];
        if (strong) strong.syn.hastePct -= 30;
        battle.enemyMorale = Math.max(10, battle.enemyMorale - 10);
        battle.logs.unshift('🌙 Diaochan weaves discord across the enemy host (-30% Enemy Vanguard Speed)!');
      }
    });
  }

  function applyDamageToStack(battle, target, rawDmg, ignoreArmor = false) {
    if (!target || !target.alive) return 0;
    let dmg = Math.max(1, rawDmg);

    // Zhao Yun Evasion
    if (target.officer && target.officer.id === 'zhaoyun' && Math.random() < 0.25) {
      battle.logs.unshift(`💨 Zhao Yun's cavalry slips past the blow unharmed!`);
      return 0;
    }

    if (!ignoreArmor && target.syn && target.syn.armorPct > 0) {
      dmg *= Math.max(0.35, 1 - target.syn.armorPct / 100);
    }
    if (target.exposed) dmg *= 1.18;

    // Morale rout vulnerability
    const sideMorale = target.side === 'player' ? battle.playerMorale : battle.enemyMorale;
    if (sideMorale < 20) dmg *= 1.25;

    dmg = Math.round(dmg);

    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
    }

    if (dmg > 0) {
      target.hp = Math.max(0, target.hp - dmg);
      target.livingCount = Math.ceil(target.hp / target.unitMeta.hpPerSoldier);
      target.hitUntil = battle.clock + 0.22;

      // Xiahou Dun Retaliation!
      if (target.alive && target.hp > 0 && target.officer && target.officer.id === 'xiahoudun') {
        const oppList = target.side === 'player' ? battle.enemySlots : battle.playerSlots;
        const foe = oppList.find(x => x && x.kind === 'unit' && x.alive);
        if (foe) {
          const retDmg = Math.round(target.livingCount * target.unitMeta.atkPerSoldier * 0.42);
          foe.hp = Math.max(0, foe.hp - retDmg);
          foe.livingCount = Math.ceil(foe.hp / foe.unitMeta.hpPerSoldier);
          if (foe.hp <= 0) handleStackDeath(battle, foe);
        }
      }

      if (target.hp <= 0) {
        handleStackDeath(battle, target);
      }
    }
    return dmg;
  }

  function handleStackDeath(battle, deadStack) {
    if (!deadStack.alive) return;
    deadStack.alive = false;
    deadStack.livingCount = 0;
    deadStack.hp = 0;
    if (deadStack.side === 'enemy') {
      battle.enemyMorale = Math.max(5, battle.enemyMorale - 15);
      battle.playerMorale = Math.min(100, battle.playerMorale + 8);
      battle.logs.unshift(`💀 Enemy ${deadStack.name} routed & wiped out!`);
    } else {
      battle.playerMorale = Math.max(5, battle.playerMorale - 14);
      battle.logs.unshift(`⚠️ Our ${deadStack.name} stack has fallen!`);
    }
  }

  function pickEnemyTarget(battle, attacker, oppSlots) {
    const living = oppSlots.filter(x => x && x.kind === 'unit' && x.alive);
    if (living.length === 0) return null;

    // Gan Ning night raid: always snipes furthest backline!
    if (attacker.officer && attacker.officer.id === 'ganning') {
      return living[living.length - 1];
    }

    // Light Cavalry flanks ranged backline if wall is down!
    if (attacker.unitId === 'light_cav' && (attacker.side === 'enemy' || battle.wallHp <= 0)) {
      const rangedBack = [...living].reverse().find(x => x.unitMeta.ranged);
      if (rangedBack) return rangedBack;
    }

    // Ranged units can pick random front/mid target
    if (attacker.unitMeta.ranged && living.length > 1 && Math.random() < 0.45) {
      return living[Math.min(living.length - 1, 1)];
    }

    return living[0];
  }

  function fireUnitAction(battle, actor) {
    const isPlayer = actor.side === 'player';
    const allies = isPlayer ? battle.playerSlots : battle.enemySlots;
    const foes = isPlayer ? battle.enemySlots : battle.playerSlots;

    actor.strikingUntil = battle.clock + 0.26;

    // Support Relic Activation (The Bazaar Engine!)
    if (actor.kind === 'relic') {
      const left = actor.slotIdx > 0 ? allies[actor.slotIdx - 1] : null;
      const right = actor.slotIdx < allies.length - 1 ? allies[actor.slotIdx + 1] : null;
      const adjUnits = [left, right].filter(x => x && x.kind === 'unit' && x.alive);

      if (actor.activeEffect === 'hurl_oil') {
        const t = foes.find(x => x && x.kind === 'unit' && x.alive);
        if (t) {
          t.burn += 26;
          applyDamageToStack(battle, t, 45);
          if (window.TigerAudio) window.TigerAudio.fire();
        }
      } else if (actor.activeEffect === 'drum_rally') {
        battle.playerMorale = Math.min(100, battle.playerMorale + 5);
        adjUnits.forEach(u => { u.shield += 38; });
        if (window.TigerAudio) window.TigerAudio.drum(false);
      } else if (actor.activeEffect === 'supply_heal') {
        adjUnits.forEach(u => {
          u.hp = Math.min(u.maxHp, u.hp + 55);
          u.livingCount = Math.ceil(u.hp / u.unitMeta.hpPerSoldier);
        });
      } else if (actor.activeEffect === 'qi_surge') {
        battle.qi = Math.min(battle.qiMax, battle.qi + 14);
      } else if (actor.activeEffect === 'cav_spur') {
        adjUnits.forEach(u => { u.cdNow = Math.min(u.cdMax, u.cdNow + 0.65); });
      } else if (actor.activeEffect === 'ward_pulse') {
        adjUnits.forEach(u => { u.shield += 52; });
      } else if (actor.activeEffect === 'snipe_bolt') {
        if (battle.wallHp > 0) {
          battle.wallHp = Math.max(0, battle.wallHp - 150);
        } else {
          const t = foes.find(x => x && x.kind === 'unit' && x.alive);
          if (t) applyDamageToStack(battle, t, 95, true);
        }
        if (window.TigerAudio) window.TigerAudio.arrow();
      } else if (actor.activeEffect === 'wine_courage') {
        adjUnits.forEach(u => { u.stunTimer = 0; u.shield += 30; });
      }
      return;
    }

    // Unit Stack Activation!
    const um = actor.unitMeta;
    const morale = isPlayer ? battle.playerMorale : battle.enemyMorale;
    const moraleMult = morale >= 80 ? 1.2 : (morale < 20 ? 0.65 : 1.0);

    let dmg = actor.livingCount * um.atkPerSoldier * (1 + (actor.syn.dmgPct || 0) / 100) * moraleMult;

    // Vanguard Tortoise Shield grant to self & adjacent allies!
    if (actor.unitId === 'vanguard') {
      const shAmt = Math.round(actor.livingCount * 2.6);
      actor.shield += shAmt;
      [allies[actor.slotIdx - 1], allies[actor.slotIdx + 1]].forEach(nb => {
        if (nb && nb.kind === 'unit' && nb.alive) nb.shield += Math.round(shAmt * 0.65);
      });
    }

    // Guan Yu 2.0x Opening Crit!
    if (actor.firstStrikePending) {
      dmg *= 2.0;
      actor.firstStrikePending = false;
      battle.logs.unshift(`🐉 Guan Yu unleashes Green Dragon Crescent Slash (2.0× CRIT)!`);
    } else if (actor.syn.critPct && Math.random() * 100 < actor.syn.critPct) {
      dmg *= 1.6;
    }

    // Check Enemy Castle Wall if Player attacking!
    const ganNingBypass = actor.officer && actor.officer.id === 'ganning';
    if (isPlayer && battle.wallHp > 0 && !ganNingBypass) {
      if (um.siege) {
        const wallSmash = Math.round(dmg * 3.5);
        battle.wallHp = Math.max(0, battle.wallHp - wallSmash);
        battle.logs.unshift(`☄️ ${actor.name} pulverizes Castle Ramparts for ${wallSmash} Siege DMG!`);
        if (window.TigerAudio) window.TigerAudio.drum(true);
        if (battle.wallHp === 0) battle.logs.unshift(`🧱 BREACH! The Enemy Castle Gatehouse has collapsed!`);
        return;
      } else if (!um.ranged) {
        // Melee batters the gatehouse (Pang De +40% bonus vs gates!)
        const gateMult = (actor.officer && actor.officer.id === 'pangde') ? 1.4 : 0.85;
        const gateHit = Math.round(dmg * gateMult);
        battle.wallHp = Math.max(0, battle.wallHp - gateHit);
        if (window.TigerAudio) window.TigerAudio.clash();
        if (battle.wallHp === 0) battle.logs.unshift(`🧱 BREACH! ${actor.name} smashed open the Castle Gate!`);
        return;
      } else {
        // Ranged shoots over battlements (-25% cover unless Huang Zhong!)
        if (!actor.officer || actor.officer.id !== 'huangzhong') {
          dmg *= 0.75;
        }
      }
    }

    const target = pickEnemyTarget(battle, actor, foes);
    if (!target) return;

    // Anti-Cavalry Spear bonus & Flanking bonus
    if (actor.unitId === 'spearman' && target.unitMeta.cavalry) dmg *= 1.55;
    if (actor.unitId === 'light_cav' && target.unitMeta.ranged) dmg *= 1.35;
    if (actor.officer && actor.officer.id === 'pangde' && target.shield > 0) dmg *= 1.4;
    if (actor.officer && actor.officer.id === 'xuhuang' && target.shield > 0) {
      target.shield = Math.round(target.shield * 0.4);
    }

    if (window.TigerAudio) {
      if (um.ranged) window.TigerAudio.arrow();
      else window.TigerAudio.clash();
    }

    const wasAlive = target.alive;
    applyDamageToStack(battle, target, dmg);

    // Officer special on-hit effects!
    if (actor.syn.fireImbue) {
      target.burn += Math.round(14 + actor.livingCount * 0.45);
    }
    if (actor.officer) {
      const oid = actor.officer.id;
      if (oid === 'guojia') target.exposed = true;
      if (oid === 'zhangliao') {
        if (isPlayer) battle.enemyMorale = Math.max(5, battle.enemyMorale - 6);
      }
      if (oid === 'zhaoyun') {
        actor.shield += Math.round(actor.livingCount * 1.8);
        const right = allies[actor.slotIdx + 1];
        if (right && right.alive) right.cdNow = Math.min(right.cdMax, right.cdNow + 0.45);
      }
      if (oid === 'lubu' || oid === 'huanggai') {
        const splashFoe = foes.find(x => x && x.kind === 'unit' && x.alive && x !== target);
        if (splashFoe) applyDamageToStack(battle, splashFoe, dmg * 0.45);
      }
      if (oid === 'taishici') {
        const backFoe = [...foes].reverse().find(x => x && x.kind === 'unit' && x.alive && x !== target);
        if (backFoe) applyDamageToStack(battle, backFoe, dmg * 0.6);
      }
      if (oid === 'guanyu' && wasAlive && !target.alive) {
        battle.playerMorale = Math.min(100, battle.playerMorale + 18);
        [allies[actor.slotIdx - 1], allies[actor.slotIdx + 1]].forEach(nb => {
          if (nb && nb.alive) nb.cdNow = Math.min(nb.cdMax, nb.cdNow + nb.cdMax * 0.35);
        });
      }
    }

    // Catapult boulder AoE splash!
    if (um.siege) {
      const splashFoe = foes.find(x => x && x.kind === 'unit' && x.alive && x !== target);
      if (splashFoe) applyDamageToStack(battle, splashFoe, dmg * 0.4);
    }

    // Zhuge Liang double-volley synergy on Ranged!
    const hasKongmingAdj =
      (actor.officer && actor.officer.id === 'zhugeliang') ||
      [allies[actor.slotIdx - 1], allies[actor.slotIdx + 1]].some(nb => nb && nb.officer && nb.officer.id === 'zhugeliang');
    if (um.ranged && hasKongmingAdj) {
      actor.volleyCounter = (actor.volleyCounter || 0) + 1;
      if (actor.volleyCounter % 2 === 0 && target.alive) {
        applyDamageToStack(battle, target, dmg * 0.65);
      }
    }
  }

  function castStratagem(battle, stratId) {
    if (battle.finished) return { ok: false, msg: 'Battle ended' };
    const st = D.STRATAGEMS.find(s => s.id === stratId);
    if (!st) return { ok: false };
    if (battle.qi < st.qiCost) return { ok: false, msg: `Need ${st.qiCost} Tactics Qi!` };

    battle.qi -= st.qiCost;
    const fireBonus = state.lordId === 'sunquan' ? 1.45 : 1.0;

    if (stratId === 'fire_attack') {
      battle.enemySlots.forEach(e => {
        if (e && e.alive) {
          e.burn += Math.round(32 * fireBonus);
          applyDamageToStack(battle, e, Math.round((55 + battle.strategistInt * 0.7) * fireBonus), true);
        }
      });
      if (window.TigerAudio) window.TigerAudio.fire();
      battle.logs.unshift(`🔥 ${battle.strategistName} unleashes SOUTHERN WIND FIRE ATTACK across enemy lines!`);
    } else if (stratId === 'war_drums') {
      battle.playerMorale = Math.min(100, battle.playerMorale + 16);
      battle.playerSlots.forEach(p => {
        if (p && p.alive) p.cdNow = Math.min(p.cdMax, p.cdNow + p.cdMax * 0.48);
      });
      if (window.TigerAudio) window.TigerAudio.drum(true);
      battle.logs.unshift(`🥁 THUNDEROUS BATTLE DRUMS! All allied stacks surge +48% action bar & +16 Morale!`);
    } else if (stratId === 'stone_maze') {
      battle.enemyMorale = Math.max(5, battle.enemyMorale - 12);
      battle.enemySlots.forEach(e => {
        if (e && e.alive) e.stunTimer = Math.max(e.stunTimer, 2.6);
      });
      if (window.TigerAudio) window.TigerAudio.pluck(5);
      battle.logs.unshift(`🪨 STONE SENTINEL MAZE! Enemy army bewildered & stunned for 2.6s!`);
    } else if (stratId === 'straw_boats') {
      battle.playerSlots.forEach(p => {
        if (p && p.alive && p.kind === 'unit') {
          p.shield += Math.round(80 + battle.strategistInt * 0.8);
          if (p.unitMeta.ranged) p.cdNow = p.cdMax;
        }
      });
      if (window.TigerAudio) window.TigerAudio.arrow();
      battle.logs.unshift(`⛵ BORROWING ARROWS WITH STRAW BOATS! Allied Shields raised & Ranged stacks fire immediately!`);
    } else if (stratId === 'flood_seven') {
      if (battle.wallHp > 0) {
        battle.wallHp = Math.max(0, battle.wallHp - 360);
      }
      battle.enemySlots.forEach(e => {
        if (e && e.alive) {
          e.shield = 0;
          applyDamageToStack(battle, e, 48, true);
          e.cdNow = Math.max(0, e.cdNow - 0.8);
        }
      });
      if (window.TigerAudio) window.TigerAudio.drum(true);
      battle.logs.unshift(`🌊 FLOOD THE SEVEN ARMIES! Torrential waters smash walls & strip all enemy Shields!`);
    }

    checkBattleVictory(battle);
    return { ok: true };
  }

  function checkBattleVictory(battle) {
    const pAlive = battle.playerSlots.some(s => s && s.kind === 'unit' && s.alive);
    const eAlive = battle.enemySlots.some(s => s && s.kind === 'unit' && s.alive);

    if (!eAlive && !battle.finished) {
      battle.finished = true;
      battle.winner = 'player';
      battle.paused = true;
      battle.logs.unshift(`🏆 VICTORY! ${battle.node.name} has fallen before your Tiger Tally!`);
      if (window.TigerAudio) window.TigerAudio.fanfare(true);
    } else if (!pAlive && !battle.finished) {
      battle.finished = true;
      battle.winner = 'enemy';
      battle.paused = true;
      state.runStatus = 'defeat';
      saveRun();
      battle.logs.unshift(`💀 DEFEAT! Your Warband was overwhelmed at ${battle.node.name}...`);
      if (window.TigerAudio) window.TigerAudio.fanfare(false);
    }
  }

  function tickBattle(battle, rawDt) {
    if (!battle || battle.paused || battle.finished) return;
    const dt = Math.min(0.1, rawDt) * battle.speed;
    battle.clock += dt;

    // Regenerate Chief Strategist Tactics Qi!
    let qiRate = 3.2 + (battle.strategistInt / 26);
    battle.playerSlots.forEach(s => {
      if (s && s.officer && s.alive) {
        if (s.officer.id === 'zhugeliang') qiRate *= 1.45;
        if (s.officer.id === 'guojia' || s.officer.id === 'zhouyu') qiRate *= 1.3;
      }
    });
    battle.qi = Math.min(battle.qiMax, battle.qi + qiRate * dt);

    const fireMult = state.lordId === 'sunquan' ? 1.45 : 1.0;
    const prevClock = battle.clock - dt;
    const crossedSecond = Math.floor(prevClock) < Math.floor(battle.clock);

    // Tick all stacks
    const allActors = [...battle.playerSlots, ...battle.enemySlots].filter(x => x && x.alive);
    allActors.forEach(actor => {
      // Bazaar-style Burn DoT ticks cleanly once per second!
      if (crossedSecond && actor.kind === 'unit' && actor.burn >= 1) {
        const burnDmg = Math.round(actor.burn * (actor.side === 'enemy' ? fireMult : 1));
        actor.hp = Math.max(0, actor.hp - burnDmg);
        actor.livingCount = Math.ceil(actor.hp / actor.unitMeta.hpPerSoldier);
        actor.burn = Math.max(0, Math.floor(actor.burn * 0.82) - 2);
        if (actor.hp <= 0) {
          handleStackDeath(battle, actor);
          return;
        }
      }

      if (actor.stunTimer > 0) {
        if (actor.syn && actor.syn.antiStun) {
          actor.stunTimer = 0;
        } else {
          actor.stunTimer = Math.max(0, actor.stunTimer - dt);
          return;
        }
      }

      const hastePct = actor.syn ? (actor.syn.hastePct || 0) : 0;
      const hasteMult = Math.max(0.4, 1 + hastePct / 100);
      actor.cdNow += dt * hasteMult;

      if (actor.cdNow >= actor.cdMax) {
        actor.cdNow -= actor.cdMax;
        fireUnitAction(battle, actor);
      }
    });

    // Enemy Castle Arrow Towers fire lightly while Wall stands!
    if (battle.wallHp > 0 && Math.floor((battle.clock - dt) / 3.2) < Math.floor(battle.clock / 3.2)) {
      const frontAlly = battle.playerSlots.find(s => s && s.kind === 'unit' && s.alive);
      if (frontAlly) {
        applyDamageToStack(battle, frontAlly, 24 + battle.node.act * 10);
      }
    }

    checkBattleVictory(battle);
  }

  return {
    createNewRun,
    loadRun,
    clearSave,
    getState,
    getOfficer,
    getOfficerLocation,
    assignOfficerToBuilding,
    assignOfficerToSlot,
    unassignOfficerEverywhere,
    getTotalPop,
    getTotalArmySoldiers,
    adjustWorkers,
    computeEconomyForecast,
    getForgeCost,
    forgeArmory,
    upgradeBuilding,
    musterTroops,
    swapWarbandSlots,
    placeRelicFromBag,
    storeRelicToBag,
    disbandSlot,
    computeBoardSynergies,
    selectWatchDoor,
    buyEncounterOffer,
    finishEncounterAndAdvance,
    completeCampaignNodeAndAdvanceSeason,
    resolvePrisonerChoice,
    createBattleSession,
    resolvePreBattleDuel,
    skipDuelAndStart,
    castStratagem,
    tickBattle
  };
})();
