/**
 * Diagnostic script to check DFlow market data for user's positions
 * Run with: node scripts/check-positions.js
 */

const DFLOW_API_KEY = process.env.DFLOW_API_KEY || '';
const MARKETS_API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';

// User's position tickers from console logs
const USER_TICKERS = [
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

async function fetchMarkets() {
  console.log('========================================');
  console.log('DFlow Market Diagnostic');
  console.log('========================================');
  console.log('API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
  console.log('Time:', new Date().toISOString());
  console.log('');

  try {
    // Fetch events with nested markets
    const url = `${MARKETS_API_BASE}/events?withNestedMarkets=true&limit=200`;
    console.log('Fetching events from:', url);

    const response = await fetch(url, { headers: getHeaders() });
    const text = await response.text();

    if (!text) {
      console.log('Empty response from API');
      return;
    }

    const data = JSON.parse(text);
    console.log('Response status:', response.status);
    console.log('Events returned:', data.events?.length || 0);

    // Flatten markets from events
    const markets = [];
    for (const event of (data.events || [])) {
      for (const market of (event.markets || [])) {
        markets.push({
          ...market,
          eventTitle: event.title,
        });
      }
    }

    console.log('Total markets:', markets.length);
    console.log('');

    // Find user's markets
    console.log('========================================');
    console.log('SEARCHING FOR USER POSITIONS:');
    console.log('========================================');

    for (const ticker of USER_TICKERS) {
      console.log('\n--- Looking for:', ticker, '---');

      // Try exact match
      let market = markets.find(m => m.ticker === ticker);

      // Try partial match if not found
      if (!market) {
        const tickerParts = ticker.split('-');
        market = markets.find(m =>
          m.ticker?.startsWith(tickerParts[0]) ||
          m.ticker?.includes(tickerParts[0])
        );
      }

      if (market) {
        console.log('FOUND:', market.ticker);
        console.log('  Title:', market.title);
        console.log('  Status:', market.status);
        console.log('  yesAsk:', market.yesAsk);
        console.log('  yesBid:', market.yesBid);
        console.log('  noAsk:', market.noAsk);
        console.log('  noBid:', market.noBid);
        console.log('  yesPrice:', (market.yesAsk + market.yesBid) / 2);
        console.log('  noPrice:', (market.noAsk + market.noBid) / 2);
        if (market.expirationTime) {
          const expDate = new Date(market.expirationTime * 1000);
          const now = new Date();
          console.log('  expirationTime:', market.expirationTime);
          console.log('  Expiration:', expDate.toISOString());
          console.log('  Is Expired:', expDate < now ? 'YES' : 'NO');
          console.log('  Minutes until expiry:', ((expDate - now) / 60000).toFixed(1));
        }
        console.log('  Resolution:', market.resolution || 'none');
      } else {
        console.log('NOT FOUND in current markets');
        console.log('  (15-min markets expire quickly and may be resolved/removed)');
      }
    }

    // Show all 15-min markets for reference
    console.log('\n========================================');
    console.log('ALL 15-MIN MARKETS CURRENTLY AVAILABLE:');
    console.log('========================================');

    const fifteenMinMarkets = markets.filter(m =>
      m.ticker?.includes('15M')
    );
    console.log('Found', fifteenMinMarkets.length, '15-min markets');

    fifteenMinMarkets.forEach(m => {
      const exp = m.expirationTime ? new Date(m.expirationTime * 1000) : null;
      const isExpired = exp && exp < new Date();
      console.log(`\n  ${m.ticker}`);
      console.log(`    status: ${m.status} | expired: ${isExpired ? 'YES' : 'NO'}`);
      console.log(`    yesAsk: ${m.yesAsk} | noAsk: ${m.noAsk}`);
      if (exp) {
        console.log(`    expires: ${exp.toISOString()}`);
      }
    });

    // Show sample of other active markets
    console.log('\n========================================');
    console.log('SAMPLE ACTIVE NON-15M MARKETS:');
    console.log('========================================');

    const otherMarkets = markets
      .filter(m => m.status === 'active' && !m.ticker?.includes('15M'))
      .slice(0, 5);

    for (const m of otherMarkets) {
      console.log(`\n  ${m.ticker}`);
      console.log(`    yesAsk: ${m.yesAsk} | noAsk: ${m.noAsk}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

// Run
fetchMarkets().then(() => {
  console.log('\n========================================');
  console.log('DIAGNOSTIC COMPLETE');
  console.log('========================================');
});
