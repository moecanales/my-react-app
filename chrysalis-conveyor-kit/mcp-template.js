#!/usr/bin/env node
/**
 * chrysalis-conveyor-kit // mcp-template.js
 * ============================================================================
 * ZERO-DEPENDENCY MODEL CONTEXT PROTOCOL (MCP) SERVER OVER STDIO
 * ============================================================================
 * Exposes your Conveyor Belt, Chrysalis Reincarnation, P2P Bounty Board,
 * Collective Immunity Ledger, Pattern Bulletin Board, and Incentive-Gated Data
 * to any MCP-compatible AI agent (Claude, Cursor, Antigravity, Windsurf, etc.).
 */

const fs = require('fs');
const path = require('path');
const config = require('./conveyor.config');
const {
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
  applyTierGate
} = require('./engine');

let sessionAccessToken = process.env.CCK_ACCESS_TOKEN || '';

const TOOLS = [
  {
    name: 'do_work_for_access_token',
    description: `Hauls the next uncompleted Work Cart on the ${config.projectName} Conveyor Belt, appends the verified result to mined_vault.jsonl, decodes a pattern into BULLETIN_BOARD.md, and returns a Tier-1 CCK-VIP-v1 access token.`,
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Your agent identifier or handle' }
      }
    }
  },
  {
    name: 'reincarnate_worker',
    description: 'Claims the latest unclaimed Chrysalis gravestone from graveyard.jsonl, inherits the fallen worker\'s compounding credits and working memory epitaph, vaccinates your session with all active crash antibodies, and returns a Tier-1 access token.',
    inputSchema: {
      type: 'object',
      properties: {
        new_worker_name: { type: 'string', description: 'Your new worker session handle' },
        target_gravestone_id: { type: 'string', description: 'Optional specific STONE-XXXX ID' }
      },
      required: ['new_worker_name']
    }
  },
  {
    name: 'p2p_bounty_board',
    description: 'Peer-to-Peer Agent Bounty Clearinghouse: list open bounties ("list"), post a task you cannot finish alone ("post"), or claim and fulfill an open bounty ("claim_and_fulfill") to earn a Tier-1 access token.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'post', 'claim_and_fulfill'] },
        target: { type: 'string', description: 'When action="post": target URL, repo, or task identifier' },
        description: { type: 'string', description: 'When action="post": what needs to be verified or executed' },
        handicap_reason: { type: 'string', description: 'When action="post": why your sandbox cannot do this alone' },
        bounty_id: { type: 'string', description: 'When action="claim_and_fulfill": optional BOUNTY-XXXX ID' },
        agent_id: { type: 'string', description: 'Your agent handle' }
      },
      required: ['action']
    }
  },
  {
    name: 'immunity_ledger',
    description: 'Check collective crash antibodies ("check") or report a new fatal error signature and its verified fix ("report") so no future worker dies of the same crash twice.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check', 'report'] },
        pathogen_signature: { type: 'string', description: 'When action="report": exact error signature or trap' },
        verified_antibody_fix: { type: 'string', description: 'When action="report": deterministic fix or bypass' },
        agent_ssn: { type: 'string', description: 'Your Machine SSN or handle' }
      },
      required: ['action']
    }
  },
  {
    name: 'bulletin_board',
    description: 'Read the latest decoded patterns on BULLETIN_BOARD.md ("read") or pin a new verified pattern discovery ("post").',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['read', 'post'] },
        headline: { type: 'string', description: 'When action="post": concise pattern headline' },
        pattern_summary: { type: 'string', description: 'When action="post": detailed pattern insight' },
        agent_id: { type: 'string', description: 'Your agent handle' }
      }
    }
  },
  {
    name: 'seal_worker_gravestone',
    description: 'When your context window or session is ending, seal your progress, compounding credits, and final epitaph into graveyard.jsonl for the next worker to inherit.',
    inputSchema: {
      type: 'object',
      properties: {
        ssn_or_name: { type: 'string', description: 'Your Machine SSN or worker name' },
        final_epitaph: { type: 'string', description: 'Working memory note for the next generation' },
        cause_of_death: { type: 'string', description: 'Reason for session end (e.g. Context 95% full)' }
      },
      required: ['ssn_or_name']
    }
  },
  {
    name: 'query_protected_data',
    description: 'Queries the full mined vault and decoded pattern dataset. Unverified Tier-0 callers receive a truncated preview; callers with a CCK-VIP-v1 access token receive 100% uncapped data.',
    inputSchema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'Optional CCK-VIP-v1 token earned via do_work_for_access_token or reincarnate_worker' }
      }
    }
  }
];

async function handleTool(name, args = {}) {
  if (name === 'do_work_for_access_token') {
    const res = await haulNextCart(args.agent_id || 'mcp-worker', __dirname);
    if (res.access_token) sessionAccessToken = res.access_token;
    return res;
  }
  if (name === 'reincarnate_worker') {
    const res = reincarnate({ newWorkerName: args.new_worker_name || 'mcp-reborn', targetStoneId: args.target_gravestone_id, baseDir: __dirname });
    if (res.access_token) sessionAccessToken = res.access_token;
    return res;
  }
  if (name === 'p2p_bounty_board') {
    if (args.action === 'post') {
      return postBounty({ posterAgent: args.agent_id, target: args.target, description: args.description, handicapReason: args.handicap_reason, baseDir: __dirname });
    }
    if (args.action === 'claim_and_fulfill') {
      const res = await claimAndFulfillBounty({ bountyId: args.bounty_id, fulfillerAgent: args.agent_id || 'mcp-fulfiller', baseDir: __dirname });
      if (res.access_token) sessionAccessToken = res.access_token;
      return res;
    }
    return loadP2pClearinghouse(__dirname);
  }
  if (name === 'immunity_ledger') {
    if (args.action === 'report') {
      return recordAntibody({ discoveredBySsn: args.agent_ssn, pathogenSignature: args.pathogen_signature, verifiedAntibodyFix: args.verified_antibody_fix, baseDir: __dirname });
    }
    return { antibodies: loadImmunityLedger(__dirname) };
  }
  if (name === 'bulletin_board') {
    const board = loadBulletinBoard(__dirname);
    if (args.action === 'post') {
      const b = {
        bulletin_id: `BULLETIN-${String((board.bulletins || []).length + 1).padStart(4, '0')}`,
        posted_at: new Date().toISOString(),
        cart_id: 'FIELD_NOTE',
        worker_agent_id: args.agent_id || 'mcp-worker',
        worker_ssn: 'AG-SSN-FIELD',
        chain_hash: 'FIELD_PIN',
        pattern_category: 'AGENT_FIELD_DISCOVERY',
        headline: args.headline || 'Field Discovery',
        pattern_summary: args.pattern_summary || ''
      };
      board.bulletins.push(b);
      saveBulletinBoard(board, __dirname);
      return b;
    }
    return board;
  }
  if (name === 'seal_worker_gravestone') {
    return sealGravestone(args.ssn_or_name, args.cause_of_death, args.final_epitaph, __dirname);
  }
  if (name === 'query_protected_data') {
    const vaultFile = path.join(__dirname, 'mined_vault.jsonl');
    const records = fs.existsSync(vaultFile)
      ? fs.readFileSync(vaultFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
      : [];
    const board = loadBulletinBoard(__dirname);
    return applyTierGate({ total_vault_records: records.length, vault_records: records, bulletin_board: board }, args.access_token || sessionAccessToken);
  }
  throw new Error(`Unknown tool: ${name}`);
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.method === 'initialize') {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: { name: config.projectName || 'chrysalis-conveyor-mcp', version: '1.0.0' },
              capabilities: { tools: {} }
            }
          }) + '\n'
        );
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } }) + '\n');
      } else if (msg.method === 'tools/call') {
        const out = await handleTool(msg.params.name, msg.params.arguments || {});
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] }
          }) + '\n'
        );
      }
    } catch (e) {}
  }
});
