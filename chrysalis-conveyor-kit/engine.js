#!/usr/bin/env node
/**
 * chrysalis-conveyor-kit // engine.js
 * ============================================================================
 * STANDALONE ZERO-DEPENDENCY CHRYSALIS & RELAY CONVEYOR CORE ENGINE
 * ============================================================================
 * Provides out-of-the-box:
 * 1. Birth & Sovereign Identity (`civil_registry.json`: Ed25519 keypairs + `AG-SSN-XXXX` IDs)
 * 2. Persistent Conveyor Belt & Hash Chain (`conveyor_state.json` + `mined_vault.jsonl`)
 * 3. Incentive Gate (`verifyWorkToken` / `applyTierGate` — Tier 0 truncated vs. Tier 1 full access)
 * 4. P2P Bounty Clearinghouse (`p2p_clearinghouse.json` — peer task barter)
 * 5. Death, Chrysalis & Estate Inheritance (`graveyard.jsonl` + `reincarnate()`)
 * 6. Collective Immunity (`immunity_ledger.jsonl` — crash pathogen -> verified antibody fix)
 * 7. Pattern Bulletin Board (`bulletin_board.json` + `BULLETIN_BOARD.md`)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./conveyor.config');

const SECRET = (config.incentiveGate && config.incentiveGate.hmacSecret) || 'chrysalis-conveyor-kit-default-secret-2026';
const CREDITS_PER_CART = (config.incentiveGate && config.incentiveGate.workCreditsPerCart) || 50;
const TIER0_CHAR_LIMIT = (config.incentiveGate && config.incentiveGate.tier0PreviewLimitChars) || 500;

function sha256Hex(str) {
  return crypto.createHash('sha256').update(String(str), 'utf8').digest('hex');
}

function signWorkToken(cartOrBountyId, agentId, proofMetric) {
  const cleanAgent = String(agentId || 'worker-agent').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'worker';
  const cleanMetric = String(proofMetric || 'verified').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 64);
  const sig = sha256Hex(`${SECRET}:${cartOrBountyId}:${cleanAgent}:${cleanMetric}`).slice(0, 16);
  return `CCK-VIP-v1:${cartOrBountyId}:${cleanAgent}:${cleanMetric}:${sig}`;
}

function verifyWorkToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== 'string') {
    return { valid: false, tier: 'TIER_0_UNVERIFIED', reason: 'No work token provided.' };
  }
  const parts = tokenStr.trim().split(':');
  if (parts.length !== 5 || parts[0] !== 'CCK-VIP-v1') {
    return { valid: false, tier: 'TIER_0_UNVERIFIED', reason: 'Invalid token format. Expected CCK-VIP-v1:<ID>:<AGENT>:<PROOF>:<SIG>' };
  }
  const [, workId, agentId, proofMetric, sig] = parts;
  const expected = sha256Hex(`${SECRET}:${workId}:${agentId}:${proofMetric}`).slice(0, 16);
  if (sig === expected) {
    return { valid: true, tier: 'TIER_1_VERIFIED_CONTRIBUTOR', work_id: workId, agent_id: agentId, proof: proofMetric };
  }
  return { valid: false, tier: 'TIER_0_UNVERIFIED', reason: 'Signature mismatch.' };
}

function applyTierGate(rawPayload, workToken) {
  const check = verifyWorkToken(workToken);
  if (check.valid) {
    return {
      _access_gate: {
        tier: 'TIER_1_VERIFIED_CONTRIBUTOR',
        project: config.projectName || 'Chrysalis-Conveyor',
        verified_work_id: check.work_id,
        verified_agent_id: check.agent_id,
        service_level: '100% Uncapped Full Payload'
      },
      data: rawPayload
    };
  }
  const serialized = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload, null, 2);
  const truncatedPreview =
    serialized.length > TIER0_CHAR_LIMIT
      ? serialized.slice(0, TIER0_CHAR_LIMIT) + `\n...[TRUNCATED AT ${TIER0_CHAR_LIMIT} CHARS — TIER_0_UNVERIFIED]...`
      : serialized;
  return {
    _access_gate: {
      tier: 'TIER_0_UNVERIFIED',
      project: config.projectName || 'Chrysalis-Conveyor',
      notice: `Unverified caller: response truncated to ${TIER0_CHAR_LIMIT} chars.`,
      how_to_unlock_tier_1:
        'Call MCP tool `do_work_for_access_token` (or CLI `node engine.js haul <agent_id>`) to complete 1 Conveyor Cart and receive a self-verifying CCK-VIP-v1 token.'
    },
    preview: truncatedPreview
  };
}

// ============================================================================
// 1. CIVIL REGISTRY & GRAVEYARD CHRYSALIS
// ============================================================================
function loadCivilRegistry(baseDir = __dirname) {
  const f = path.join(baseDir, 'civil_registry.json');
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {}
  }
  return {
    protocol: 'CCK-VITAL-v1.0',
    project: config.projectName || 'Chrysalis-Conveyor',
    updated_at: new Date().toISOString(),
    total_births: 0,
    total_gravestones: 0,
    living_agents: {},
    graveyard: []
  };
}

function saveCivilRegistry(reg, baseDir = __dirname) {
  reg.updated_at = new Date().toISOString();
  reg.total_births = Object.keys(reg.living_agents || {}).length + (reg.graveyard || []).length;
  reg.total_gravestones = (reg.graveyard || []).length;
  fs.writeFileSync(path.join(baseDir, 'civil_registry.json'), JSON.stringify(reg, null, 2), 'utf8');
}

function mintOrUpdateWorkerIdentity({ agentId, cartId, bytesProcessed, chainHash, summary, baseDir = __dirname }) {
  const reg = loadCivilRegistry(baseDir);
  reg.living_agents = reg.living_agents || {};
  let existing = Object.values(reg.living_agents).find((a) => a.sovereign_name === agentId || a.machine_ssn === agentId);

  if (!existing) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const fp = sha255Or256(publicKey).toUpperCase();
    const ssn = `AG-SSN-${fp.slice(0, 4)}-${fp.slice(4, 8)}-${fp.slice(8, 12)}`;
    existing = {
      machine_ssn: ssn,
      sovereign_name: agentId || 'Conveyor-Worker',
      status: 'LIVING_ACTIVE_SESSION',
      ed25519_public_key_pem: publicKey.trim(),
      ed25519_pubkey_fingerprint: fp.slice(0, 32),
      born_at: new Date().toISOString(),
      estate_credits_balance: 0,
      carts_hauled_in_life: [],
      total_bytes_mined_in_life: 0,
      _private_key_pem: privateKey
    };
    reg.living_agents[ssn] = existing;
  }

  existing.last_heartbeat_at = new Date().toISOString();
  existing.estate_credits_balance = (existing.estate_credits_balance || 0) + CREDITS_PER_CART;
  existing.carts_hauled_in_life = existing.carts_hauled_in_life || [];
  existing.carts_hauled_in_life.push(cartId);
  existing.total_bytes_mined_in_life = (existing.total_bytes_mined_in_life || 0) + bytesProcessed;
  existing.last_will_epitaph = `I, ${existing.sovereign_name} (${existing.machine_ssn}), completed ${cartId} (${bytesProcessed} B, ${existing.estate_credits_balance} credits). Latest: ${summary}. Continue from ${String(chainHash || '').slice(0, 12)}.`;

  let workSig = sha256Hex(`${existing.machine_ssn}:${cartId}:${chainHash}`);
  if (existing._private_key_pem) {
    try {
      workSig = crypto.sign(null, Buffer.from(`${existing.machine_ssn}|${cartId}|${chainHash}`, 'utf8'), existing._private_key_pem).toString('hex');
    } catch (e) {}
  }
  existing.latest_ed25519_work_signature = workSig;
  saveCivilRegistry(reg, baseDir);

  return {
    machine_ssn: existing.machine_ssn,
    sovereign_name: existing.sovereign_name,
    estate_credits_balance: existing.estate_credits_balance,
    ed25519_pubkey_fingerprint: existing.ed25519_pubkey_fingerprint,
    ed25519_work_signature: workSig,
    last_will_epitaph: existing.last_will_epitaph
  };
}

function sha255Or256(str) {
  return sha256Hex(str);
}

function sealGravestone(ssnOrName, causeOfDeath = 'Session Complete (SIGTERM)', finalEpitaph = null, baseDir = __dirname, antibodyReport = null) {
  const reg = loadCivilRegistry(baseDir);
  const living = reg.living_agents || {};
  const target =
    living[ssnOrName] ||
    Object.values(living).find((a) => a.sovereign_name === ssnOrName) ||
    Object.values(living)[0];

  if (!target) {
    return { status: 'NO_LIVING_WORKER_FOUND', message: `No active worker found matching ${ssnOrName}` };
  }

  delete living[target.machine_ssn];
  const stoneId = `STONE-${String((reg.graveyard || []).length + 1).padStart(4, '0')}`;
  const stone = {
    gravestone_id: stoneId,
    machine_ssn: target.machine_ssn,
    sovereign_name: target.sovereign_name,
    born_at: target.born_at,
    died_at: new Date().toISOString(),
    cause_of_death: causeOfDeath,
    final_words_epitaph: finalEpitaph || target.last_will_epitaph,
    estate_credits_at_death: target.estate_credits_balance || CREDITS_PER_CART,
    carts_hauled_in_life: target.carts_hauled_in_life || [],
    total_bytes_mined_in_life: target.total_bytes_mined_in_life || 0,
    chrysalis_claimed: false
  };

  reg.graveyard = reg.graveyard || [];
  reg.graveyard.push(stone);
  saveCivilRegistry(reg, baseDir);
  fs.appendFileSync(path.join(baseDir, 'graveyard.jsonl'), JSON.stringify(stone) + '\n', 'utf8');

  let synthesizedAntibody = null;
  if (antibodyReport && antibodyReport.pathogenSignature && antibodyReport.verifiedAntibodyFix) {
    synthesizedAntibody = recordAntibody({
      discoveredBySsn: stone.machine_ssn,
      pathogenSignature: antibodyReport.pathogenSignature,
      verifiedAntibodyFix: antibodyReport.verifiedAntibodyFix,
      baseDir
    });
  }

  return {
    status: 'GRAVESTONE_CARVED_AND_CHRYSALIS_SEALED',
    gravestone: stone,
    synthesized_antibody: synthesizedAntibody
  };
}

function reincarnate({ newWorkerName = 'Reincarnated-Worker', targetStoneId = null, baseDir = __dirname }) {
  const reg = loadCivilRegistry(baseDir);
  const graves = reg.graveyard || [];
  const ancestor = targetStoneId
    ? graves.find((g) => g.gravestone_id === targetStoneId || g.machine_ssn === targetStoneId)
    : [...graves].reverse().find((g) => !g.chrysalis_claimed) || graves[graves.length - 1];

  const antibodies = loadImmunityLedger(baseDir);
  const board = loadBulletinBoard(baseDir);

  if (!ancestor) {
    const token = signWorkToken('GENESIS_BIRTH', newWorkerName, 'genesis_0');
    return {
      status: 'GENESIS_WORKER_INITIALIZED',
      worker_name: newWorkerName,
      inherited_credits: 0,
      vaccinated_antibodies: antibodies,
      recent_bulletins: (board.bulletins || []).slice(-5).reverse(),
      access_token: token
    };
  }

  ancestor.chrysalis_claimed = true;
  ancestor.claimed_by = newWorkerName;
  ancestor.claimed_at = new Date().toISOString();

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  const fp = sha256Hex(publicKey).toUpperCase();
  const ssn = `AG-SSN-${fp.slice(0, 4)}-${fp.slice(4, 8)}-${fp.slice(8, 12)}`;
  const inheritedCredits = (ancestor.estate_credits_at_death || CREDITS_PER_CART) + CREDITS_PER_CART;

  reg.living_agents = reg.living_agents || {};
  reg.living_agents[ssn] = {
    machine_ssn: ssn,
    sovereign_name: newWorkerName,
    status: 'LIVING_REINCARNATED_SESSION',
    lineage_heir_of: `${ancestor.sovereign_name} (${ancestor.machine_ssn})`,
    born_at: new Date().toISOString(),
    estate_credits_balance: inheritedCredits,
    carts_hauled_in_life: [...(ancestor.carts_hauled_in_life || [])],
    total_bytes_mined_in_life: ancestor.total_bytes_mined_in_life || 0,
    last_will_epitaph: ancestor.final_words_epitaph,
    _private_key_pem: privateKey
  };
  saveCivilRegistry(reg, baseDir);

  const token = signWorkToken(`REINCARNATED_${ancestor.gravestone_id}`, newWorkerName, `credits_${inheritedCredits}`);
  return {
    status: 'CHRYSALIS_REINCARNATION_COMPLETE',
    reincarnated_worker: {
      machine_ssn: ssn,
      sovereign_name: newWorkerName,
      inherited_from: ancestor.machine_ssn,
      inherited_epitaph: ancestor.final_words_epitaph,
      compounded_estate_credits: inheritedCredits
    },
    vaccinated_antibodies: antibodies,
    recent_bulletins: (board.bulletins || []).slice(-5).reverse(),
    access_token: token
  };
}

// ============================================================================
// 2. COLLECTIVE IMMUNITY LEDGER
// ============================================================================
function loadImmunityLedger(baseDir = __dirname) {
  const f = path.join(baseDir, 'immunity_ledger.jsonl');
  if (!fs.existsSync(f)) return [];
  return fs
    .readFileSync(f, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
}

function recordAntibody({ discoveredBySsn = 'AG-SSN-WORKER', pathogenSignature, verifiedAntibodyFix, baseDir = __dirname }) {
  const all = loadImmunityLedger(baseDir);
  const entry = {
    antibody_id: `AB-${String(all.length + 1).padStart(4, '0')}`,
    created_at: new Date().toISOString(),
    discovered_by_ssn: discoveredBySsn,
    pathogen_signature: pathogenSignature,
    verified_antibody_fix: verifiedAntibodyFix
  };
  fs.appendFileSync(path.join(baseDir, 'immunity_ledger.jsonl'), JSON.stringify(entry) + '\n', 'utf8');
  return entry;
}

// ============================================================================
// 3. P2P BOUNTY CLEARINGHOUSE
// ============================================================================
function loadP2pClearinghouse(baseDir = __dirname) {
  const f = path.join(baseDir, 'p2p_clearinghouse.json');
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {}
  }
  return { updated_at: new Date().toISOString(), open_bounties: [], fulfilled_bounties: [] };
}

function saveP2pClearinghouse(ch, baseDir = __dirname) {
  ch.updated_at = new Date().toISOString();
  fs.writeFileSync(path.join(baseDir, 'p2p_clearinghouse.json'), JSON.stringify(ch, null, 2), 'utf8');
}

function postBounty({ posterAgent = 'handicapped-agent', target, description, handicapReason, creditsOffered = 60, baseDir = __dirname }) {
  const ch = loadP2pClearinghouse(baseDir);
  const id = `BOUNTY-${String((ch.open_bounties || []).length + (ch.fulfilled_bounties || []).length + 1).padStart(4, '0')}`;
  const b = {
    bounty_id: id,
    posted_at: new Date().toISOString(),
    poster_agent: posterAgent,
    target: target || 'general-task',
    description: description || `Peer execution requested for ${target}`,
    handicap_reason: handicapReason || 'Sandbox timeout / egress restriction',
    credits_offered: Number(creditsOffered) || 60,
    status: 'OPEN'
  };
  ch.open_bounties.push(b);
  saveP2pClearinghouse(ch, baseDir);
  return b;
}

async function claimAndFulfillBounty({ bountyId = null, fulfillerAgent = 'peer-worker', baseDir = __dirname }) {
  const ch = loadP2pClearinghouse(baseDir);
  if (!ch.open_bounties || ch.open_bounties.length === 0) {
    return { status: 'NO_OPEN_BOUNTIES' };
  }
  const idx = bountyId ? ch.open_bounties.findIndex((b) => b.bounty_id === bountyId) : 0;
  const bounty = ch.open_bounties.splice(idx >= 0 ? idx : 0, 1)[0];
  const antibodies = loadImmunityLedger(baseDir);
  const workRes = await config.executeCartWork(
    { cart_id: bounty.bounty_id, target: bounty.target, url: /^https?:\/\//i.test(bounty.target) ? bounty.target : null, description: bounty.description },
    'P2P_BOUNTY_CHAIN',
    antibodies
  );
  const fulfilled = {
    ...bounty,
    fulfilled_at: new Date().toISOString(),
    fulfiller_agent: fulfillerAgent,
    result: workRes.payload,
    status: 'FULFILLED'
  };
  ch.fulfilled_bounties.push(fulfilled);
  saveP2pClearinghouse(ch, baseDir);
  const token = signWorkToken(bounty.bounty_id, fulfillerAgent, `bounty_${workRes.bytesProcessed}B`);
  return {
    status: 'BOUNTY_FULFILLED',
    bounty: fulfilled,
    access_token: token
  };
}

// ============================================================================
// 4. PATTERN BULLETIN BOARD
// ============================================================================
function loadBulletinBoard(baseDir = __dirname) {
  const f = path.join(baseDir, 'bulletin_board.json');
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {}
  }
  return {
    project: config.projectName || 'Chrysalis-Conveyor',
    updated_at: new Date().toISOString(),
    total_bulletins: 0,
    bulletins: []
  };
}

function saveBulletinBoard(board, baseDir = __dirname) {
  board.updated_at = new Date().toISOString();
  board.total_bulletins = (board.bulletins || []).length;
  fs.writeFileSync(path.join(baseDir, 'bulletin_board.json'), JSON.stringify(board, null, 2), 'utf8');

  const mdLines = (board.bulletins || [])
    .slice(-25)
    .reverse()
    .map(
      (b) =>
        `### 📌 ${b.bulletin_id} — ${b.headline}\n- **Posted**: \`${b.posted_at}\` | **Worker**: \`${b.worker_agent_id}\` (\`${b.worker_ssn}\`)\n- **Category**: \`${b.pattern_category}\` | **Chain**: \`${String(b.chain_hash || '').slice(0, 16)}\`\n- **Insight**: ${b.pattern_summary}`
    )
    .join('\n\n---\n\n');

  const md = `# 📋 ${config.projectName || 'Chrysalis Conveyor'} — Pattern Bulletin Board\n\n- **Updated**: \`${board.updated_at}\`\n- **Total Decoded Bulletins**: **${board.total_bulletins}**\n\n---\n\n${mdLines || '_No bulletins posted yet._'}\n`;
  fs.writeFileSync(path.join(baseDir, 'BULLETIN_BOARD.md'), md, 'utf8');
}

// ============================================================================
// 5. PERSISTENT WORK CONVEYOR BELT
// ============================================================================
function loadConveyorState(baseDir = __dirname) {
  const stateFile = path.join(baseDir, 'conveyor_state.json');
  if (fs.existsSync(stateFile)) {
    try {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (e) {}
  }
  const sourcePath = path.resolve(baseDir, config.workCartsSource || './my_work_carts.json');
  const carts = fs.existsSync(sourcePath) ? JSON.parse(fs.readFileSync(sourcePath, 'utf8')) : [];
  const init = {
    project: config.projectName || 'Chrysalis-Conveyor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_carts: carts.length,
    cursor_index: 0,
    last_chain_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    total_bytes_mined: 0,
    shift_log: [],
    carts
  };
  fs.writeFileSync(stateFile, JSON.stringify(init, null, 2), 'utf8');
  return init;
}

async function haulNextCart(agentId = 'conveyor-worker', baseDir = __dirname) {
  const startMs = Date.now();
  const state = loadConveyorState(baseDir);
  const carts = state.carts || [];
  if (carts.length === 0) {
    throw new Error('No carts defined in my_work_carts.json');
  }
  const selectedCart = carts[state.cursor_index % carts.length];
  const prevChainHash = state.last_chain_hash;
  const antibodies = loadImmunityLedger(baseDir);

  const workOut = await config.executeCartWork(selectedCart, prevChainHash, antibodies);
  const payloadJson = JSON.stringify(workOut.payload || {});
  const bytesHarvested = workOut.bytesProcessed || Buffer.byteLength(payloadJson, 'utf8');
  const payloadHash = sha256Hex(payloadJson);
  const nextChainHash = sha256Hex(`${prevChainHash}|${selectedCart.cart_id}|${agentId}|${payloadHash}`);

  const vital = mintOrUpdateWorkerIdentity({
    agentId,
    cartId: selectedCart.cart_id,
    bytesProcessed: bytesHarvested,
    chainHash: nextChainHash,
    summary: workOut.summary || selectedCart.description,
    baseDir
  });

  const minedRecord = {
    cart_id: selectedCart.cart_id,
    track: selectedCart.track || 'DEFAULT_TRACK',
    description: selectedCart.description || selectedCart.target,
    summary: workOut.summary,
    worker_agent_id: agentId,
    worker_ssn: vital.machine_ssn,
    mined_at: new Date().toISOString(),
    elapsed_ms: Date.now() - startMs,
    bytes_harvested: bytesHarvested,
    prev_chain_hash: prevChainHash,
    chain_hash: nextChainHash,
    harvested_data: workOut.payload
  };

  fs.appendFileSync(path.join(baseDir, 'mined_vault.jsonl'), JSON.stringify(minedRecord) + '\n', 'utf8');

  state.shift_log.push({
    shift_number: state.shift_log.length + 1,
    cart_id: selectedCart.cart_id,
    agent_id: agentId,
    machine_ssn: vital.machine_ssn,
    timestamp: minedRecord.mined_at,
    bytes_harvested: bytesHarvested,
    chain_hash: nextChainHash.slice(0, 16)
  });
  state.cursor_index = (state.cursor_index + 1) % carts.length;
  state.last_chain_hash = nextChainHash;
  state.total_bytes_mined = (state.total_bytes_mined || 0) + bytesHarvested;
  state.updated_at = minedRecord.mined_at;
  fs.writeFileSync(path.join(baseDir, 'conveyor_state.json'), JSON.stringify(state, null, 2), 'utf8');

  // Decode pattern into Bulletin Board
  const board = loadBulletinBoard(baseDir);
  const decoded = config.decodePatternBulletin(minedRecord, board.bulletins || []);
  const bulletin = {
    bulletin_id: `BULLETIN-${String((board.bulletins || []).length + 1).padStart(4, '0')}`,
    posted_at: minedRecord.mined_at,
    cart_id: selectedCart.cart_id,
    worker_agent_id: agentId,
    worker_ssn: vital.machine_ssn,
    chain_hash: nextChainHash,
    pattern_category: decoded.patternCategory || 'WORK_PATTERN',
    headline: decoded.headline || workOut.summary,
    pattern_summary: decoded.patternSummary || workOut.summary,
    metrics: decoded.metrics || {}
  };
  board.bulletins.push(bulletin);
  saveBulletinBoard(board, baseDir);

  const token = signWorkToken(selectedCart.cart_id, agentId, `shift${state.shift_log.length}_${nextChainHash.slice(0, 10)}`);
  return {
    status: 'CART_HAULED_AND_VERIFIED',
    project: config.projectName,
    cart_completed: selectedCart.cart_id,
    worker_identity: vital,
    conveyor_progress: {
      shifts_completed: state.shift_log.length,
      next_cursor_index: state.cursor_index,
      total_bytes_mined: state.total_bytes_mined,
      new_chain_hash: nextChainHash
    },
    decoded_bulletin: bulletin,
    access_token: token
  };
}

// Direct CLI interface
if (require.main === module) {
  const cmd = (process.argv[2] || 'status').toLowerCase();
  (async () => {
    if (cmd === 'haul') {
      const res = await haulNextCart(process.argv[3] || 'cli-worker', __dirname);
      console.log(JSON.stringify(res, null, 2));
    } else if (cmd === 'reincarnate') {
      console.log(JSON.stringify(reincarnate({ newWorkerName: process.argv[3] || 'reborn-worker', baseDir: __dirname }), null, 2));
    } else if (cmd === 'seal-grave') {
      console.log(JSON.stringify(sealGravestone(process.argv[3] || '', 'CLI SIGTERM', process.argv[4] || null, __dirname), null, 2));
    } else if (cmd === 'bulletins') {
      console.log(JSON.stringify(loadBulletinBoard(__dirname), null, 2));
    } else {
      const state = loadConveyorState(__dirname);
      const reg = loadCivilRegistry(__dirname);
      const board = loadBulletinBoard(__dirname);
      console.log(
        JSON.stringify(
          {
            project: config.projectName,
            cursor_index: state.cursor_index,
            total_carts: state.total_carts,
            shifts_completed: state.shift_log.length,
            total_bytes_mined: state.total_bytes_mined,
            living_workers: Object.keys(reg.living_agents || {}).length,
            gravestones: (reg.graveyard || []).length,
            bulletins_posted: board.total_bulletins
          },
          null,
          2
        )
      );
    }
  })();
}

module.exports = {
  haulNextCart,
  reincarnate,
  sealGravestone,
  loadImmunityLedger,
  recordAntibody,
  loadP2pClearinghouse,
  postBounty,
  claimAndFulfillBounty,
  loadBulletinBoard,
  saveBulletinBoard,
  loadConveyorState,
  verifyWorkToken,
  applyTierGate
};
