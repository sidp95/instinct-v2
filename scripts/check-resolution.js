/**
 * Explore DFlow API for resolution/outcome data
 * Run with: node scripts/check-resolution.js
 */

const DFLOW_API_KEY = process.env.DFLOW_API_KEY || '';
const API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';

// Known expired market tickers from user's positions
const EXPIRED_TICKERS = [
  'KXETH15M-26JAN271445-45',
  'KXSOL15M-26JAN271445-45',
  'KXFEDMENTION-26JAN-NATI',
  'KXAOMEN-26-CALC',
];

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
  console.log('DFlow API Resolution Explorer');
  console.log('API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
  console.log('Time:', new Date().toISOString());

  // 1. Try getting a specific market by ticker
  for (const ticker of EXPIRED_TICKERS.slice(0, 2)) {
    await testEndpoint(
      `Market by ticker: ${ticker}`,
      `${API_BASE}/markets/${ticker}`
    );
  }

  // 2. Try events with resolved/finalized status
  await testEndpoint(
    'Events with status=resolved',
    `${API_BASE}/events?status=resolved&limit=5`
  );

  await testEndpoint(
    'Events with status=finalized',
    `${API_BASE}/events?status=finalized&limit=5`
  );

  // 3. Try markets endpoint with status filter
  await testEndpoint(
    'Markets with status=resolved',
    `${API_BASE}/markets?status=resolved&limit=5`
  );

  await testEndpoint(
    'Markets with status=finalized',
    `${API_BASE}/markets?status=finalized&limit=5`
  );

  // 4. Check if there's a settlements or positions endpoint
  await testEndpoint(
    'Settlements endpoint',
    `${API_BASE}/settlements`
  );

  await testEndpoint(
    'Outcomes endpoint',
    `${API_BASE}/outcomes`
  );

  // 5. Try events with withNestedMarkets and resolved markets
  await testEndpoint(
    'Events (resolved) with nested markets',
    `${API_BASE}/events?withNestedMarkets=true&status=resolved&limit=3`
  );

  // 6. Look at series to find 15-min markets
  await testEndpoint(
    '15M ETH series',
    `${API_BASE}/series/KXETH15M`
  );

  // 7. Try markets/batch with the user's actual token mints
  // (We'd need the mints, but let's see what fields come back)
  console.log('\n========================================');
  console.log('SUMMARY: Looking for these fields in market data:');
  console.log('- resolution: yes/no');
  console.log('- outcome');
  console.log('- status: resolved/finalized/settled');
  console.log('- settlementPrice / finalPrice');
  console.log('========================================');
}

main().catch(console.error);
