import { debug, logError } from '../utils/debug';

const API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// 15-minute crypto market series tickers
const CRYPTO_15M_SERIES = 'KXSOL15M,KXBTC15M,KXETH15M';

/**
 * Fetch active markets from DFlow API with nested market accounts
 */
export async function fetchActiveMarkets({ limit = 100, include15MinCrypto = true } = {}) {
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isDev ? 'http://localhost:3001/api/markets' : '/api/markets';

  try {
    // Fetch regular markets
    const regularUrl = `${baseUrl}?withNestedMarkets=true&status=active&limit=${limit}`;
    const regularResponse = await fetch(regularUrl);
    let allMarkets = [];

    if (regularResponse.ok) {
      const data = await regularResponse.json();
      for (const event of (data.events || [])) {
        if (event.markets) {
          for (const market of event.markets) {
            allMarkets.push({
              ...market,
              eventTicker: event.ticker,
              eventTitle: event.title,
              imageUrl: event.imageUrl,
            });
          }
        }
      }
      debug('[Markets] Regular markets:', allMarkets.length);
    }

    // Fetch 15-minute crypto markets separately
    if (include15MinCrypto) {
      try {
        const crypto15mUrl = `${baseUrl}?withNestedMarkets=true&seriesTickers=${CRYPTO_15M_SERIES}&status=active&limit=20`;
        const crypto15mResponse = await fetch(crypto15mUrl);

        if (crypto15mResponse.ok) {
          const crypto15mData = await crypto15mResponse.json();
          let crypto15mCount = 0;
          for (const event of (crypto15mData.events || [])) {
            if (event.markets) {
              for (const market of event.markets) {
                allMarkets.push({
                  ...market,
                  eventTicker: event.ticker,
                  eventTitle: event.title,
                  imageUrl: event.imageUrl,
                  is15MinMarket: true,
                });
                crypto15mCount++;
              }
            }
          }
          debug('[Markets] 15M crypto markets:', crypto15mCount);
        }
      } catch (e) {
        debug('[Markets] 15M fetch failed:', e.message);
      }
    }

    debug('[Markets] Total:', allMarkets.length);
    if (allMarkets.length > 0) return allMarkets;
  } catch (e) {
    debug('[Markets] Fetch failed:', e.message);
  }

  throw new Error('Failed to fetch markets');
}

/**
 * Fetch events from DFlow API
 */
export async function fetchEvents({ limit = 200 } = {}) {
  const response = await fetch(`${API_BASE}/events?limit=${limit}`);
  if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
  const data = await response.json();
  return data.events || [];
}

/**
 * Fetch detailed market info including token mints
 */
export async function getMarketDetails(marketTicker) {
  try {
    const response = await fetch(`${API_BASE}/markets/${marketTicker}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    logError('[Market] Error fetching details:', e.message);
    return null;
  }
}

// Fallback images by category
const categoryImages = {
  Sports: 'https://images.unsplash.com/photo-1461896836934-28e4b8c4e1c0?w=800&h=600&fit=crop',
  Finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
  Politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',
  Crypto: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop',
  Tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
  Weather: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=600&fit=crop',
  Culture: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
  Other: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop',
};

/**
 * Get image URL based on market title keywords
 */
function getMarketImage(market, category) {
  const title = (market.title || '').toLowerCase();

  // Sports
  if (title.includes('football') || title.includes('nfl') || title.includes('super bowl')) {
    return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop';
  }
  if (title.includes('basketball') || title.includes('nba')) {
    return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop';
  }
  if (title.includes('baseball') || title.includes('mlb')) {
    return 'https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&h=600&fit=crop';
  }
  if (title.includes('soccer') || title.includes('fifa') || title.includes('world cup')) {
    return 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop';
  }
  if (title.includes('boxing') || title.includes('ufc') || title.includes('fight')) {
    return 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=600&fit=crop';
  }

  // Politics
  if (title.includes('trump') || title.includes('biden') || title.includes('president') || title.includes('election')) {
    return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop';
  }

  // Crypto
  if (title.includes('bitcoin') || title.includes('btc')) {
    return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop';
  }
  if (title.includes('ethereum') || title.includes('eth')) {
    return 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop';
  }

  // Finance
  if (title.includes('stock') || title.includes('s&p') || title.includes('nasdaq')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop';
  }
  if (title.includes('federal reserve') || title.includes('rate cut') || title.includes('interest rate')) {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop';
  }

  // Tech
  if (title.includes('ai') || title.includes('chatgpt') || title.includes('openai')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
  }

  return categoryImages[category] || categoryImages.Other;
}

/**
 * Transform DFlow market data to our app's format
 */
export function transformMarket(market, eventImages = new Map()) {
  const isResolved = market.status === 'finalized' || market.status === 'resolved';
  const resolution = market.result || market.resolution;

  let yesAsk, noAsk, yesBid, noBid;

  if (isResolved && resolution) {
    if (resolution === 'yes') {
      yesAsk = 1.0; yesBid = 1.0; noAsk = 0.0; noBid = 0.0;
    } else {
      yesAsk = 0.0; yesBid = 0.0; noAsk = 1.0; noBid = 1.0;
    }
  } else {
    yesAsk = parseFloat(market.yesAsk) || 0.5;
    noAsk = parseFloat(market.noAsk) || 0.5;
    yesBid = parseFloat(market.yesBid) || yesAsk;
    noBid = parseFloat(market.noBid) || noAsk;
  }

  const yesProfit = yesAsk > 0 ? (1 / yesAsk) - 1 : 1;
  const noProfit = noAsk > 0 ? (1 / noAsk) - 1 : 1;

  const category = getCategoryFromMarket(market);

  let image = market.imageUrl || eventImages.get(market.eventTicker);
  if (!image) image = getMarketImage(market, category);

  const usdcAccount = market.accounts?.[USDC_MINT];
  const accountKeys = Object.keys(market.accounts || {});
  const fallbackAccount = accountKeys.length > 0 ? market.accounts[accountKeys[0]] : null;
  const settlementAccount = usdcAccount || fallbackAccount;

  return {
    id: market.ticker,
    eventTicker: market.eventTicker,
    title: market.title || 'Unknown Market',
    subtitle: market.subtitle || market.yesSubTitle || '',
    category: category,
    image: image,
    yesProfit: Math.round(yesProfit * 100) / 100,
    noProfit: Math.round(noProfit * 100) / 100,
    yesPrice: yesAsk,
    noPrice: noAsk,
    yesBid: yesBid,
    noBid: noBid,
    volume: market.volume || 0,
    status: market.status,
    isResolved: isResolved,
    resolution: resolution,
    expirationTime: market.expirationTime || null,
    closeTime: market.closeTime || null,
    is15MinMarket: market.is15MinMarket || false,
    yesMint: settlementAccount?.yesMint || null,
    noMint: settlementAccount?.noMint || null,
    accounts: market.accounts || null,
  };
}

function hasStandaloneWord(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return regex.test(text);
}

function getCategoryFromMarket(market) {
  const ticker = (market.ticker || '').toUpperCase();
  const title = (market.title || '').toLowerCase();

  // Crypto
  if (ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') || ticker.includes('CRYPTO')) return 'Crypto';
  if (title.includes('bitcoin') || title.includes('ethereum') || title.includes('solana') || title.includes('crypto')) return 'Crypto';

  // Sports
  if (ticker.includes('NFL') || ticker.includes('KXSB')) return 'Sports';
  if (ticker.includes('NBA') || ticker.includes('WNBA')) return 'Sports';
  if (ticker.includes('NCAA') || ticker.includes('MLB') || ticker.includes('NHL')) return 'Sports';
  if (ticker.includes('PGA') || ticker.includes('LPGA') || ticker.includes('GOLF')) return 'Sports';
  if (ticker.includes('MLS') || ticker.includes('FIFA')) return 'Sports';
  if (ticker.includes('BOXING') || ticker.includes('UFC') || ticker.includes('MMA')) return 'Sports';
  if (ticker.includes('F1') || ticker.includes('NASCAR')) return 'Sports';
  if (title.includes('basketball') || title.includes('football') || title.includes('baseball')) return 'Sports';
  if (title.includes('tennis') || title.includes('boxing') || title.includes('ufc')) return 'Sports';
  if (title.includes('golf') || title.includes(' pga') || title.includes('lpga')) return 'Sports';
  if (title.includes('masters') || title.includes('farmers insurance open')) return 'Sports';
  if (title.includes('us open') && !title.includes('stock')) return 'Sports';
  if (title.includes('hockey') || title.includes(' nhl') || title.includes('stanley cup')) return 'Sports';
  if (title.includes('soccer') || title.includes(' mls') || title.includes('premier league')) return 'Sports';
  if (title.includes('world cup') || title.includes('champions league')) return 'Sports';
  if (title.includes('formula 1') || title.includes(' f1 ') || title.includes('nascar')) return 'Sports';
  if (title.includes('grand prix') || title.includes('racing')) return 'Sports';
  if (title.includes('tournament') || title.includes('championship')) return 'Sports';
  if (title.includes('playoffs') || title.includes('super bowl') || title.includes('finals')) return 'Sports';
  if (/will .+ win the .+/i.test(title)) {
    if (!title.includes('election') && !title.includes('vote') && !title.includes('president')) {
      return 'Sports';
    }
  }

  // Finance
  if (ticker.includes('FED') || ticker.includes('RATE')) return 'Finance';
  if (title.includes('federal reserve') || title.includes('interest rate') || title.includes('rate cut') || title.includes('rate hike')) return 'Finance';
  if (title.includes('stock market') || title.includes('s&p 500') || title.includes('dow jones') || title.includes('nasdaq')) return 'Finance';

  // Politics
  if (ticker.includes('PRES') || ticker.includes('GOV') || ticker.includes('MAYOR')) return 'Politics';
  if (title.includes('president') || title.includes('election') || title.includes('democrat') || title.includes('republican')) return 'Politics';
  if (title.includes('senate') || title.includes('house') || title.includes('congress') || title.includes('governor')) return 'Politics';
  if (title.includes('vote') || title.includes('ballot') || title.includes('primary')) return 'Politics';

  // Tech
  if (ticker.includes('LLM')) return 'Tech';
  if (/\bAI\b/.test(ticker)) return 'Tech';
  if (title.includes('artificial intelligence')) return 'Tech';
  if (hasStandaloneWord(title, 'ai') || title.includes(' ai ') || title.includes(' ai?') || title.includes(' ai.')) return 'Tech';
  if (title.includes('chatgpt') || title.includes('openai') || title.includes('llm') || title.includes('gpt-')) return 'Tech';
  if (title.includes('machine learning') || title.includes('neural network')) return 'Tech';

  // Culture
  if (ticker.includes('TIME') || ticker.includes('GOOGLE')) return 'Culture';
  if (title.includes('gta') || title.includes('video game') || title.includes('movie') || title.includes('spotify')) return 'Culture';
  if (title.includes('album') || title.includes('grammy') || title.includes('oscar') || title.includes('emmy')) return 'Culture';
  if (title.includes('netflix') || title.includes('disney') || title.includes('streaming')) return 'Culture';

  return 'Other';
}

function interleaveByCategory(markets) {
  if (markets.length <= 1) return markets;

  const byCategory = {};
  for (const market of markets) {
    const cat = market.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(market);
  }

  const result = [];
  let lastCategory = null;

  while (Object.values(byCategory).some(arr => arr.length > 0)) {
    const availableCategories = Object.keys(byCategory).filter(
      cat => byCategory[cat].length > 0 && cat !== lastCategory
    );

    let chosenCategory;
    if (availableCategories.length > 0) {
      availableCategories.sort((a, b) => byCategory[b].length - byCategory[a].length);
      chosenCategory = availableCategories[0];
    } else {
      chosenCategory = Object.keys(byCategory).find(cat => byCategory[cat].length > 0);
      if (!chosenCategory) break;
    }

    result.push(byCategory[chosenCategory].shift());
    lastCategory = chosenCategory;
  }

  return result;
}

/**
 * Fetch and transform markets for the app
 */
export async function getMarketsForApp({ limit = 100 } = {}) {
  const rawMarkets = await fetchActiveMarkets({ limit, include15MinCrypto: true });

  // Filter for valid, binary YES/NO markets with pricing
  const validMarkets = rawMarkets.filter(m => {
    const usdcAccount = m.accounts?.[USDC_MINT];
    if (!usdcAccount?.yesMint || !usdcAccount?.noMint) return false;
    if (!m.yesAsk || !m.noAsk) return false;
    if (m.status !== 'active') return false;

    const titleLower = (m.title || '').toLowerCase().trim();
    const isWillQuestion = titleLower.startsWith('will ');
    const is15MinQuestion = titleLower.includes('price up in next 15 mins') || titleLower.includes('price down in next 15 mins');
    return isWillQuestion || is15MinQuestion;
  });

  debug('[Markets] Valid binary markets:', validMarkets.length);

  const allTransformed = validMarkets.map(m => transformMarket(m));

  // Group by category and sort by expiration
  const byCategory = {};
  for (const market of allTransformed) {
    const cat = market.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(market);
  }

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => {
      const expA = a.expirationTime || Infinity;
      const expB = b.expirationTime || Infinity;
      return expA - expB;
    });
  }

  // Take up to 20 per category
  const selected = [];
  const maxPerCategory = 20;
  for (const cat of Object.keys(byCategory)) {
    selected.push(...byCategory[cat].slice(0, maxPerCategory));
  }

  debug('[Markets] Selected:', selected.length, 'markets from', Object.keys(byCategory).length, 'categories');

  return interleaveByCategory(selected);
}

/**
 * Fetch user's prediction market positions using DFlow API
 */
export async function fetchUserPositionsOnChain(userPublicKey) {
  if (!userPublicKey) return [];

  const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const proxyBase = isDev ? 'http://localhost:3001' : '';

  try {
    debug('[Positions] Fetching for:', userPublicKey?.slice(0, 8) + '...');

    // Fetch all token accounts (Token Program and Token-2022)
    const [tokenResponse, token2022Response] = await Promise.all([
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [userPublicKey, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }]
        })
      }),
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getTokenAccountsByOwner',
          params: [userPublicKey, { programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' }, { encoding: 'jsonParsed' }]
        })
      })
    ]);

    const tokenData = await tokenResponse.json();
    const token2022Data = await token2022Response.json();

    const allAccounts = [
      ...(tokenData.result?.value || []),
      ...(token2022Data.result?.value || [])
    ];

    if (allAccounts.length === 0) return [];

    // Extract mints with non-zero balances
    const mintBalances = new Map();
    for (const account of allAccounts) {
      const parsed = account.account?.data?.parsed?.info;
      if (!parsed) continue;
      const mint = parsed.mint;
      const amount = parseFloat(parsed.tokenAmount?.uiAmount || 0);
      if (amount > 0) {
        mintBalances.set(mint, {
          amount,
          rawAmount: parsed.tokenAmount?.amount,
          decimals: parsed.tokenAmount?.decimals,
          tokenAccount: account.pubkey,
        });
      }
    }

    if (mintBalances.size === 0) return [];

    debug('[Positions] Found', mintBalances.size, 'tokens with balance');

    // Filter for prediction market tokens
    const allMints = Array.from(mintBalances.keys());
    const filterResponse = await fetch(`${proxyBase}/api/filter-mints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: allMints })
    });

    if (!filterResponse.ok) return [];

    const filterData = await filterResponse.json();
    const outcomeMints = filterData.outcomeMints || [];

    if (outcomeMints.length === 0) return [];

    debug('[Positions] Prediction market tokens:', outcomeMints.length);

    // Get market details
    const marketsResponse = await fetch(`${proxyBase}/api/markets-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints: outcomeMints })
    });

    if (!marketsResponse.ok) return [];

    const marketsData = await marketsResponse.json();
    const markets = marketsData.markets || [];

    // Build positions
    const positions = [];
    for (const market of markets) {
      const usdcAccount = market.accounts?.[USDC_MINT];
      if (!usdcAccount) continue;

      if (usdcAccount.yesMint && mintBalances.has(usdcAccount.yesMint)) {
        const balance = mintBalances.get(usdcAccount.yesMint);
        positions.push({
          market: transformMarket(market),
          choice: 'yes',
          amount: balance.amount,
          rawAmount: balance.rawAmount,
          decimals: balance.decimals,
          tokenMint: usdcAccount.yesMint,
          tokenAccount: balance.tokenAccount,
          isOnChain: true,
        });
      }

      if (usdcAccount.noMint && mintBalances.has(usdcAccount.noMint)) {
        const balance = mintBalances.get(usdcAccount.noMint);
        positions.push({
          market: transformMarket(market),
          choice: 'no',
          amount: balance.amount,
          rawAmount: balance.rawAmount,
          decimals: balance.decimals,
          tokenMint: usdcAccount.noMint,
          tokenAccount: balance.tokenAccount,
          isOnChain: true,
        });
      }
    }

    debug('[Positions] Built', positions.length, 'positions');
    return positions;
  } catch (error) {
    logError('[Positions] Error:', error.message);
    return [];
  }
}

/**
 * Place a bet via DFlow Trade API
 */
export async function placeBet({ market, side, amount, userPublicKey }) {
  let outputMint = side === 'yes' ? market.yesMint : market.noMint;

  if (!outputMint) {
    const details = await getMarketDetails(market.id);
    if (details) {
      const usdcAccount = details.accounts?.[USDC_MINT];
      const fallbackAccount = Object.values(details.accounts || {})[0];
      const settlementAccount = usdcAccount || fallbackAccount;
      outputMint = side === 'yes' ? settlementAccount?.yesMint : settlementAccount?.noMint;
    }
  }

  if (!outputMint) {
    throw new Error(`No ${side} token mint found for this market`);
  }

  const amountInSmallestUnit = Math.floor(amount * 1_000_000);

  const queryParams = new URLSearchParams();
  queryParams.append('inputMint', USDC_MINT);
  queryParams.append('outputMint', outputMint);
  queryParams.append('amount', amountInSmallestUnit.toString());
  queryParams.append('slippageBps', '100');
  queryParams.append('userPublicKey', userPublicKey);

  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  const proxyBase = isProduction ? '/api/dflow-order' : 'http://localhost:3001/api/dflow-order';
  const proxyUrl = `${proxyBase}?${queryParams.toString()}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Order failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Redeem winning outcome tokens for USDC
 */
export async function redeemWinnings({ tokenMint, amount, userPublicKey }) {
  if (!tokenMint) {
    throw new Error('No token mint provided for redemption');
  }

  const amountInSmallestUnit = Math.floor(amount * 1_000_000);

  const queryParams = new URLSearchParams();
  queryParams.append('inputMint', tokenMint);
  queryParams.append('outputMint', USDC_MINT);
  queryParams.append('amount', amountInSmallestUnit.toString());
  queryParams.append('slippageBps', '100');
  queryParams.append('userPublicKey', userPublicKey);

  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  const proxyBase = isProduction ? '/api/dflow-order' : 'http://localhost:3001/api/dflow-order';
  const proxyUrl = `${proxyBase}?${queryParams.toString()}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Redemption failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Find all redeemable winning positions in a user's wallet
 */
export async function findRedeemableWinnings(userPublicKey) {
  const positions = await fetchUserPositionsOnChain(userPublicKey);

  const redeemable = positions.filter(pos => {
    const result = pos.market.resolution;
    if (!result) return false;
    const userWon = (pos.choice === 'yes' && result === 'yes') ||
                    (pos.choice === 'no' && result === 'no');
    return userWon && pos.amount > 0;
  });

  return redeemable.map(pos => ({
    tokenMint: pos.tokenMint,
    amount: pos.amount,
    market: pos.market,
    choice: pos.choice,
    value: pos.amount,
  }));
}

/**
 * Find all closeable token accounts (worthless losing position tokens)
 * These are token accounts that hold prediction market tokens where:
 * - The market has resolved
 * - The user bet on the losing side (tokens are now worthless)
 * - Closing returns ~0.002 SOL rent per account
 *
 * @param {string} userPublicKey - User's Solana wallet address
 * @returns {Promise<Array>} Array of closeable accounts with tokenAccount address and program
 */
export async function findCloseableAccounts(userPublicKey) {
  if (!userPublicKey) return [];

  const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const proxyBase = isDev ? 'http://localhost:3001' : '';

  const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

  try {
    debug('[Cleanup] Finding closeable accounts for:', userPublicKey?.slice(0, 8) + '...');

    // Fetch all token accounts (both programs)
    const [tokenResponse, token2022Response] = await Promise.all([
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [userPublicKey, { programId: TOKEN_PROGRAM }, { encoding: 'jsonParsed' }]
        })
      }),
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getTokenAccountsByOwner',
          params: [userPublicKey, { programId: TOKEN_2022_PROGRAM }, { encoding: 'jsonParsed' }]
        })
      })
    ]);

    const tokenData = await tokenResponse.json();
    const token2022Data = await token2022Response.json();

    // Collect all accounts with their program info
    const allAccounts = [
      ...(tokenData.result?.value || []).map(a => ({ ...a, programId: TOKEN_PROGRAM })),
      ...(token2022Data.result?.value || []).map(a => ({ ...a, programId: TOKEN_2022_PROGRAM }))
    ];

    if (allAccounts.length === 0) return [];

    // Extract all mints (regardless of balance - we want to find worthless ones)
    const accountsByMint = new Map();
    for (const account of allAccounts) {
      const parsed = account.account?.data?.parsed?.info;
      if (!parsed) continue;

      const mint = parsed.mint;
      const amount = parseFloat(parsed.tokenAmount?.uiAmount || 0);

      // Store account info
      accountsByMint.set(mint, {
        mint,
        amount,
        rawAmount: parsed.tokenAmount?.amount,
        tokenAccount: account.pubkey,
        programId: account.programId,
      });
    }

    // Get all mints to check which are prediction market tokens
    const allMints = Array.from(accountsByMint.keys());

    const filterResponse = await fetch(`${proxyBase}/api/filter-mints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: allMints })
    });

    if (!filterResponse.ok) return [];

    const filterData = await filterResponse.json();
    const outcomeMints = new Set(filterData.outcomeMints || []);

    if (outcomeMints.size === 0) return [];

    // Get market details for prediction tokens
    const marketsResponse = await fetch(`${proxyBase}/api/markets-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints: Array.from(outcomeMints) })
    });

    if (!marketsResponse.ok) return [];

    const marketsData = await marketsResponse.json();
    const markets = marketsData.markets || [];

    // Build map of mint -> market info + which side
    const mintToMarket = new Map();
    for (const market of markets) {
      const usdcAccount = market.accounts?.[USDC_MINT];
      if (!usdcAccount) continue;

      if (usdcAccount.yesMint) {
        mintToMarket.set(usdcAccount.yesMint, { market, side: 'yes' });
      }
      if (usdcAccount.noMint) {
        mintToMarket.set(usdcAccount.noMint, { market, side: 'no' });
      }
    }

    // Find closeable accounts: prediction tokens where market resolved against user
    const closeableAccounts = [];

    for (const [mint, accountInfo] of accountsByMint) {
      if (!outcomeMints.has(mint)) continue;

      const marketInfo = mintToMarket.get(mint);
      if (!marketInfo) continue;

      const { market, side } = marketInfo;
      const result = market.result || market.resolution;

      // Only closeable if market resolved AND user lost
      if (!result) continue;

      const userLost = (side === 'yes' && result === 'no') ||
                       (side === 'no' && result === 'yes');

      if (userLost) {
        closeableAccounts.push({
          tokenAccount: accountInfo.tokenAccount,
          mint: accountInfo.mint,
          programId: accountInfo.programId,
          amount: accountInfo.amount,
          market: {
            ticker: market.ticker,
            title: market.title,
            resolution: result,
          },
          side,
        });
      }
    }

    debug('[Cleanup] Found', closeableAccounts.length, 'closeable accounts');
    return closeableAccounts;
  } catch (error) {
    logError('[Cleanup] Error finding closeable accounts:', error.message);
    return [];
  }
}

/**
 * Build a transaction to close multiple token accounts
 * Returns the serialized transaction for signing
 *
 * SPL Token CloseAccount requires zero balance, so we burn tokens first if needed.
 *
 * @param {Array} accounts - Array of { tokenAccount, mint, programId, rawAmount } objects
 * @param {string} ownerPublicKey - The wallet that owns these accounts
 * @returns {Promise<string>} Base64 encoded transaction
 */
export async function buildCloseAccountsTransaction(accounts, ownerPublicKey) {
  const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('@solana/web3.js');

  const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';
  const connection = new Connection(HELIUS_RPC, 'confirmed');

  const owner = new PublicKey(ownerPublicKey);
  const transaction = new Transaction();

  for (const acc of accounts) {
    const tokenAccount = new PublicKey(acc.tokenAccount);
    const mint = new PublicKey(acc.mint);
    const programId = new PublicKey(acc.programId);
    const rawAmount = BigInt(acc.rawAmount || '0');

    // If account has tokens, burn them first (CloseAccount requires zero balance)
    if (rawAmount > 0n) {
      // Burn instruction (index 8): burn tokens to reduce balance to zero
      // Accounts: [0] token account, [1] mint, [2] authority
      // Data: [8, u64 amount in little endian]
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64LE(rawAmount);

      const burnInstruction = new TransactionInstruction({
        keys: [
          { pubkey: tokenAccount, isSigner: false, isWritable: true },  // Token account
          { pubkey: mint, isSigner: false, isWritable: true },          // Mint
          { pubkey: owner, isSigner: true, isWritable: false },         // Authority
        ],
        programId,
        data: Buffer.concat([Buffer.from([8]), amountBuffer]), // Burn instruction
      });

      transaction.add(burnInstruction);
    }

    // CloseAccount instruction (index 9)
    // Accounts: [0] account to close, [1] destination for rent, [2] authority
    const closeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false },
      ],
      programId,
      data: Buffer.from([9]),
    });

    transaction.add(closeInstruction);
  }

  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = owner;

  const serialized = transaction.serialize({ requireAllSignatures: false });
  return Buffer.from(serialized).toString('base64');
}

/**
 * Backfill cost basis data for old bets that stored incorrect values.
 * The bug stored tokenCount as costBasis instead of actual USDC spent.
 * This function fetches transaction history to find the real USDC amounts.
 */
export async function backfillCostBasis(walletAddress) {
  const HELIUS_API_KEY = 'fc70f382-f7ec-48d3-a615-9bacd782570e';
  const STORAGE_KEY = 'instinkt_cost_basis';
  const BACKFILL_FLAG = 'instinkt_cost_basis_backfilled';

  // Check if already backfilled
  if (localStorage.getItem(BACKFILL_FLAG) === 'true') {
    debug('[Backfill] Already completed');
    return { fixed: 0, skipped: true };
  }

  if (!walletAddress) {
    return { fixed: 0, error: 'No wallet address' };
  }

  try {
    // Fetch transaction history from Helius
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`;
    const response = await fetch(url);
    const transactions = await response.json();

    if (!Array.isArray(transactions)) {
      return { fixed: 0, error: 'Invalid transaction data' };
    }

    // Build a map of tokenMint -> actual USDC spent from transaction history
    const actualCosts = {};

    for (const tx of transactions) {
      const transfers = tx.tokenTransfers || [];

      // Find USDC out transfer (what user paid)
      const usdcOut = transfers.find(t =>
        t.fromUserAccount === walletAddress &&
        t.mint === USDC_MINT
      );

      // Find token in transfer (what user received - prediction market token)
      const tokenIn = transfers.find(t =>
        t.toUserAccount === walletAddress &&
        t.mint !== USDC_MINT
      );

      if (usdcOut && tokenIn) {
        const usdcAmount = usdcOut.tokenAmount || 0;
        const tokenMint = tokenIn.mint;

        // Only process bet-sized transactions (0.10 to 5.00 USDC)
        if (usdcAmount >= 0.10 && usdcAmount <= 5.00) {
          // Accumulate costs for the same token mint (multiple bets on same position)
          actualCosts[tokenMint] = (actualCosts[tokenMint] || 0) + usdcAmount;
        }
      }
    }

    // Load current cost basis data
    const costBasisData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    let fixedCount = 0;
    const fixes = [];

    // Check each entry and fix if needed
    for (const [tokenMint, storedCost] of Object.entries(costBasisData)) {
      const actualCost = actualCosts[tokenMint];

      if (actualCost !== undefined) {
        // Check if stored cost looks wrong (significantly different from actual)
        // The bug stored token count, which is usually > actual cost (e.g., 1.82 tokens vs 1.00 USDC)
        const diff = Math.abs(storedCost - actualCost);
        const ratio = storedCost / actualCost;

        // If stored cost is notably higher than actual (ratio > 1.1 indicates bug)
        // or if the difference is significant (> 0.05)
        if (ratio > 1.1 || diff > 0.05) {
          fixes.push({
            tokenMint: tokenMint.slice(0, 8) + '...',
            oldCost: storedCost.toFixed(4),
            newCost: actualCost.toFixed(4)
          });
          costBasisData[tokenMint] = actualCost;
          fixedCount++;
        }
      }
    }

    if (fixedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(costBasisData));
      console.log('[Backfill] Fixed', fixedCount, 'cost basis entries:');
      fixes.forEach(f => console.log('  ', f.tokenMint, ':', f.oldCost, '->', f.newCost));
    }

    // Mark as backfilled
    localStorage.setItem(BACKFILL_FLAG, 'true');

    return { fixed: fixedCount, fixes };
  } catch (err) {
    logError('[Backfill] Error:', err.message);
    return { fixed: 0, error: err.message };
  }
}
