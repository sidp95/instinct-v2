import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Debug flag - set to true for verbose logging
const DEBUG = false;

const app = express();
app.use(cors());
app.use(express.json());

const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || 'fc70f382-f7ec-48d3-a615-9bacd782570e';
const MARKETS_API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';
const MARKETS_API_DEV = 'https://dev-prediction-markets-api.dflow.net/api/v1';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';
const HELIUS_API_BASE = 'https://api.helius.xyz/v0';

function getHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (DFLOW_API_KEY) {
    headers['x-api-key'] = DFLOW_API_KEY;
  }
  return headers;
}

function debug(...args) {
  if (DEBUG) console.log(...args);
}

app.get('/api/dflow-order', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps, userPublicKey } = req.query;

    debug('[Proxy] Trade:', inputMint?.slice(0, 8), '->', outputMint?.slice(0, 8), 'amount:', amount);

    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps || '100',
      userPublicKey
    });

    const orderUrl = `${TRADE_API_BASE}/order?${queryParams.toString()}`;
    const response = await fetch(orderUrl, { headers: getHeaders() });
    const text = await response.text();

    debug('[Proxy] Order status:', response.status);

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
    console.error('[Proxy] Order error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/markets', async (req, res) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const url = `${MARKETS_API_BASE}/events?${queryString}`;

    debug('[Proxy] Markets:', url.slice(0, 100) + '...');

    const response = await fetch(url, { headers: getHeaders() });
    const text = await response.text();

    if (!text) {
      return res.status(500).json({ error: 'Empty response from DFlow API' });
    }

    try {
      const data = JSON.parse(text);
      debug('[Proxy] Markets returned:', data.events?.length || 0, 'events');
      res.status(response.status).json(data);
    } catch (e) {
      res.status(500).json({ error: 'Invalid JSON from DFlow API' });
    }
  } catch (error) {
    console.error('[Proxy] Markets error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-market', async (req, res) => {
  const { outputMint } = req.query;

  const marketsUrl = `${MARKETS_API_BASE}/markets?status=active&limit=50`;
  const response = await fetch(marketsUrl, { headers: getHeaders() });
  const data = await response.json();

  const markets = data.markets || [];

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
    res.json({ found: true, ...foundMarket });
  } else {
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

    if (marketsWithPricing.length > 0) {
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

app.post('/api/filter-mints', async (req, res) => {
  try {
    const { addresses } = req.body;

    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'addresses array required' });
    }

    debug('[Proxy] Filtering', addresses.length, 'mints');

    const response = await fetch(`${MARKETS_API_BASE}/filter_outcome_mints`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses })
    });

    let data = await response.json();
    const mainMints = new Set(data.outcomeMints || []);

    const unrecognizedMints = addresses.filter(a => !mainMints.has(a));

    if (response.status === 404 || unrecognizedMints.length > 0) {
      try {
        const devResponse = await fetch(`${MARKETS_API_DEV}/filter_outcome_mints`, {
          method: 'POST',
          headers: { ...getHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: response.status === 404 ? addresses : unrecognizedMints })
        });

        if (devResponse.ok) {
          const devData = await devResponse.json();
          const devMints = devData.outcomeMints || [];
          if (devMints.length > 0) {
            const allMints = [...mainMints, ...devMints];
            data = { outcomeMints: [...new Set(allMints)] };
          }
        }
      } catch (devErr) {
        debug('[Proxy] Dev API error:', devErr.message);
      }
    }

    debug('[Proxy] Filter result:', data.outcomeMints?.length || 0, 'mints');
    res.status(200).json(data);
  } catch (error) {
    console.error('[Proxy] filter-mints error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/markets-batch', async (req, res) => {
  try {
    const { mints } = req.body;

    if (!mints || !Array.isArray(mints)) {
      return res.status(400).json({ error: 'mints array required' });
    }

    debug('[Proxy] Batch fetch for', mints.length, 'mints');

    const response = await fetch(`${MARKETS_API_BASE}/markets/batch`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints })
    });

    let data = await response.json();

    const foundMints = new Set();
    if (data.markets) {
      for (const market of data.markets) {
        const usdcAccount = market.accounts?.['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'];
        if (usdcAccount?.yesMint) foundMints.add(usdcAccount.yesMint);
        if (usdcAccount?.noMint) foundMints.add(usdcAccount.noMint);
      }
    }

    const missingMints = mints.filter(m => !foundMints.has(m));

    if (response.status === 404 || missingMints.length > 0) {
      const mintsToFetch = response.status === 404 ? mints : missingMints;

      try {
        const devResponse = await fetch(`${MARKETS_API_DEV}/markets/batch`, {
          method: 'POST',
          headers: { ...getHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ mints: mintsToFetch })
        });

        if (devResponse.ok) {
          const devData = await devResponse.json();
          if (devData.markets && devData.markets.length > 0) {
            if (response.status === 404 || !data.markets) {
              data = devData;
            } else {
              data.markets = [...data.markets, ...devData.markets];
            }
          }
        }
      } catch (devErr) {
        debug('[Proxy] Dev API error:', devErr.message);
      }
    }

    debug('[Proxy] Batch result:', data.markets?.length || 0, 'markets');
    res.status(200).json(data);
  } catch (error) {
    console.error('[Proxy] markets-batch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Helius transaction history endpoint
app.get('/api/helius-transactions', async (req, res) => {
  try {
    const { address } = req.query;
    // Helius API max limit is 100
    const limit = Math.min(parseInt(req.query.limit) || 100, 100);

    if (!address) {
      return res.status(400).json({ error: 'address parameter required' });
    }

    const url = `${HELIUS_API_BASE}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;

    // Debug logging
    console.log('[Proxy] Helius request:');
    console.log('  Address:', address);
    console.log('  HELIUS_API_KEY:', HELIUS_API_KEY ? HELIUS_API_KEY.slice(0, 8) + '...' : 'NOT SET');
    console.log('  Full URL:', url.replace(HELIUS_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url);
    const responseText = await response.text();

    console.log('[Proxy] Helius response:');
    console.log('  Status:', response.status);
    console.log('  Body preview:', responseText.slice(0, 300));

    if (!response.ok) {
      console.error('[Proxy] Helius error:', response.status, responseText);
      return res.status(response.status).json({ error: `Helius API error: ${response.status}`, details: responseText });
    }

    const data = JSON.parse(responseText);
    console.log('[Proxy] Helius returned:', Array.isArray(data) ? data.length : 0, 'transactions');
    res.json(data);
  } catch (error) {
    console.error('[Proxy] helius-transactions error:', error.message);
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

  const response = await fetch(orderUrl, { headers: getHeaders() });
  const text = await response.text();

  res.status(response.status).send(text);
});

const server = app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
  console.log('DFLOW_API_KEY:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
