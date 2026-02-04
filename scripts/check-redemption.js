/**
 * Explore DFlow API for redemption/claim endpoints
 * Run with: node scripts/check-redemption.js
 */

const DFLOW_API_KEY = process.env.DFLOW_API_KEY || '';
const API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';

function getHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (DFLOW_API_KEY) {
    headers['x-api-key'] = DFLOW_API_KEY;
  }
  return headers;
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  console.log('\n========================================');
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Method: ${method}`);
  console.log('========================================');

  try {
    const options = {
      method,
      headers: getHeaders(),
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    console.log('Status:', response.status);

    if (!text) {
      console.log('Empty response');
      return { status: response.status, data: null };
    }

    try {
      const data = JSON.parse(text);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 1500));
      return { status: response.status, data };
    } catch {
      console.log('Non-JSON response:', text.substring(0, 500));
      return { status: response.status, data: text };
    }
  } catch (error) {
    console.log('Error:', error.message);
    return { status: 0, error: error.message };
  }
}

async function main() {
  console.log('DFlow Redemption/Claim API Explorer');
  console.log('API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
  console.log('Time:', new Date().toISOString());

  // Check main API endpoints
  console.log('\n\n=== MAIN API (prediction-markets-api) ===');

  await testEndpoint('Redeem endpoint', `${API_BASE}/redeem`);
  await testEndpoint('Claim endpoint', `${API_BASE}/claim`);
  await testEndpoint('Settle endpoint', `${API_BASE}/settle`);
  await testEndpoint('Settlements endpoint', `${API_BASE}/settlements`);
  await testEndpoint('Redemptions endpoint', `${API_BASE}/redemptions`);
  await testEndpoint('Payout endpoint', `${API_BASE}/payout`);
  await testEndpoint('Payouts endpoint', `${API_BASE}/payouts`);

  // Check trade API endpoints
  console.log('\n\n=== TRADE API (quote-api) ===');

  await testEndpoint('Trade API - Redeem', `${TRADE_API_BASE}/redeem`);
  await testEndpoint('Trade API - Claim', `${TRADE_API_BASE}/claim`);
  await testEndpoint('Trade API - Settle', `${TRADE_API_BASE}/settle`);

  // Check if there's documentation or schema endpoint
  console.log('\n\n=== API DISCOVERY ===');

  await testEndpoint('API Root', API_BASE);
  await testEndpoint('Trade API Root', TRADE_API_BASE);
  await testEndpoint('OpenAPI/Swagger', `${API_BASE}/openapi.json`);
  await testEndpoint('API Docs', `${API_BASE}/docs`);

  // Check a finalized market's accounts for redemption info
  console.log('\n\n=== FINALIZED MARKET REDEMPTION STATUS ===');

  // Get a finalized market to check redemptionStatus field
  const marketsResponse = await testEndpoint(
    'Finalized markets (check redemptionStatus)',
    `${API_BASE}/markets?status=finalized&limit=2`
  );

  if (marketsResponse.data?.markets?.[0]) {
    const market = marketsResponse.data.markets[0];
    console.log('\n--- Market accounts structure ---');
    console.log('Ticker:', market.ticker);
    console.log('Status:', market.status);
    console.log('Result:', market.result);
    console.log('Accounts:', JSON.stringify(market.accounts, null, 2));
  }

  // Summary
  console.log('\n\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log('Looking for:');
  console.log('- Redeem/Claim endpoints to convert winning tokens to USDC');
  console.log('- redemptionStatus field in market accounts');
  console.log('- Any transaction builder for settlement');
  console.log('');
  console.log('Note: redemptionStatus in accounts may indicate if tokens can be redeemed');
}

main().catch(console.error);
