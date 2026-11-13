// ============================================================================
// TIGER TALLY: MANDATE OF CHAOS — Tactile Tabletop UI & Real-Time Battle View
// ============================================================================

(function () {
  const D = window.TIGER_DATA;
  const E = window.TigerEngine;
  const A = window.TigerAudio;

  let selectedToken = null; // { type: 'peasant' } | { type: 'officer', id: 'guanyu' } | { type: 'warband_slot', idx: 0 }
  let dragPayload = null;
  let activeBattle = null;
  let rafId = null;
  let lastFrameTs = 0;
  let showManual = false;

  function toast(msg) {
    const wrap = document.getElementById('toast-container');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, 2900);
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // MASTER RENDERER (Strategic Tabletop)
  // ==========================================================================
  function renderApp() {
    const root = document.getElementById('app-root');
    const st = E.getState();

    if (!st) {
      renderStartScreen(root);
      return;
    }

    if (st.runStatus === 'victory' || st.runStatus === 'defeat') {
      renderEndRunScreen(root, st);
      return;
    }

    const lord = D.WARLORDS.find(w => w.id === st.lordId) || D.WARLORDS[0];
    const season = D.SEASONS[st.seasonIdx % 4];
    const fc = E.computeEconomyForecast();
    const synergies = E.computeBoardSynergies();
    const popTotal = E.getTotalPop();
    const armyTotal = E.getTotalArmySoldiers();
    const curNode = D.CAMPAIGN_NODES[st.step - 1];

    const orderClass = st.order >= 70 ? 'order-high' : (st.order < 38 ? 'order-low' : '');

    root.innerHTML = `
      <!-- TOP IMPERIAL HUD -->
      <header class="hud-bar">
        <div class="hud-brand">
          <div class="seal-stamp" style="background:linear-gradient(135deg, ${lord.color}, #3b0d0c)">${lord.crest}</div>
          <div class="hud-title-wrap">
            <h1>Tiger Tally: Mandate of Chaos</h1>
            <div class="hud-sub">
              <span><b>${esc(lord.name)}</b> · ${esc(lord.doctrineName)}</span>
              <span>|</span>
              <span>${season.icon} <b>${st.year} AD — ${esc(season.name)}</b></span>
            </div>
          </div>
        </div>

        <div class="hud-resources">
          <div class="res-pill" title="Imperial Gold Taels — used in The Bazaar, Tavern, & Building Upgrades">
            <span>🪙</span>
            <div><div class="res-label">Gold</div><div class="res-val" style="color:#fbbf24">${st.gold}</div></div>
          </div>
          <div class="res-pill" title="Granary Rations — feeds Peasants & Mustered Soldiers each Season">
            <span>🌾</span>
            <div><div class="res-label">Grain</div><div class="res-val" style="color:#a3e635">${st.grain}</div></div>
          </div>
          <div class="res-pill" title="Iron Ingots — forged into Spears, Shields, Halberds & Catapults">
            <span>⛏️</span>
            <div><div class="res-label">Iron</div><div class="res-val" style="color:#93c5fd">${st.iron}</div></div>
          </div>
          <div class="res-pill" title="Seasoned Timber — used for Crossbows, Shafts, Siege & Upgrades">
            <span>🎋</span>
            <div><div class="res-label">Timber</div><div class="res-val" style="color:#fdba74">${st.wood}</div></div>
          </div>
          <div class="res-pill" title="Free Peasants / Total County Workforce (Drag or assign to buildings & muster)">
            <span>👨‍🌾</span>
            <div><div class="res-label">Peasants</div><div class="res-val" style="color:#ecfccb">${st.freePeasants} <span style="font-size:11px;color:#9ca3af">/ ${popTotal}</span></div></div>
          </div>
          <div class="res-pill" title="Total Living Soldiers across your Warband Stacks">
            <span>⚔️</span>
            <div><div class="res-label">Army</div><div class="res-val" style="color:#fca5a5">${armyTotal}</div></div>
          </div>
          <div class="res-pill ${orderClass}" title="County Order / Happiness (Lords of the Realm II): ≥70 attracts +15 Peasants; Conscription & Taxes lower Order">
            <span>⚖️</span>
            <div><div class="res-label">Order</div><div class="res-val" style="color:${st.order >= 70 ? '#34d399' : (st.order < 38 ? '#f87171' : '#fde68a')}">${st.order}/100</div></div>
          </div>
        </div>

        <div class="hud-actions">
          <button class="btn btn-xs" id="btn-manual">📖 Field Manual</button>
          <button class="btn btn-xs" id="btn-mute">${A.isMuted() ? '🔇 Muted' : '🔊 Sound'}</button>
          <button class="btn btn-xs" id="btn-abandon" title="Start a new Warlord campaign">🏳️ New Run</button>
        </div>
      </header>

      <!-- WATCH TRACKER & 3-ACT CAMPAIGN PROGRESS -->
      <div class="campaign-ribbon">
        <div class="watch-track">
          <span style="font-size:12px;font-weight:800;color:var(--amber-soft);margin-right:4px">SEASON WATCHES:</span>
          <span class="watch-pip ${st.watch > 1 ? 'done' : (st.watch === 1 ? 'active' : '')}">🌅 Watch I: Morning</span>
          <span class="watch-pip ${st.watch > 2 ? 'done' : (st.watch === 2 ? 'active' : '')}">☀️ Watch II: Noon</span>
          <span class="watch-pip ${st.watch > 3 ? 'done' : (st.watch === 3 ? 'active' : '')}">🌇 Watch III: Dusk</span>
          <span class="watch-pip ${st.watch === 4 ? 'active' : ''}">🥁 Campaign Clash: ${esc(curNode.name)}</span>
        </div>

        <div class="act-progress">
          <span><b>Act ${curNode.act}/3</b> Campaign Road:</span>
          ${D.CAMPAIGN_NODES.map(n => {
            const cls = n.step < st.step ? 'cleared' : (n.step === st.step ? 'current' : '');
            return `<span class="node-dot ${cls}" title="Step ${n.step}: ${esc(n.name)} (${n.boss ? 'Act Boss Siege' : 'Battle'})">${n.boss ? '🏯' : n.step}</span>`;
          }).join('')}
        </div>
      </div>

      <!-- MAIN 2-COLUMN WAR TABLE -->
      <main class="war-room">
        <!-- LEFT SIDEBAR: COUNTY GOVERNANCE, ARMORY, & OFFICER ROSTER -->
        <aside class="left-col">
          <!-- 1. LORDS OF THE REALM II COUNTY GOVERNANCE -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">⚖️ Prefecture Governance</h2>
              <span class="badge">LOTR2 Economy</span>
            </div>

            <div class="dial-group">
              <div class="dial-label">
                <span>Granary Rations</span>
                <span style="color:var(--amber-soft)">Season Need: ~${fc.rawFoodNeed} 🌾</span>
              </div>
              <div class="segmented">
                ${D.RATION_LEVELS.map(r => `
                  <button class="seg-btn ${st.rationId === r.id ? 'active' : ''}" data-ration="${r.id}" title="Order ${r.orderDelta >= 0 ? '+' : ''}${r.orderDelta}/Season, Battle Morale ${r.moraleBonus >= 0 ? '+' : ''}${r.moraleBonus}">
                    ${r.id.charAt(0).toUpperCase() + r.id.slice(1)}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="dial-group">
              <div class="dial-label">
                <span>Prefecture Tax Rate</span>
                <span style="color:#fbbf24">+${fc.taxGold} 🪙 / Season</span>
              </div>
              <div class="segmented">
                ${D.TAX_RATES.map(t => `
                  <button class="seg-btn ${st.taxId === t.id ? 'active' : ''}" data-tax="${t.id}" title="Order ${t.orderDelta >= 0 ? '+' : ''}${t.orderDelta}/Season">
                    ${t.id === 'none' ? '0%' : (t.id === 'light' ? '8%' : (t.id === 'standard' ? '15%' : '25%'))}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="forecast-box">
              <div class="forecast-item">Watch Yield: <span class="pos">+${fc.grainWatch}🌾 +${fc.ironWatch}⛏️ +${fc.woodWatch}🎋</span></div>
              <div class="forecast-item">Order Drift: <span class="${fc.orderDelta >= 0 ? 'pos' : 'neg'}">${fc.orderDelta >= 0 ? '+' : ''}${fc.orderDelta} / Season</span></div>
              ${fc.tuntianGrain + fc.oxGrain > 0 ? `<div class="forecast-item">Garrison/Ox: <span class="pos">+${fc.tuntianGrain + fc.oxGrain} 🌾</span></div>` : ''}
              ${fc.horseSeason > 0 ? `<div class="forecast-item">Pasture Foals: <span class="pos">+${fc.horseSeason} 🐎</span></div>` : ''}
            </div>
          </section>

          <!-- 2. DISCRETE PREFECTURE ARMORY -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">🛡️ Prefecture Armory</h2>
              <span class="badge">Discrete Gear</span>
            </div>
            <div class="armory-grid">
              ${Object.values(D.ARMORY_ITEMS).map(g => {
                const qty = st.armory[g.id] || 0;
                return `
                  <div class="armory-card ${qty >= g.batch ? 'has-stock' : ''}">
                    <div>
                      <div class="armory-name">${g.icon} ${esc(g.name)}</div>
                      <div class="armory-sub">${g.bredAtPasture ? 'Bred at Pasture' : `Batch: ${g.batch}`}</div>
                    </div>
                    <div class="armory-qty">${qty}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>

          <!-- 3. ROTK GENERALS ROSTER (CLICK OR DRAG TO WARBAND / BUILDINGS!) -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">🐉 Generals Roster (${st.ownedOfficers.length})</h2>
              <span class="badge">Drag or Click</span>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">
              Click or drag a General onto a <b>Warband Stack</b> (to command & duel) or a <b>Building</b> (to boost harvest/smithy)!
            </div>
            <div class="officer-list">
              ${st.ownedOfficers.map(oid => {
                const o = E.getOfficer(oid);
                const loc = E.getOfficerLocation(oid);
                let locLabel = 'Idle in Court';
                if (loc.area === 'warband') locLabel = `⚔️ Leading Slot ${loc.index + 1}`;
                else if (loc.area === 'building') {
                  const bm = D.BUILDINGS.find(b => b.id === loc.buildingId);
                  locLabel = `🏛️ ${bm ? bm.name : loc.buildingId}`;
                }
                const isSel = selectedToken && selectedToken.type === 'officer' && selectedToken.id === oid;
                return `
                  <div class="officer-card ${isSel ? 'selected-token' : ''}" draggable="true" data-officer-card="${oid}">
                    <div class="off-top">
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="off-avatar" style="background:${o.color}">${o.seal}</div>
                        <div>
                          <div style="font-size:13px;font-weight:800;color:#fffbeb">${esc(o.name)} <span style="font-size:10.5px;color:var(--text-muted)">(${esc(o.courtesy)})</span></div>
                          <div style="font-size:10.5px;color:var(--jade)">${esc(locLabel)}</div>
                        </div>
                      </div>
                      <span class="off-role-tag">${esc(o.traitName)}</span>
                    </div>
                    <div class="off-stats">
                      <span class="stat-chip">WAR <b>${o.war}</b></span>
                      <span class="stat-chip">INT <b>${o.int}</b></span>
                      <span class="stat-chip">POL <b>${o.pol}</b></span>
                      <span class="stat-chip">CHA <b>${o.cha}</b></span>
                    </div>
                    <div style="font-size:10.5px;color:var(--text-muted);margin-top:5px;line-height:1.35">
                      ${esc(o.battleDesc)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        </aside>

        <!-- RIGHT WAR TABLE: BAZAAR WATCHES, 7-SLOT WARBAND, & STACKLANDS COMMANDERY -->
        <div class="right-col">
          <!-- SECTION A: THE BAZAAR WATCH ENCOUNTERS OR CAMPAIGN SIEGE BANNER -->
          ${renderBazaarOrSiegeSection(st, curNode, fc)}

          <!-- SECTION B: 7-SLOT WARBAND FORMATION BOARD (THE BAZAAR ADJACENCY × HOMM STACKS) -->
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">🚩 Warband Formation & Spatial Relics (${st.unlockedSlots}/7 Slots Unlocked)</h2>
                <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">
                  Arrange <b>Unit Stacks</b> and <b>Relic Engines</b> side-by-side! Left/Right adjacency triggers live Haste, Fire Bolts, Ward & Oath synergies.
                </div>
              </div>
              <span class="badge">The Bazaar × HoMM</span>
            </div>

            <div class="formation-row">
              ${st.warband.map((slot, idx) => renderWarbandSlot(st, slot, idx, synergies[idx])).join('')}
            </div>

            ${st.relicBag.length > 0 ? `
              <div style="margin-top:10px;padding-top:9px;border-top:1px dashed var(--border-subtle);display:flex;flex-wrap:wrap;align-items:center;gap:8px">
                <span style="font-size:11.5px;font-weight:800;color:var(--violet)">🎒 Relic Stash (${st.relicBag.length}):</span>
                ${st.relicBag.map((rid, bIdx) => {
                  const rm = D.RELICS[rid];
                  return `
                    <button class="btn btn-xs" data-equip-relic="${bIdx}" title="${esc(rm.desc)} — Click to place in an open Warband Slot!">
                      ${rm.icon} ${esc(rm.name)} ➕ Place
                    </button>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </section>

          <!-- SECTION C: STACKLANDS COMMANDERY WORKTABLE, SMITHY & TIGER TALLY MUSTER -->
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">🏯 Commandery Worktable, Imperial Smithy & Tiger Tally Muster</h2>
                <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">
                  Drag <b>👨‍🌾 10 Peasants</b> or <b>🐉 Generals</b> onto Buildings, forge discrete Weapons at the Smithy, and Muster troops into your Warband!
                </div>
              </div>
              <span class="badge">Stacklands × LOTR2</span>
            </div>

            <!-- Tactile Draggable Peasant Workforce Bar -->
            <div class="worktable-top-tokens">
              <div class="peasant-stack-token ${selectedToken && selectedToken.type === 'peasant' ? 'selected-token' : ''}"
                   draggable="${st.freePeasants >= 10 ? 'true' : 'false'}"
                   id="token-peasant-stack"
                   title="Drag onto any Prefecture Building or click then click a Building!">
                <span>👨‍🌾</span>
                <span>Free Workforce: <b>${st.freePeasants} Peasants</b> (${Math.floor(st.freePeasants / 10)}× Work-Stacks)</span>
              </div>
              ${selectedToken ? `
                <span class="badge" style="border-color:var(--jade);color:var(--jade)">
                  Selected: ${selectedToken.type === 'peasant' ? '10 Peasants (Click a Building or Muster!)' : `General ${E.getOfficer(selectedToken.id)?.name} (Click a Warband Stack or Building!)`}
                </span>
                <button class="btn btn-xs" id="btn-clear-sel">✖ Cancel</button>
              ` : `
                <span style="font-size:11.5px;color:var(--text-dim)">💡 Tip: Drag cards directly OR use the quick <b>+10 / -10 / Forge / Muster</b> buttons!</span>
              `}
            </div>

            <!-- 6 Upgradable Prefecture Buildings -->
            <div class="buildings-grid">
              ${D.BUILDINGS.map(meta => renderBuildingCard(st, meta)).join('')}
            </div>

            <!-- Two Side-by-Side Crafting Benches: 1) Smithy Forging  2) Tiger Tally Army Muster -->
            <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:14px;margin-top:14px">
              <!-- SMITHY FORGING -->
              <div style="background:rgba(12,10,8,0.55);border:1px solid var(--border-subtle);border-radius:10px;padding:11px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-size:12.5px;font-weight:800;color:var(--amber-soft)">⚒️ Imperial Smithy Bench</span>
                  <span style="font-size:10.5px;color:var(--text-muted)">Wood: <b>${st.wood}</b> · Iron: <b>${st.iron}</b></span>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${['spear', 'shield', 'crossbow', 'halberd', 'catapult'].map(gid => {
                    const g = D.ARMORY_ITEMS[gid];
                    const cost = E.getForgeCost(gid);
                    const can = st.wood >= cost.wood && st.iron >= cost.iron;
                    return `
                      <div style="display:flex;align-items:center;justify-content:space-between;background:#191410;border:1px solid ${can ? 'rgba(212,168,83,0.45)' : 'var(--border-subtle)'};padding:6px 9px;border-radius:7px">
                        <div>
                          <div style="font-size:12px;font-weight:700">${g.icon} +${cost.batch} ${esc(g.name)}</div>
                          <div style="font-size:10.5px;color:var(--text-muted)">Requires: <b>${cost.wood}</b>🎋 Timber · <b>${cost.iron}</b>⛏️ Iron (Have: ${st.armory[gid] || 0})</div>
                        </div>
                        <button class="btn btn-xs ${can ? 'btn-primary' : ''}" data-forge="${gid}" ${can ? '' : 'disabled'}>⚒️ Forge</button>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- TIGER TALLY MUSTER SEAL -->
              <div style="background:rgba(12,10,8,0.55);border:1px solid var(--border-bronze);border-radius:10px;padding:11px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-size:12.5px;font-weight:800;color:#fca5a5">🐅 Tiger Tally Muster Seal (Raise / Merge Stacks)</span>
                  <span style="font-size:10.5px;color:var(--text-muted)">Free Peasants: <b>${st.freePeasants}</b> (Order -${st.lordId === 'caocao' ? 3 : 6})</span>
                </div>
                <div class="recipe-grid">
                  ${Object.values(D.UNITS).map(u => {
                    const hasPeasants = st.freePeasants >= u.peasantsReq;
                    const hasGear = Object.entries(u.gearReq).every(([k, v]) => (st.armory[k] || 0) >= v);
                    const can = hasPeasants && hasGear;
                    const gearText = Object.keys(u.gearReq).length === 0
                      ? 'Unarmed Levy'
                      : Object.entries(u.gearReq).map(([k, v]) => `${v} ${D.ARMORY_ITEMS[k].icon}`).join(' + ');
                    return `
                      <div class="recipe-card ${can ? 'can-craft' : ''}">
                        <div>
                          <div style="display:flex;justify-content:space-between;align-items:center">
                            <span style="font-size:12px;font-weight:800;color:#fffbeb">${u.icon} +${u.batchSize} ${esc(u.name)}</span>
                          </div>
                          <div style="font-size:10.5px;color:var(--amber-soft);margin-top:2px">10👨‍🌾 + ${gearText}</div>
                          <div style="font-size:10px;color:var(--text-muted);margin-top:3px;line-height:1.3">${esc(u.synergyDesc)}</div>
                        </div>
                        <button class="btn btn-xs ${can ? 'btn-crimson' : ''}" data-muster="${u.id}" ${can ? '' : 'disabled'}>
                          🐅 Muster +${u.batchSize}
                        </button>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      ${st.prisonerModal ? renderPrisonerModal(st.prisonerModal) : ''}
      ${showManual ? renderManualModal() : ''}
      <div id="battle-modal-mount"></div>
    `;

    bindStrategicEvents();
    if (activeBattle) {
      mountBattleModal();
    }
  }

  function renderBazaarOrSiegeSection(st, curNode, fc) {
    if (st.activeEncounter) {
      const enc = st.activeEncounter;
      return `
        <section class="bazaar-scroll">
          <div class="panel-header">
            <h2 class="panel-title">${enc.icon} ${esc(enc.title)} — Watch ${st.watch}/3</h2>
            <button class="btn btn-jade" id="btn-finish-enc">✅ Depart & Collect Watch Harvest (+${fc.grainWatch}🌾 +${fc.ironWatch}⛏️ +${fc.woodWatch}🎋) ➔</button>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">${esc(enc.desc)} (Your Gold: <b style="color:#fbbf24">${st.gold} 🪙</b>)</div>
          <div class="shop-shelf">
            ${enc.offers.map((off, idx) => `
              <div class="shop-item">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
                    <span style="font-size:14px;font-weight:800;color:#fef3c7">${esc(off.icon)} ${esc(off.name)}</span>
                    <span class="badge">${off.price} 🪙</span>
                  </div>
                  <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;line-height:1.4">${esc(off.desc)}</div>
                </div>
                <button class="btn ${off.sold ? '' : 'btn-primary'}" data-buy-offer="${idx}" ${off.sold || st.gold < off.price ? 'disabled' : ''}>
                  ${off.sold ? '✔ Acquired' : `🪙 Acquire (${off.price} Gold)`}
                </button>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    if (st.watch <= 3) {
      return `
        <section class="bazaar-scroll">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">🧭 Watch ${st.watch} of 3 — Choose Your Road Encounter</h2>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">
                Each Watch advances time toward Dusk, harvesting <b>+${fc.grainWatch}🌾 Grain, +${fc.ironWatch}⛏️ Iron, +${fc.woodWatch}🎋 Timber</b> from your Commandery!
              </div>
            </div>
            <button class="btn btn-crimson btn-xs" id="btn-march-early" title="Skip remaining watches and attack immediately">⚔️ March to Battle Now</button>
          </div>
          <div class="doors-grid">
            ${st.watchDoors.map((d, idx) => `
              <div class="door-card" data-door="${idx}">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="door-icon">${d.icon}</span>
                    <span class="badge">${esc(d.tag)}</span>
                  </div>
                  <div class="door-title">${esc(d.title)}</div>
                  <div class="door-desc">${esc(d.desc)}</div>
                </div>
                <div style="font-size:11.5px;font-weight:800;color:var(--amber-soft);margin-top:4px">
                  Enter Encounter ➔
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // Watch 4: Ready for Campaign Clash / Siege!
    const enemySummary = curNode.enemies.map(e => `${e.count}× ${D.UNITS[e.unitId].icon} ${D.UNITS[e.unitId].name}`).join('  ·  ');
    return `
      <section class="bazaar-scroll" style="border-color:#f87171;background:linear-gradient(135deg, #341616 0%, #19110e 100%)">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px">
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge" style="background:#991b1b;border-color:#fca5a5;color:#fff">ACT ${curNode.act} ${curNode.boss ? 'BOSS SIEGE' : 'CAMPAIGN BATTLE'}</span>
              <span style="font-size:16px;font-weight:900;color:#fef2f2">${esc(curNode.name)}</span>
            </div>
            <div style="font-size:12.5px;color:#fecaca;margin-top:5px">
              Enemy Commander: <b>${esc(curNode.enemyGeneral.name)}</b> (WAR ${curNode.enemyGeneral.war} · INT ${curNode.enemyGeneral.int})
              ${curNode.wallHp > 0 ? ` · 🧱 <b>Fortified Stone Ramparts (${curNode.wallHp} Wall HP)</b>` : ' · 🌾 Open Field Clash'}
            </div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">
               Garrison: ${esc(enemySummary)}
            </div>
            <div style="font-size:11.5px;color:var(--amber-soft);margin-top:4px">
              Victory Spoils: <b>+${curNode.rewardGold} 🪙 Gold, +${curNode.rewardGrain} 🌾 Grain</b> ${curNode.enemyGeneral.recruitId ? ` & Captive General <b>${D.OFFICERS[curNode.enemyGeneral.recruitId].name}</b>!` : ''}
            </div>
          </div>
          <button class="btn btn-crimson" id="btn-launch-battle" style="padding:12px 22px;font-size:14.5px">
            🥁 Sound War-Drums & Attack!
          </button>
        </div>
      </section>
    `;
  }

  function renderWarbandSlot(st, slot, idx, syn) {
    if (idx >= st.unlockedSlots) {
      return `
        <div class="warband-slot locked-slot">
          <div>🔒 <b>Slot ${idx + 1} Locked</b></div>
          <div style="margin-top:4px">Unlock via Strategist Pavilion Tier II or Act Boss!</div>
        </div>
      `;
    }

    const posRole = idx <= 1 ? 'Vanguard' : (idx <= 4 ? 'Center' : 'Rearguard');

    if (!slot) {
      return `
        <div class="warband-slot empty-slot" data-slot-drop="${idx}">
          <div class="slot-pos-label" style="width:100%"><span>Slot ${idx + 1} · ${posRole}</span></div>
          <div style="padding:20px 4px">
            <div style="font-size:20px;opacity:0.4">➕</div>
            <div>Empty Formation Slot</div>
            <div style="font-size:10px;margin-top:3px">Muster Troops or Place a Relic</div>
          </div>
          <div></div>
        </div>
      `;
    }

    if (slot.kind === 'relic') {
      const rm = D.RELICS[slot.relicId];
      return `
        <div class="warband-slot relic-slot" draggable="true" data-slot-drag="${idx}" data-slot-drop="${idx}">
          <div class="slot-pos-label">
            <span>Slot ${idx + 1} · Relic</span>
            <span style="color:#c4b5fd">⏱️${rm.cd}s</span>
          </div>
          <div class="slot-icon-title">
            <div class="slot-emoji">${rm.icon}</div>
            <div class="slot-name" style="color:#ddd6fe">${esc(rm.name)}</div>
          </div>
          <div class="slot-stats-mini" style="font-size:10px">
            ${esc(rm.desc)}
          </div>
          <div class="slot-controls">
            <button class="btn btn-xs" data-swap-left="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Left">◀</button>
            <button class="btn btn-xs" data-stash-relic="${idx}" title="Move Relic to Stash">🎒 Stash</button>
            <button class="btn btn-xs" data-swap-right="${idx}" ${idx >= st.unlockedSlots - 1 ? 'disabled' : ''} title="Move Right">▶</button>
          </div>
        </div>
      `;
    }

    // Unit Stack Slot!
    const um = D.UNITS[slot.unitId];
    const off = slot.officerId ? E.getOfficer(slot.officerId) : null;
    const totalAtk = Math.round(slot.count * um.atkPerSoldier * (1 + (syn.dmgPct || 0) / 100));
    const totalHp = slot.count * um.hpPerSoldier;
    const effCd = (um.cd / Math.max(0.4, 1 + (syn.hastePct || 0) / 100)).toFixed(1);

    return `
      <div class="warband-slot unit-slot" draggable="true" data-slot-drag="${idx}" data-slot-drop="${idx}">
        <div class="slot-pos-label">
          <span>Slot ${idx + 1} · ${posRole}</span>
          <span class="homm-count-badge" title="HoMM Soldier Count — multiplies stack HP & Strike Damage!">×${slot.count}</span>
        </div>

        <div class="slot-icon-title">
          <div class="slot-emoji">${um.icon}</div>
          <div class="slot-name">${esc(um.name)}</div>
        </div>

        <div class="slot-stats-mini">
          <div>⚔️ Strike: <b style="color:#fde68a">${totalAtk}</b> · ⏱️ <b>${effCd}s</b></div>
          <div>❤️ Stack HP: <b style="color:#6ee7b7">${totalHp}</b></div>
        </div>

        ${syn.tags.length > 0 ? `
          <div class="adjacency-pills">
            ${syn.tags.slice(0, 3).map(t => `<span class="adj-pill ${t.cls}">${esc(t.text)}</span>`).join('')}
          </div>
        ` : ''}

        ${off ? `
          <div class="attached-general" title="${esc(off.battleDesc)}">
            <span>${off.seal} ${esc(off.name)} (${off.war})</span>
            <span style="cursor:pointer;padding:0 3px" data-unassign-off="${off.id}" title="Unassign General">✖</span>
          </div>
        ` : `
          <div style="margin-top:5px;font-size:10px;color:var(--text-dim);text-align:center;border:1px dashed var(--border-subtle);border-radius:4px;padding:2px">
            Drop General to Lead
          </div>
        `}

        <div class="slot-controls">
          <button class="btn btn-xs" data-swap-left="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Slot Left">◀</button>
          <button class="btn btn-xs" data-disband="${idx}" title="Disband stack (returns 50% Peasants)">🏳️</button>
          <button class="btn btn-xs" data-swap-right="${idx}" ${idx >= st.unlockedSlots - 1 ? 'disabled' : ''} title="Move Slot Right">▶</button>
        </div>
      </div>
    `;
  }

  function renderBuildingCard(st, meta) {
    const b = st.buildings[meta.id];
    const maxPips = meta.maxSlots + (b.tier > 1 ? 1 : 0);
    const off = b.officerId ? E.getOfficer(b.officerId) : null;
    const title = b.tier === 2 ? meta.upgName : meta.name;

    let pipsHtml = '';
    for (let i = 0; i < maxPips; i++) {
      const filled = i < b.workers;
      pipsHtml += `<span class="worker-pip ${filled ? 'filled' : ''}">${filled ? '👨‍🌾 10' : 'Empty'}</span>`;
    }

    const upgCostStr = `${meta.upgCost.gold}🪙` +
      (meta.upgCost.wood ? ` ${meta.upgCost.wood}🎋` : '') +
      (meta.upgCost.iron ? ` ${meta.upgCost.iron}⛏️` : '');

    return `
      <div class="bldg-card" data-bldg-drop="${meta.id}">
        <div>
          <div class="bldg-head">
            <div class="bldg-title">${meta.icon} ${esc(title)}</div>
            <span class="bldg-tier">Tier ${b.tier === 2 ? 'II ★' : 'I'}</span>
          </div>
          <div style="font-size:10.5px;color:var(--text-muted);margin:4px 0 7px;line-height:1.35">${esc(meta.desc)}</div>
          <div class="worker-pips">${pipsHtml}</div>

          ${off ? `
            <div class="attached-general" style="margin-top:7px;background:rgba(13,148,136,0.2);border-color:var(--jade);color:#ccfbf1">
              <span>🏛️ Overseer: ${esc(off.name)} (${meta.statKey.toUpperCase()} ${off[meta.statKey]})</span>
              <span style="cursor:pointer" data-unassign-off="${off.id}">✖</span>
            </div>
          ` : `
            <div style="margin-top:7px;font-size:10px;color:var(--text-dim);border:1px dashed var(--border-subtle);border-radius:4px;padding:2px 6px">
              Overseer Slot (Drop General for +${meta.statKey.toUpperCase()} bonus)
            </div>
          `}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;margin-top:4px">
          <div style="display:flex;gap:4px">
            <button class="btn btn-xs" data-worker-sub="${meta.id}" ${b.workers <= 0 ? 'disabled' : ''}>-10 👨‍🌾</button>
            <button class="btn btn-xs btn-jade" data-worker-add="${meta.id}" ${b.workers >= maxPips || st.freePeasants < 10 ? 'disabled' : ''}>+10 👨‍🌾</button>
          </div>
          ${b.tier < 2 ? `
            <button class="btn btn-xs" data-upgrade-bldg="${meta.id}" title="Upgrade to ${esc(meta.upgName)} (+45% output & +1 Worker Slot!)">
              ⬆️ ${upgCostStr}
            </button>
          ` : `<span style="font-size:10.5px;color:var(--amber-soft);font-weight:700">Max Grand Tier</span>`}
        </div>
      </div>
    `;
  }

  function renderPrisonerModal(pm) {
    const off = D.OFFICERS[pm.recruitId];
    return `
      <div class="modal-backdrop">
        <div class="panel" style="max-width:540px;width:95%;border:2px solid var(--border-gold);padding:22px">
          <div class="panel-header">
            <h2 class="panel-title" style="font-size:16px">⛓️ Imperial Prisoner Judgement</h2>
            <span class="badge">ROTK Tradition</span>
          </div>
          <p style="font-size:13px;color:var(--text-main);line-height:1.5">
            After routing <b>${esc(pm.generalName)}</b>, your guards bring famed General <b>${esc(off.name)} (${esc(off.courtesy)})</b> in chains before your tent!
          </p>
          <div class="officer-card" style="cursor:default;margin:12px 0">
            <div class="off-top">
              <div style="display:flex;align-items:center;gap:8px">
                <div class="off-avatar" style="background:${off.color}">${off.seal}</div>
                <div>
                  <div style="font-weight:800">${esc(off.name)} — ${esc(off.traitName)}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${esc(off.battleDesc)}</div>
                </div>
              </div>
            </div>
            <div class="off-stats">
              <span class="stat-chip">WAR <b>${off.war}</b></span>
              <span class="stat-chip">INT <b>${off.int}</b></span>
              <span class="stat-chip">POL <b>${off.pol}</b></span>
              <span class="stat-chip">CHA <b>${off.cha}</b></span>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-top:14px">
            <button class="btn btn-jade" data-prisoner="recruit">🤝 Unbind Chains & Recruit ${esc(off.name)} into Your Roster!</button>
            <button class="btn btn-primary" data-prisoner="ransom">🪙 Release with Honor (+110 Gold Taels & +10 County Order)</button>
            <button class="btn btn-crimson" data-prisoner="execute">⚔️ Execute & Seize a Random Battlefield Relic</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderManualModal() {
    return `
      <div class="modal-backdrop" id="manual-backdrop">
        <div class="panel" style="max-width:780px;width:95%;max-height:88vh;overflow-y:auto;border:2px solid var(--border-gold);padding:22px">
          <div class="panel-header">
            <h2 class="panel-title" style="font-size:16px">📖 Imperial War-Room Field Manual</h2>
            <button class="btn btn-xs" id="btn-close-manual">✖ Close</button>
          </div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.6;display:flex;flex-direction:column;gap:10px">
            <div><b style="color:var(--amber-soft)">1. Lords of the Realm II × Stacklands Economy:</b> Assign <b>10-Peasant Stacks</b> & <b>ROTK Generals</b> onto Rice Paddies, Iron Pits, Bamboo Woods, and Pastures. Every Watch (3 per Season) harvests resources. Forge discrete <b>Longspears, Shields, Chu-Ko-Nu Crossbows, Halberds, & Catapults</b> at the Smithy, then <b>Conscript Peasants + Weapons</b> at the <b>Tiger Tally Muster Seal</b>! Watch your <b>County Order</b>—high happiness attracts volunteer peasants!</div>
            <div><b style="color:var(--amber-soft)">2. The Bazaar Watches & Spatial Adjacency:</b> Each Season has 3 Encounter Watches (Silk Road Bazaar, Winehouse Tavern, Overland Shrines). On your <b>7-Slot Warband Board</b>, place <b>Unit Stacks</b> and <b>Relic Carts</b> side-by-side: a <i>Pitch-Oil Brazier</i> between two <i>Chu-Ko-Nu Crossbow</i> stacks imbues BOTH with flaming Scorch bolts!</div>
            <div><b style="color:var(--amber-soft)">3. Heroes of Might &amp; Magic Stacks + ROTK Duels &amp; Sieges:</b> Soldier count directly multiplies Stack HP &amp; Attack (<b>36 Marksmen</b> hit 3× harder than <b>12</b>). Before battles, accept a <b>1v1 Officer Duel</b> (<i>Heaven Cleave</i> &gt; <i>Shadow Feint</i> &gt; <i>Iron Parry</i> &gt; <i>Heaven Cleave</i>) to shatter enemy Morale! During Castle Sieges, use <b>Catapults</b> or <b>Flood Seven Armies</b> to breach stone walls while spending <b>Tactics Qi</b> on Chief Strategist Stratagems!</div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // START SCREEN & RUN SUMMARY SCREEN
  // ==========================================================================
  function renderStartScreen(root) {
    const hasSave = !!localStorage.getItem('tiger_tally_save_v1');
    root.innerHTML = `
      <div class="start-screen">
        <div class="panel" style="padding:28px;border:2px solid var(--border-gold);text-align:center;background:radial-gradient(circle at 50% 0%, #312218 0%, #14100d 80%)">
          <div style="display:inline-grid;place-items:center;width:62px;height:62px;border-radius:12px;background:linear-gradient(135deg,#b91c1c,#7f1d1d);border:2px solid #fde68a;font-size:30px;font-weight:900;margin-bottom:10px;box-shadow:0 0 24px rgba(220,38,38,0.5)">虎</div>
          <h1 style="margin:0;font-size:32px;letter-spacing:1.2px;color:#fef3c7;text-transform:uppercase">Tiger Tally: Mandate of Chaos</h1>
          <p style="margin:8px auto 0;max-width:820px;color:var(--text-muted);font-size:14.5px;line-height:1.55">
            A Roguelike Grand-Tactical Synthesis of <b>Romance of the Three Kingdoms</b>, <b>The Bazaar</b>, <b>Stacklands</b>, <b>Heroes of Might &amp; Magic</b>, and <b>Lords of the Realm II</b>.
            Manage county rations &amp; peasant happiness, forge discrete armories, wire spatial Warband synergies, duel enemy champions, and storm imperial citadels.
          </p>
          ${hasSave ? `
            <div style="margin-top:18px">
              <button class="btn btn-jade" id="btn-resume-save" style="padding:11px 24px;font-size:14px">📜 Resume Saved Campaign</button>
            </div>
          ` : ''}
        </div>

        <h2 style="margin:24px 0 6px;font-size:16px;color:var(--amber-soft);text-transform:uppercase;letter-spacing:0.8px">Choose Your Starting Warlord Seal</h2>
        <div class="lord-grid">
          ${D.WARLORDS.map(w => `
            <div class="lord-card" data-pick-lord="${w.id}">
              <div>
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                  <div class="seal-stamp" style="width:46px;height:46px;font-size:22px;background:${w.color}">${w.crest}</div>
                  <div>
                    <div style="font-size:17px;font-weight:900;color:#fffbeb">${esc(w.name)}</div>
                    <div style="font-size:12px;color:var(--amber-soft)">${esc(w.title)}</div>
                  </div>
                </div>
                <div style="background:rgba(0,0,0,0.35);border:1px solid var(--border-subtle);border-radius:8px;padding:9px 11px;margin-bottom:10px">
                  <div style="font-size:11.5px;font-weight:800;color:var(--jade);margin-bottom:3px">★ ${esc(w.doctrineName)}</div>
                  <div style="font-size:12px;color:var(--text-muted);line-height:1.45">${esc(w.doctrineDesc)}</div>
                </div>
                <div style="font-size:11.5px;color:var(--text-dim)">
                  Starting Generals: <b style="color:var(--text-main)">${w.startingOfficers.map(id => D.OFFICERS[id].name).join(' & ')}</b>
                </div>
              </div>
              <button class="btn btn-primary" style="width:100%;padding:10px">🐅 Claim the Tiger Tally</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const resumeBtn = document.getElementById('btn-resume-save');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (E.loadRun()) {
          A.fanfare(true);
          renderApp();
        }
      });
    }

    root.querySelectorAll('[data-pick-lord]').forEach(el => {
      el.addEventListener('click', () => {
        const lid = el.getAttribute('data-pick-lord');
        E.createNewRun(lid);
        A.drum(true);
        A.pluck(4);
        renderApp();
      });
    });
  }

  function renderEndRunScreen(root, st) {
    const won = st.runStatus === 'victory';
    const lord = D.WARLORDS.find(w => w.id === st.lordId) || D.WARLORDS[0];
    root.innerHTML = `
      <div class="start-screen" style="max-width:720px;text-align:center">
        <div class="panel" style="padding:32px;border:2px solid ${won ? '#fbbf24' : '#ef4444'}">
          <div style="font-size:52px">${won ? '🐉' : '⚔️'}</div>
          <h1 style="font-size:28px;color:${won ? '#fde68a' : '#fca5a5'};margin:8px 0">
            ${won ? 'THE MANDATE OF HEAVEN IS YOURS!' : 'YOUR BANNER HAS FALLEN'}
          </h1>
          <p style="color:var(--text-muted);font-size:14px;line-height:1.55">
            ${won
              ? `Under ${esc(lord.name)}, your Prefectures prospered, your armories thundered, and the Imperial Host at Red Cliffs bowed before your Tiger Tally!`
              : `${esc(lord.name)}'s campaign ended at Step ${st.step}/8 (${esc(D.CAMPAIGN_NODES[st.step - 1]?.name || '')}). Every dynasty learns from ash.`}
          </p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:20px 0;text-align:left;background:rgba(0,0,0,0.4);padding:14px;border-radius:10px">
            <div>🏆 Battles Won: <b>${st.stats.battlesWon} / 8</b></div>
            <div>⚔️ 1v1 Duels Won: <b>${st.stats.duelsWon}</b></div>
            <div>⚒️ Weapons Forged: <b>${st.stats.weaponsForged}</b></div>
            <div>🐅 Soldiers Mustered: <b>${st.stats.troopsMustered}</b></div>
            <div>🐉 Generals Recruited: <b>${st.ownedOfficers.length}</b></div>
            <div>🪙 Treasury Remaining: <b>${st.gold} Gold</b></div>
          </div>
          <button class="btn btn-primary" id="btn-play-again" style="padding:12px 28px;font-size:15px">🔄 Forge a New Dynasty</button>
        </div>
      </div>
    `;
    document.getElementById('btn-play-again').addEventListener('click', () => {
      E.clearSave();
      renderApp();
    });
  }

  // ==========================================================================
  // STRATEGIC EVENT BINDINGS (DRAG-AND-DROP + ONE-CLICK ACTIONS)
  // ==========================================================================
  function bindStrategicEvents() {
    const st = E.getState();
    if (!st) return;

    const btnMute = document.getElementById('btn-mute');
    if (btnMute) btnMute.onclick = () => { A.toggleMute(); renderApp(); };

    const btnManual = document.getElementById('btn-manual');
    if (btnManual) btnManual.onclick = () => { showManual = true; renderApp(); };

    const btnCloseManual = document.getElementById('btn-close-manual');
    if (btnCloseManual) btnCloseManual.onclick = () => { showManual = false; renderApp(); };

    const btnAbandon = document.getElementById('btn-abandon');
    if (btnAbandon) btnAbandon.onclick = () => {
      E.clearSave();
      selectedToken = null;
      renderApp();
    };

    const btnClearSel = document.getElementById('btn-clear-sel');
    if (btnClearSel) btnClearSel.onclick = () => { selectedToken = null; renderApp(); };

    // Rations & Tax Dials
    document.querySelectorAll('[data-ration]').forEach(btn => {
      btn.onclick = () => {
        st.rationId = btn.getAttribute('data-ration');
        A.pluck(2);
        renderApp();
      };
    });
    document.querySelectorAll('[data-tax]').forEach(btn => {
      btn.onclick = () => {
        st.taxId = btn.getAttribute('data-tax');
        A.pluck(1);
        renderApp();
      };
    });

    // Peasant Stack Token Click & Drag
    const pToken = document.getElementById('token-peasant-stack');
    if (pToken) {
      pToken.onclick = () => {
        if (st.freePeasants < 10) { toast('Need at least 10 Free Peasants!'); return; }
        selectedToken = (selectedToken && selectedToken.type === 'peasant') ? null : { type: 'peasant' };
        A.pluck(3);
        renderApp();
      };
      pToken.ondragstart = (ev) => {
        dragPayload = { type: 'peasant' };
        ev.dataTransfer.setData('text/plain', 'peasant');
      };
    }

    // Officer Roster Click & Drag
    document.querySelectorAll('[data-officer-card]').forEach(card => {
      const oid = card.getAttribute('data-officer-card');
      card.onclick = () => {
        selectedToken = (selectedToken && selectedToken.type === 'officer' && selectedToken.id === oid)
          ? null
          : { type: 'officer', id: oid };
        A.pluck(4);
        renderApp();
      };
      card.ondragstart = (ev) => {
        dragPayload = { type: 'officer', id: oid };
        ev.dataTransfer.setData('text/plain', oid);
      };
    });

    // Unassign Officer X buttons
    document.querySelectorAll('[data-unassign-off]').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const oid = btn.getAttribute('data-unassign-off');
        E.unassignOfficerEverywhere(oid);
        A.pluck(1);
        renderApp();
      };
    });

    // Building Drop Targets & +/-10 Worker & Upgrade Buttons
    document.querySelectorAll('[data-bldg-drop]').forEach(card => {
      const bid = card.getAttribute('data-bldg-drop');
      card.ondragover = (ev) => { ev.preventDefault(); card.classList.add('drag-over'); };
      card.ondragleave = () => card.classList.remove('drag-over');
      card.ondrop = (ev) => {
        ev.preventDefault();
        card.classList.remove('drag-over');
        if (!dragPayload) return;
        if (dragPayload.type === 'peasant') {
          const res = E.adjustWorkers(bid, +1);
          if (!res.ok) toast(res.msg); else A.pluck(2);
        } else if (dragPayload.type === 'officer') {
          E.assignOfficerToBuilding(dragPayload.id, bid);
          toast(`Assigned ${E.getOfficer(dragPayload.id).name} to oversee ${bid}!`);
          A.pluck(5);
        }
        dragPayload = null;
        renderApp();
      };
      card.onclick = (ev) => {
        if (ev.target.closest('button') || ev.target.closest('[data-unassign-off]')) return;
        if (!selectedToken) return;
        if (selectedToken.type === 'peasant') {
          const res = E.adjustWorkers(bid, +1);
          if (!res.ok) toast(res.msg); else A.pluck(2);
          selectedToken = null;
          renderApp();
        } else if (selectedToken.type === 'officer') {
          E.assignOfficerToBuilding(selectedToken.id, bid);
          toast(`Assigned ${E.getOfficer(selectedToken.id).name} as Overseer!`);
          selectedToken = null;
          A.pluck(5);
          renderApp();
        }
      };
    });

    document.querySelectorAll('[data-worker-add]').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const res = E.adjustWorkers(btn.getAttribute('data-worker-add'), +1);
        if (!res.ok) toast(res.msg); else A.pluck(3);
        renderApp();
      };
    });
    document.querySelectorAll('[data-worker-sub]').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        E.adjustWorkers(btn.getAttribute('data-worker-sub'), -1);
        A.pluck(1);
        renderApp();
      };
    });
    document.querySelectorAll('[data-upgrade-bldg]').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const res = E.upgradeBuilding(btn.getAttribute('data-upgrade-bldg'));
        toast(res.msg);
        if (res.ok) A.anvil();
        renderApp();
      };
    });

    // Smithy Forge Buttons
    document.querySelectorAll('[data-forge]').forEach(btn => {
      btn.onclick = () => {
        const res = E.forgeArmory(btn.getAttribute('data-forge'));
        toast(res.msg);
        if (res.ok) A.anvil();
        renderApp();
      };
    });

    // Tiger Tally Muster Buttons
    document.querySelectorAll('[data-muster]').forEach(btn => {
      btn.onclick = () => {
        const res = E.musterTroops(btn.getAttribute('data-muster'));
        toast(res.msg);
        if (res.ok) A.drum(false);
        renderApp();
      };
    });

    // Warband Slot Reordering, Officer Attachment & Relic Placement
    document.querySelectorAll('[data-slot-drag]').forEach(el => {
      const idx = Number(el.getAttribute('data-slot-drag'));
      el.ondragstart = (ev) => {
        dragPayload = { type: 'warband_slot', idx };
        ev.dataTransfer.setData('text/plain', String(idx));
      };
    });

    document.querySelectorAll('[data-slot-drop]').forEach(el => {
      const idx = Number(el.getAttribute('data-slot-drop'));
      el.ondragover = (ev) => { ev.preventDefault(); el.classList.add('drag-over'); };
      el.ondragleave = () => el.classList.remove('drag-over');
      el.ondrop = (ev) => {
        ev.preventDefault();
        el.classList.remove('drag-over');
        if (!dragPayload) return;
        if (dragPayload.type === 'warband_slot') {
          E.swapWarbandSlots(dragPayload.idx, idx);
          A.pluck(4);
        } else if (dragPayload.type === 'officer') {
          if (E.assignOfficerToSlot(dragPayload.id, idx)) {
            toast(`${E.getOfficer(dragPayload.id).name} now commands Slot ${idx + 1}!`);
            A.drum(false);
          } else {
            toast('Generals can only attach to a Troop Stack!');
          }
        }
        dragPayload = null;
        renderApp();
      };
      el.onclick = (ev) => {
        if (ev.target.closest('button') || ev.target.closest('[data-unassign-off]')) return;
        if (selectedToken && selectedToken.type === 'officer') {
          if (E.assignOfficerToSlot(selectedToken.id, idx)) {
            toast(`${E.getOfficer(selectedToken.id).name} now commands Slot ${idx + 1}!`);
            selectedToken = null;
            A.drum(false);
            renderApp();
          } else {
            toast('Select a Unit Stack slot to attach this General!');
          }
        }
      };
    });

    document.querySelectorAll('[data-swap-left]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-swap-left'));
        E.swapWarbandSlots(idx, idx - 1);
        A.pluck(2);
        renderApp();
      };
    });
    document.querySelectorAll('[data-swap-right]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-swap-right'));
        E.swapWarbandSlots(idx, idx + 1);
        A.pluck(3);
        renderApp();
      };
    });
    document.querySelectorAll('[data-stash-relic]').forEach(btn => {
      btn.onclick = () => {
        E.storeRelicToBag(Number(btn.getAttribute('data-stash-relic')));
        A.pluck(1);
        renderApp();
      };
    });
    document.querySelectorAll('[data-equip-relic]').forEach(btn => {
      btn.onclick = () => {
        const bIdx = Number(btn.getAttribute('data-equip-relic'));
        const emptyIdx = st.warband.findIndex((s, i) => i < st.unlockedSlots && s === null);
        if (emptyIdx === -1) {
          toast('Open a free Warband Slot first (stash a relic or disband chaff)!');
          return;
        }
        E.placeRelicFromBag(bIdx, emptyIdx);
        A.pluck(5);
        renderApp();
      };
    });
    document.querySelectorAll('[data-disband]').forEach(btn => {
      btn.onclick = () => {
        E.disbandSlot(Number(btn.getAttribute('data-disband')));
        toast('Unit disbanded — 50% returned to Free Peasants.');
        renderApp();
      };
    });

    // Bazaar Watch Doors & Shop Purchases
    document.querySelectorAll('[data-door]').forEach(card => {
      card.onclick = () => {
        const res = E.selectWatchDoor(Number(card.getAttribute('data-door')));
        A.pluck(4);
        if (res.instantMsg) toast(res.instantMsg);
        renderApp();
      };
    });

    document.querySelectorAll('[data-buy-offer]').forEach(btn => {
      btn.onclick = () => {
        const res = E.buyEncounterOffer(Number(btn.getAttribute('data-buy-offer')));
        toast(res.msg);
        if (res.ok) A.pluck(6);
        renderApp();
      };
    });

    const btnFinishEnc = document.getElementById('btn-finish-enc');
    if (btnFinishEnc) {
      btnFinishEnc.onclick = () => {
        E.finishEncounterAndAdvance();
        A.pluck(3);
        toast('Watch Harvest collected into your Granary & Storehouses!');
        renderApp();
      };
    }

    const btnMarchEarly = document.getElementById('btn-march-early');
    if (btnMarchEarly) {
      btnMarchEarly.onclick = () => {
        startCampaignBattle();
      };
    }

    const btnLaunchBattle = document.getElementById('btn-launch-battle');
    if (btnLaunchBattle) {
      btnLaunchBattle.onclick = () => {
        startCampaignBattle();
      };
    }

    // Prisoner Judgement Modal buttons
    document.querySelectorAll('[data-prisoner]').forEach(btn => {
      btn.onclick = () => {
        const msg = E.resolvePrisonerChoice(btn.getAttribute('data-prisoner'));
        if (msg) toast(msg);
        A.fanfare(true);
        renderApp();
      };
    });
  }

  // ==========================================================================
  // REAL-TIME BATTLE, 1v1 DUEL & CASTLE SIEGE CONTROLLER (60FPS ZERO-FLICKER)
  // ==========================================================================
  function startCampaignBattle() {
    if (E.getTotalArmySoldiers() <= 0) {
      toast('Muster at least 1 Troop Stack on your Warband before marching!');
      return;
    }
    activeBattle = E.createBattleSession();
    A.drum(true);
    mountBattleModal();
    startBattleLoop();
  }

  function mountBattleModal() {
    const mount = document.getElementById('battle-modal-mount');
    if (!mount || !activeBattle) return;
    const b = activeBattle;

    mount.innerHTML = `
      <div class="modal-backdrop">
        <div class="battle-arena">
          <!-- TOP BAR -->
          <div class="battle-top-bar">
            <div>
              <div style="font-size:17px;font-weight:900;color:#fef3c7">⚔️ ${esc(b.node.name)}</div>
              <div style="font-size:11.5px;color:var(--text-muted)">
                Chief Strategist: <b style="color:var(--jade)">${esc(b.strategistName)} (INT ${b.strategistInt})</b> vs Enemy Host: <b style="color:#fca5a5">${esc(b.enemyGeneral.name)} (WAR ${b.enemyGeneral.war})</b>
              </div>
            </div>

            <div class="morale-wrap">
              <div>
                <div style="font-size:10.5px;color:#6ee7b7;font-weight:700">Allied Morale: <span id="bf-p-morale-txt">${Math.round(b.playerMorale)}</span></div>
                <div class="bar-outer"><div class="bar-inner" id="bf-p-morale-bar" style="background:#10b981;width:${b.playerMorale}%"></div></div>
              </div>
              <div>
                <div style="font-size:10.5px;color:#fca5a5;font-weight:700">Enemy Morale: <span id="bf-e-morale-txt">${Math.round(b.enemyMorale)}</span></div>
                <div class="bar-outer"><div class="bar-inner" id="bf-e-morale-bar" style="background:#ef4444;width:${b.enemyMorale}%"></div></div>
              </div>
            </div>

            <div style="display:flex;gap:6px;align-items:center" id="bf-speed-controls">
              <button class="btn btn-xs" id="bf-btn-pause">⏸ Pause</button>
              <button class="btn btn-xs btn-primary" id="bf-btn-1x">▶ 1x</button>
              <button class="btn btn-xs" id="bf-btn-2x">⏩ 2x</button>
            </div>
          </div>

          <!-- PRE-BATTLE 1v1 ROTK OFFICER DUEL PANEL -->
          <div id="bf-duel-panel" style="display:${b.duelResolved ? 'none' : 'block'};margin:12px 0;padding:14px;background:linear-gradient(135deg,#3b1812,#1c130e);border:1.5px solid #fbbf24;border-radius:10px">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
              <div>
                <div style="font-size:14px;font-weight:900;color:#fde68a">🐎 ROTK PRE-BATTLE 1v1 GENERAL DUEL CHALLENGE!</div>
                <div style="font-size:12.5px;color:var(--text-main);margin-top:3px">
                  Enemy Commander <b>${esc(b.enemyGeneral.name)} (WAR ${b.enemyGeneral.war})</b> rides before the gates!
                  Send <b>${esc(b.duelist ? b.duelist.name : 'Prefecture Captain')} (WAR ${b.duelist ? b.duelist.war : 65})</b> to clash!
                  <span style="color:var(--text-muted)">(Cleave beats Feint · Feint beats Parry · Parry beats Cleave)</span>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                <button class="btn btn-crimson" data-duel-stance="cleave">⚔️ Heaven Cleave</button>
                <button class="btn btn-primary" data-duel-stance="feint">💨 Shadow Feint</button>
                <button class="btn btn-jade" data-duel-stance="parry">🛡️ Iron Parry</button>
                <button class="btn" id="bf-skip-duel">🥁 Decline & Begin Assault</button>
              </div>
            </div>
          </div>

          <!-- CASTLE WALL SIEGE BAR (LORDS OF THE REALM II / HOMM) -->
          <div id="bf-wall-banner" class="siege-wall-banner" style="display:${b.wallMaxHp > 0 ? 'flex' : 'none'}">
            <div style="font-size:12.5px;font-weight:800;color:#e7e5e4">
              🧱 Fortified Castle Gate &amp; Ramparts: <span id="bf-wall-txt">${Math.round(b.wallHp)} / ${b.wallMaxHp}</span>
              <span style="font-size:11px;color:#a8a29e;margin-left:8px">(Catapults deal 3.5× DMG · Ranged shoots over walls · Melee batters Gate!)</span>
            </div>
            <div class="bar-outer" style="width:280px;height:13px">
              <div class="bar-inner" id="bf-wall-bar" style="background:linear-gradient(90deg,#a8a29e,#f5f5f4);width:${b.wallMaxHp > 0 ? (b.wallHp / b.wallMaxHp * 100) : 0}%"></div>
            </div>
          </div>

          <!-- BATTLEFIELD LANES: ENEMY TOP, PLAYER WARBAND BOTTOM -->
          <div class="battle-lanes">
            <div>
              <div style="font-size:11px;font-weight:800;color:#fca5a5;margin-bottom:5px;text-transform:uppercase">Enemy Garrison Line</div>
              <div class="army-line">
                ${b.enemySlots.map((s, idx) => renderCombatSlotInitial(s, idx, 'enemy')).join('')}
              </div>
            </div>

            <div>
              <div style="font-size:11px;font-weight:800;color:#6ee7b7;margin-bottom:5px;text-transform:uppercase">Your Warband Formation (Adjacency Synergies Active)</div>
              <div class="army-line">
                ${b.playerSlots.map((s, idx) => renderCombatSlotInitial(s, idx, 'player')).join('')}
              </div>
            </div>
          </div>

          <!-- CHIEF STRATEGIST ACTIVE STRATAGEM DECK -->
          <div class="stratagem-bar">
            <div style="min-width:210px">
              <div style="font-size:12px;font-weight:800;color:var(--jade)">☯️ Strategist Tactics Qi: <span id="bf-qi-txt">${Math.floor(b.qi)}</span> / ${b.qiMax}</div>
              <div class="bar-outer" style="width:200px;margin-top:4px">
                <div class="bar-inner" id="bf-qi-bar" style="background:linear-gradient(90deg,#0d9488,#2dd4bf);width:${b.qi}%"></div>
              </div>
            </div>
            <div class="strat-cards">
              ${D.STRATAGEMS.map(st => `
                <button class="btn btn-xs" data-cast-strat="${st.id}" id="bf-strat-${st.id}" title="${esc(st.desc)}">
                  ${st.icon} ${esc(st.name)} <span class="badge">${st.qiCost} Qi</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- VICTORY / DEFEAT BANNER (HIDDEN UNTIL BATTLE ENDS) -->
          <div id="bf-result-box" style="display:none;margin-top:12px;padding:14px;border-radius:10px;border:2px solid var(--border-gold);background:rgba(20,28,20,0.92);align-items:center;justify-content:space-between">
            <div id="bf-result-text" style="font-size:15px;font-weight:800"></div>
            <button class="btn btn-primary" id="bf-btn-continue" style="padding:10px 22px;font-size:14px">Claim Spoils &amp; Advance Season ➔</button>
          </div>

          <!-- COMBAT CHRONICLE LOG -->
          <div class="battle-log" id="bf-log" style="margin-top:10px"></div>
        </div>
      </div>
    `;

    // Bind Battle Modal Controls once!
    mount.querySelectorAll('[data-duel-stance]').forEach(btn => {
      btn.onclick = () => {
        const stance = btn.getAttribute('data-duel-stance');
        const res = E.resolvePreBattleDuel(b, stance);
        if (res && res.won) A.fanfare(true); else A.clash();
        document.getElementById('bf-duel-panel').style.display = 'none';
        syncBattleDom();
      };
    });

    const skipBtn = document.getElementById('bf-skip-duel');
    if (skipBtn) {
      skipBtn.onclick = () => {
        E.skipDuelAndStart(b);
        A.drum(true);
        document.getElementById('bf-duel-panel').style.display = 'none';
        syncBattleDom();
      };
    }

    document.getElementById('bf-btn-pause').onclick = () => {
      if (!b.duelResolved) E.skipDuelAndStart(b);
      else b.paused = !b.paused;
      syncBattleDom();
    };
    document.getElementById('bf-btn-1x').onclick = () => {
      if (!b.duelResolved) { E.skipDuelAndStart(b); document.getElementById('bf-duel-panel').style.display = 'none'; }
      b.paused = false;
      b.speed = 1;
      syncBattleDom();
    };
    document.getElementById('bf-btn-2x').onclick = () => {
      if (!b.duelResolved) { E.skipDuelAndStart(b); document.getElementById('bf-duel-panel').style.display = 'none'; }
      b.paused = false;
      b.speed = 2;
      syncBattleDom();
    };

    mount.querySelectorAll('[data-cast-strat]').forEach(btn => {
      btn.onclick = () => {
        if (!b.duelResolved) {
          E.skipDuelAndStart(b);
          document.getElementById('bf-duel-panel').style.display = 'none';
        }
        const res = E.castStratagem(b, btn.getAttribute('data-cast-strat'));
        if (!res.ok && res.msg) toast(res.msg);
        syncBattleDom();
      };
    });

    document.getElementById('bf-btn-continue').onclick = () => {
      stopBattleLoop();
      const finishedBattle = activeBattle;
      activeBattle = null;

      if (finishedBattle.winner === 'player') {
        const playerSurvivors = finishedBattle.playerSlots
          .filter(s => s && s.kind === 'unit')
          .map(s => ({ slotIdx: s.slotIdx, livingCount: s.livingCount }));
        E.completeCampaignNodeAndAdvanceSeason({ playerSurvivors });
        toast('Season advanced! Taxes, rations & wounded recovery resolved.');
      }
      renderApp();
    };

    syncBattleDom();
  }

  function renderCombatSlotInitial(s, idx, side) {
    const domId = `cslot-${side}-${idx}`;
    if (!s) {
      return `<div class="combat-card" id="${domId}" style="opacity:0.16;border-style:dashed;justify-content:center;align-items:center;font-size:11px;color:var(--text-dim)">Empty</div>`;
    }
    if (s.kind === 'relic') {
      return `
        <div class="combat-card" id="${domId}" style="border-color:#8b5cf6;background:linear-gradient(180deg,#251936,#140f1d)">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#c4b5fd">
            <span>Relic Engine</span>
            <span>⏱️${s.cdMax}s</span>
          </div>
          <div style="text-align:center;margin:6px 0">
            <div style="font-size:26px">${s.icon}</div>
            <div style="font-size:11.5px;font-weight:800;color:#ede9fe">${esc(s.name)}</div>
          </div>
          <div>
            <div style="font-size:9.5px;color:var(--text-muted);margin-bottom:3px">Action Charge</div>
            <div class="cd-track"><div class="cd-fill" id="${domId}-cd" style="width:0%"></div></div>
          </div>
        </div>
      `;
    }

    const genBadge = s.officer
      ? `<div style="font-size:10px;color:#fde68a;font-weight:700">${s.officer.seal} ${esc(s.officer.name)}</div>`
      : (s.isCommander && s.commanderData ? `<div style="font-size:10px;color:#fca5a5;font-weight:700">👑 ${esc(s.commanderData.name)}</div>` : '');

    return `
      <div class="combat-card ${side === 'enemy' ? 'enemy-card' : ''}" id="${domId}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:19px">${s.icon}</span>
          <span class="homm-count-badge" id="${domId}-cnt">×${s.livingCount}</span>
        </div>
        <div>
          <div style="font-size:11.5px;font-weight:800;margin-top:2px">${esc(s.name)}</div>
          ${genBadge}
          <div style="font-size:10px;margin-top:2px;min-height:14px" id="${domId}-status"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--text-muted)">
            <span id="${domId}-hptxt">${Math.round(s.hp)}/${s.maxHp}</span>
            <span id="${domId}-shdtxt" style="color:#38bdf8">${s.shield > 0 ? `🛡️${s.shield}` : ''}</span>
          </div>
          <div class="hp-track"><div class="hp-fill" id="${domId}-hp" style="width:100%"></div></div>
          <div class="cd-track"><div class="cd-fill" id="${domId}-cd" style="width:0%"></div></div>
        </div>
      </div>
    `;
  }

  function syncBattleDom() {
    const b = activeBattle;
    if (!b) return;

    const pMorTxt = document.getElementById('bf-p-morale-txt');
    if (!pMorTxt) return;
    pMorTxt.textContent = Math.round(b.playerMorale);
    document.getElementById('bf-p-morale-bar').style.width = `${b.playerMorale}%`;
    document.getElementById('bf-e-morale-txt').textContent = Math.round(b.enemyMorale);
    document.getElementById('bf-e-morale-bar').style.width = `${b.enemyMorale}%`;

    if (b.wallMaxHp > 0) {
      document.getElementById('bf-wall-txt').textContent = b.wallHp > 0 ? `${Math.round(b.wallHp)} / ${b.wallMaxHp}` : 'BREACHED!';
      document.getElementById('bf-wall-bar').style.width = `${(b.wallHp / b.wallMaxHp) * 100}%`;
    }

    document.getElementById('bf-qi-txt').textContent = Math.floor(b.qi);
    document.getElementById('bf-qi-bar').style.width = `${(b.qi / b.qiMax) * 100}%`;

    // Update speed button highlights
    document.getElementById('bf-btn-pause').className = `btn btn-xs ${b.paused ? 'btn-crimson' : ''}`;
    document.getElementById('bf-btn-1x').className = `btn btn-xs ${!b.paused && b.speed === 1 ? 'btn-primary' : ''}`;
    document.getElementById('bf-btn-2x').className = `btn btn-xs ${!b.paused && b.speed === 2 ? 'btn-primary' : ''}`;

    D.STRATAGEMS.forEach(st => {
      const btn = document.getElementById(`bf-strat-${st.id}`);
      if (btn) {
        btn.disabled = b.finished || b.qi < st.qiCost;
        if (!btn.disabled) btn.classList.add('btn-jade');
        else btn.classList.remove('btn-jade');
      }
    });

    const updateLine = (slots, side) => {
      slots.forEach((s, idx) => {
        if (!s) return;
        const domId = `cslot-${side}-${idx}`;
        const card = document.getElementById(domId);
        if (!card) return;

        card.classList.toggle('dead-card', !s.alive);
        card.classList.toggle('striking', s.alive && b.clock < s.strikingUntil);
        card.classList.toggle('hit-flash', s.alive && b.clock < (s.hitUntil || 0));

        const cdEl = document.getElementById(`${domId}-cd`);
        if (cdEl) cdEl.style.width = s.alive ? `${Math.min(100, (s.cdNow / s.cdMax) * 100)}%` : '0%';

        if (s.kind === 'unit') {
          const cntEl = document.getElementById(`${domId}-cnt`);
          if (cntEl) cntEl.textContent = `×${s.livingCount}`;
          const hpEl = document.getElementById(`${domId}-hp`);
          if (hpEl) hpEl.style.width = `${Math.max(0, (s.hp / s.maxHp) * 100)}%`;
          const hpTxt = document.getElementById(`${domId}-hptxt`);
          if (hpTxt) hpTxt.textContent = `${Math.ceil(s.hp)}/${s.maxHp}`;
          const shdTxt = document.getElementById(`${domId}-shdtxt`);
          if (shdTxt) shdTxt.textContent = s.shield > 0 ? `🛡️${Math.round(s.shield)}` : '';

          const stEl = document.getElementById(`${domId}-status`);
          if (stEl) {
            const badges = [];
            if (s.stunTimer > 0) badges.push(`💫Stun ${s.stunTimer.toFixed(1)}s`);
            if (s.burn > 1) badges.push(`🔥Burn ${Math.round(s.burn)}`);
            if (s.exposed) badges.push(`🎯Exposed`);
            stEl.innerHTML = badges.join(' ');
          }
        }
      });
    };

    updateLine(b.enemySlots, 'enemy');
    updateLine(b.playerSlots, 'player');

    const logEl = document.getElementById('bf-log');
    if (logEl) {
      logEl.innerHTML = b.logs.slice(0, 14).map(l => `<div>• ${esc(l)}</div>`).join('');
    }

    if (b.finished) {
      const resBox = document.getElementById('bf-result-box');
      const resTxt = document.getElementById('bf-result-text');
      const contBtn = document.getElementById('bf-btn-continue');
      resBox.style.display = 'flex';
      if (b.winner === 'player') {
        resTxt.innerHTML = `🏆 <span style="color:#fde68a">GLORIOUS VICTORY!</span> Spoils: +${b.node.rewardGold} 🪙 Gold & +${b.node.rewardGrain} 🌾 Grain (Field Chirurgeons recover 30% of fallen soldiers!)`;
        contBtn.textContent = 'Claim Spoils & Advance Season ➔';
      } else {
        resTxt.innerHTML = `💀 <span style="color:#fca5a5">YOUR WARBAND HAS BEEN ROUTED...</span>`;
        contBtn.textContent = 'View Dynasty Chronicle ➔';
      }
    }
  }

  function startBattleLoop() {
    stopBattleLoop();
    lastFrameTs = performance.now();
    function frame(now) {
      if (!activeBattle) return;
      const dt = (now - lastFrameTs) / 1000;
      lastFrameTs = now;
      E.tickBattle(activeBattle, dt);
      syncBattleDom();
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function stopBattleLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Spacebar Tactical Pause in Battle!
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'Space' && activeBattle && activeBattle.duelResolved && !activeBattle.finished) {
      ev.preventDefault();
      activeBattle.paused = !activeBattle.paused;
      syncBattleDom();
    }
  });

  // Boot!
  window.addEventListener('DOMContentLoaded', () => {
    renderApp();
  });
})();
