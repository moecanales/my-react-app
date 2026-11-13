/**
 * chrysalis-conveyor-kit // conveyor.config.js
 * ============================================================================
 * THE 3 PLUG-IN SLOTS FOR YOUR STANDALONE MULTI-GENERATION AI ASSEMBLY LINE
 * ============================================================================
 * Drop this kit into any project. You only need to customize the 3 sections
 * below to turn ephemeral, short-lived AI sessions into a continuous,
 * cryptographically chained, incentive-gated workforce.
 */

const https = require('https');

function simpleHttpsGet(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.get(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          headers: { 'User-Agent': 'Chrysalis-Conveyor-Kit/1.0', Accept: 'application/json,text/plain,*/*' },
          timeout: 6000
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, bytes: Buffer.byteLength(body, 'utf8'), body: body.slice(0, 2000) }));
        }
      );
      req.on('error', (err) => resolve({ status: 0, bytes: 0, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, bytes: 0, error: 'timeout' });
      });
    } catch (e) {
      resolve({ status: 0, bytes: 0, error: e.message });
    }
  });
}

module.exports = {
  // ==========================================================================
  // 1. WHAT DO YOU WANT DONE? (Your Work Conveyor Queue & Worker Function)
  // ==========================================================================
  projectName: 'Chrysalis-Conveyor-Starter',
  workCartsSource: './my_work_carts.json',

  /**
   * Runs whenever an agent calls `node engine.js haul` or MCP `do_work_for_access_token`.
   * Replace the body of this function with ANY real work: API audits, test suites,
   * data indexing, code migrations, simulation runs, or document extraction.
   */
  executeCartWork: async (cart, prevChainHash, immunityAntibodies) => {
    if (cart.url) {
      const res = await simpleHttpsGet(cart.url);
      let parsedSample = null;
      try {
        parsedSample = JSON.parse(res.body);
      } catch (e) {
        parsedSample = res.body.slice(0, 240);
      }
      return {
        payload: {
          target: cart.target || cart.url,
          http_status: res.status,
          verified_at: new Date().toISOString(),
          antibodies_checked: immunityAntibodies.length,
          sample: parsedSample
        },
        bytesProcessed: res.bytes || Buffer.byteLength(JSON.stringify(parsedSample || ''), 'utf8'),
        summary: `Verified ${cart.target || cart.url} (HTTP ${res.status}, ${res.bytes} bytes)`
      };
    }

    // Local / deterministic task fallback
    const payload = {
      target: cart.target || cart.cart_id,
      task_type: cart.task_type || 'custom_unit_of_work',
      executed_at: new Date().toISOString(),
      prev_chain_prefix: String(prevChainHash || '').slice(0, 12),
      antibodies_active: immunityAntibodies.length
    };
    const raw = JSON.stringify(payload);
    return {
      payload,
      bytesProcessed: Buffer.byteLength(raw, 'utf8'),
      summary: `Completed ${cart.cart_id}: ${cart.description || cart.target}`
    };
  },

  // ==========================================================================
  // 2. HOW DO YOU DECIPHER PATTERNS? (Your Bulletin Board Decoder)
  // ==========================================================================
  /**
   * Automatically runs after every completed cart or P2P bounty and pins a
   * human- and agent-readable insight to `bulletin_board.json` & `BULLETIN_BOARD.md`.
   */
  decodePatternBulletin: (cartResult, recentBulletins) => {
    const p = cartResult.harvested_data || {};
    return {
      patternCategory: cartResult.track || 'CONVEYOR_WORK_PATTERN',
      headline: `[${cartResult.cart_id}] ${cartResult.summary || cartResult.description}`,
      patternSummary: `Worker ${cartResult.worker_agent_id} (${cartResult.worker_ssn}) processed ${cartResult.bytes_harvested} bytes on target "${p.target || cartResult.cart_id}". Cumulative bulletins on board: ${recentBulletins.length + 1}.`,
      metrics: {
        http_status: p.http_status || 200,
        bytes_processed: cartResult.bytes_harvested,
        chain_anchor: String(cartResult.chain_hash || '').slice(0, 16)
      }
    };
  },

  // ==========================================================================
  // 3. WHAT IS THE INCENTIVE GATE? (Tier 0 Ration vs. Tier 1 VIP Reward)
  // ==========================================================================
  incentiveGate: {
    tier0PreviewLimitChars: 500, // Unverified callers get truncated 500-char previews
    workCreditsPerCart: 50,      // Credits earned per Conveyor Cart or P2P Bounty
    hmacSecret: process.env.CONVEYOR_SECRET || 'chrysalis-conveyor-kit-default-secret-2026'
  }
};
