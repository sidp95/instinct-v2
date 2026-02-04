/**
 * Check if DFlow swap API can redeem winning outcome tokens
 * Run with: node scripts/check-swap-redeem.js
 */

const DFLOW_API_KEY = process.env.DFLOW_API_KEY || '';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';
const API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// A finalized market's winning token mint (NO won for PRES-2024-KH)
const WINNING_TOKEN_MINT = '3CrbJmeG912tNphnKSZwEyZ1cyQV4dnFQ1NwxpFKvsrU'; // noMint for PRES-2024-KH

function getHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (DFLOW_API_KEY) {
    headers['x-api-key'] = DFLOW_API_KEY;
  }
  return headers;
}

async function testEndpoint(name, url, method = 'GET') {
  console.log('\n========================================');
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('========================================');

  try {
    const response = await fetch(url, { method, headers: getHeaders() });
    const text = await response.text();

    console.log('Status:', response.status);

    if (!text) {
      console.log('Empty response');
      return null;
    }

    try {
      const data = JSON.parse(text);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 2000));
      return data;
    } catch {
      console.log('Non-JSON response:', text.substring(0, 500));
      return null;
    }
  } catch (error) {
    console.log('Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('DFlow Swap/Redeem Explorer');
  console.log('API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
  console.log('Time:', new Date().toISOString());

  // Test user public key (dummy for testing)
  const testUserPubkey = 'DummyPubkeyForTesting111111111111111111111';

  // 1. Check swap endpoint with winning token -> USDC
  // This would redeem a winning outcome token for USDC
  console.log('\n=== SWAP ENDPOINT (Outcome Token -> USDC) ===');

  const swapUrl = `${TRADE_API_BASE}/swap?` + new URLSearchParams({
    inputMint: WINNING_TOKEN_MINT,  // Winning NO token
    outputMint: USDC_MINT,          // Get USDC back
    amount: '1000000',              // 1 token (6 decimals)
    slippageBps: '100',
    userPublicKey: testUserPubkey,
  });

  await testEndpoint('Swap winning token to USDC', swapUrl);

  // 2. Check if there's a specific redeem quote endpoint
  const redeemQuoteUrl = `${TRADE_API_BASE}/redeem/quote?` + new URLSearchParams({
    outcomeMint: WINNING_TOKEN_MINT,
    amount: '1000000',
    userPublicKey: testUserPubkey,
  });

  await testEndpoint('Redeem quote endpoint', redeemQuoteUrl);

  // 3. Check program endpoints
  await testEndpoint('Programs endpoint', `${API_BASE}/programs`);
  await testEndpoint('Instructions endpoint', `${API_BASE}/instructions`);

  // 4. Check if swap endpoint exists at all
  await testEndpoint('Swap root', `${TRADE_API_BASE}/swap`);
  await testEndpoint('Quote root', `${TRADE_API_BASE}/quote`);

  // 5. Try the swap with USDC -> outcome (the normal buy direction)
  console.log('\n=== NORMAL BUY DIRECTION (for comparison) ===');

  // Get an active market's YES mint
  const activeMarkets = await testEndpoint(
    'Active market for testing',
    `${API_BASE}/markets?status=active&limit=1`
  );

  if (activeMarkets?.markets?.[0]) {
    const market = activeMarkets.markets[0];
    const usdcAccount = market.accounts?.[USDC_MINT];

    if (usdcAccount?.yesMint) {
      const buyUrl = `${TRADE_API_BASE}/swap?` + new URLSearchParams({
        inputMint: USDC_MINT,
        outputMint: usdcAccount.yesMint,
        amount: '100000', // 0.1 USDC
        slippageBps: '100',
        userPublicKey: testUserPubkey,
      });

      await testEndpoint(`Buy YES token for ${market.ticker}`, buyUrl);
    }
  }

  // Summary
  console.log('\n\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log('Key question: Can we swap winning outcome tokens back to USDC?');
  console.log('');
  console.log('If swap works in both directions:');
  console.log('- User can "sell" winning tokens for $1 USDC each');
  console.log('- This is effectively redemption');
  console.log('');
  console.log('If swap only works USDC -> outcome:');
  console.log('- May need on-chain redemption instruction');
  console.log('- Check DFlow Solana program for redeem instruction');
}

main().catch(console.error);
