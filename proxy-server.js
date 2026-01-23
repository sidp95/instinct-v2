import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
const MARKETS_API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';

// Helper to get headers with API key
function getHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (DFLOW_API_KEY) {
    headers['x-api-key'] = DFLOW_API_KEY;
  }
  return headers;
}

app.get('/api/dflow-order', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps, userPublicKey } = req.query;

    console.log('[Proxy] Attempting trade:');
    console.log('  Input (USDC):', inputMint);
    console.log('  Output (prediction token):', outputMint);
    console.log('  Amount:', amount);
    console.log('  User:', userPublicKey);
    console.log('  API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');

    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps || '100',
      userPublicKey
    });

    const orderUrl = `${TRADE_API_BASE}/order?${queryParams.toString()}`;
    console.log('[Proxy] GET order:', orderUrl);

    const response = await fetch(orderUrl, { headers: getHeaders() });
    const text = await response.text();

    console.log('[Proxy] Status:', response.status);
    console.log('[Proxy] Response:', text.substring(0, 300));

    if (response.status === 403) {
      return res.status(403).json({
        error: 'DFlow API requires authentication. Check API key.',
        code: 'api_key_required'
      });
    }

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/markets', async (req, res) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const url = `${MARKETS_API_BASE}/events?${queryString}`;

    console.log('[Proxy Markets] Fetching:', url);
    console.log('[Proxy Markets] API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');

    const response = await fetch(url, { headers: getHeaders() });
    const text = await response.text();

    console.log('[Proxy Markets] Status:', response.status);
    console.log('[Proxy Markets] Response length:', text.length);

    if (!text) {
      return res.status(500).json({ error: 'Empty response from DFlow API' });
    }

    try {
      const data = JSON.parse(text);
      console.log('[Proxy Markets] Got', data.events?.length || 0, 'events');
      res.status(response.status).json(data);
    } catch (e) {
      console.log('[Proxy Markets] Parse error, raw response:', text.substring(0, 200));
      res.status(500).json({ error: 'Invalid JSON from DFlow API' });
    }
  } catch (error) {
    console.error('[Proxy Markets] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-market', async (req, res) => {
  const { outputMint } = req.query;

  console.log('[Test] Checking market for mint:', outputMint);

  const marketsUrl = `${MARKETS_API_BASE}/markets?status=active&limit=50`;
  console.log('[Test] Fetching markets...');

  const response = await fetch(marketsUrl, { headers: getHeaders() });
  const data = await response.json();

  const markets = data.markets || [];
  console.log('[Test] Total markets:', markets.length);

  markets.slice(0, 5).forEach(m => {
    console.log('[Test] Market:', m.ticker);
    if (m.accounts) {
      Object.entries(m.accounts).forEach(([key, value]) => {
        console.log('  Settlement:', key);
        console.log('  yesMint:', value.yesMint);
        console.log('  noMint:', value.noMint);
      });
    }
  });

  let foundMarket = null;
  for (const market of markets) {
    if (market.accounts) {
      for (const [settlement, acc] of Object.entries(market.accounts)) {
        if (acc.yesMint === outputMint || acc.noMint === outputMint) {
          foundMarket = { market: market.ticker, settlement, ...acc };
          break;
        }
      }
    }
    if (foundMarket) break;
  }

  if (foundMarket) {
    console.log('[Test] Found market for mint:', foundMarket);
    res.json({ found: true, ...foundMarket });
  } else {
    console.log('[Test] Mint not found in any active market');
    res.json({ found: false, searchedMint: outputMint, totalMarkets: markets.length });
  }
});

app.get('/api/get-working-market', async (req, res) => {
  try {
    const marketsUrl = `${MARKETS_API_BASE}/events?withNestedMarkets=true&status=active&limit=100`;
    const response = await fetch(marketsUrl, { headers: getHeaders() });
    const data = await response.json();

    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const marketsWithPricing = [];

    for (const event of (data.events || [])) {
      for (const market of (event.markets || [])) {
        const usdcAccount = market.accounts?.[USDC_MINT];
        if (usdcAccount?.yesMint && usdcAccount?.noMint && market.yesAsk && market.noAsk) {
          marketsWithPricing.push({
            eventTitle: event.title,
            marketTicker: market.ticker,
            marketTitle: market.title,
            yesMint: usdcAccount.yesMint,
            noMint: usdcAccount.noMint,
            yesAsk: market.yesAsk,
            noAsk: market.noAsk,
            status: market.status
          });
        }
      }
    }

    console.log('[Working Market] Found', marketsWithPricing.length, 'markets with pricing');

    if (marketsWithPricing.length > 0) {
      marketsWithPricing.slice(0, 5).forEach(m => {
        console.log('  -', m.marketTicker, '| YES:', m.yesAsk, '| NO:', m.noAsk);
      });

      return res.json({
        found: marketsWithPricing.length,
        markets: marketsWithPricing.slice(0, 10)
      });
    }

    res.json({
      found: 0,
      message: 'No markets with pricing found',
      totalEventsChecked: data.events?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-trade', async (req, res) => {
  const { yesMint, userPublicKey } = req.query;

  if (!yesMint || !userPublicKey) {
    return res.status(400).json({ error: 'Need yesMint and userPublicKey' });
  }

  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const amount = 10000;

  const orderUrl = `${TRADE_API_BASE}/order?inputMint=${USDC_MINT}&outputMint=${yesMint}&amount=${amount}&slippageBps=100&userPublicKey=${userPublicKey}`;

  console.log('[Test Trade] URL:', orderUrl);

  const response = await fetch(orderUrl, { headers: getHeaders() });
  const text = await response.text();

  console.log('[Test Trade] Status:', response.status);
  console.log('[Test Trade] Response:', text.substring(0, 500));

  res.status(response.status).send(text);
});

const server = app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
  console.log('DFLOW_API_KEY:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
});

// Keep the server alive
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
