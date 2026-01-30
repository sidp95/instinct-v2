const API_BASE = 'https://c.prediction-markets-api.dflow.net/api/v1';
const TRADE_API_BASE = 'https://c.quote-api.dflow.net';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';


// Show markets expiring within 24 hours (includes 15-min crypto markets)
const MAX_EXPIRY_HOURS = 24;

/**
 * Fetch active markets from DFlow API with nested market accounts
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of events to fetch
 * @returns {Promise<Array>} Array of markets with token mint addresses
 */
// 15-minute crypto market series tickers
const CRYPTO_15M_SERIES = 'KXSOL15M,KXBTC15M,KXETH15M';

export async function fetchActiveMarkets({ limit = 100, include15MinCrypto = true } = {}) {
  console.log('[DEBUG-MARKETS] fetchActiveMarkets called with:', { limit, include15MinCrypto });

  // Use proxy to avoid CORS (local proxy in dev, Vercel serverless in prod)
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isDev
    ? 'http://localhost:3001/api/markets'
    : '/api/markets';

  console.log('[DEBUG-MARKETS] Using baseUrl:', baseUrl);

  try {
    // Fetch regular markets
    const regularUrl = `${baseUrl}?withNestedMarkets=true&status=active&limit=${limit}`;
    console.log('[DFlow] Fetching regular markets from:', regularUrl);

    const regularResponse = await fetch(regularUrl);
    let allMarkets = [];

    if (regularResponse.ok) {
      const data = await regularResponse.json();

      // Flatten events into markets
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
      console.log('[DFlow] Regular markets:', allMarkets.length);
    }

    // Fetch 15-minute crypto markets separately (different series tickers)
    console.log('[DEBUG-CRYPTO15M] include15MinCrypto flag:', include15MinCrypto);
    if (include15MinCrypto) {
      console.log('[DEBUG-CRYPTO15M] ========================================');
      console.log('[DEBUG-CRYPTO15M] Fetching 15-minute crypto markets');
      console.log('[DEBUG-CRYPTO15M] Series tickers:', CRYPTO_15M_SERIES);

      try {
        const crypto15mUrl = `${baseUrl}?withNestedMarkets=true&seriesTickers=${CRYPTO_15M_SERIES}&status=active&limit=20`;
        console.log('[DEBUG-CRYPTO15M] Full URL:', crypto15mUrl);

        const crypto15mResponse = await fetch(crypto15mUrl);
        console.log('[DEBUG-CRYPTO15M] Response status:', crypto15mResponse.status);

        if (crypto15mResponse.ok) {
          const crypto15mData = await crypto15mResponse.json();
          console.log('[DEBUG-CRYPTO15M] Raw API response:', JSON.stringify(crypto15mData).substring(0, 500));
          console.log('[DEBUG-CRYPTO15M] Events returned:', crypto15mData.events?.length || 0);

          let crypto15mCount = 0;
          for (const event of (crypto15mData.events || [])) {
            console.log('[DEBUG-CRYPTO15M] Event:', event.ticker, 'markets:', event.markets?.length || 0);
            if (event.markets) {
              for (const market of event.markets) {
                console.log('[DEBUG-CRYPTO15M] Market found:', market.ticker, '-', market.title?.substring(0, 50));
                // Mark these as 15-min markets
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
          console.log('[DEBUG-CRYPTO15M] Total 15-min crypto markets added:', crypto15mCount);
          console.log('[DEBUG-CRYPTO15M] Total markets now:', allMarkets.length);
        } else {
          const errorText = await crypto15mResponse.text();
          console.log('[DEBUG-CRYPTO15M] API FAILED:', crypto15mResponse.status, errorText);
        }
      } catch (e) {
        console.log('[DEBUG-CRYPTO15M] Fetch EXCEPTION:', e.message);
      }
      console.log('[DEBUG-CRYPTO15M] ========================================');
    }

    console.log('[DEBUG-MARKETS] Final allMarkets count before return:', allMarkets.length);
    console.log('[DEBUG-MARKETS] Markets with is15MinMarket flag:', allMarkets.filter(m => m.is15MinMarket).length);

    if (allMarkets.length > 0) {
      return allMarkets;
    }
  } catch (e) {
    console.log('[DFlow] Events endpoint failed:', e.message);
  }

  throw new Error('Failed to fetch markets');
}

/**
 * Fetch events from DFlow API
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of events to fetch
 * @returns {Promise<Array>} Array of events
 */
export async function fetchEvents({ limit = 200 } = {}) {
  const response = await fetch(`${API_BASE}/events?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}

/**
 * Fetch detailed market info including token mints
 * @param {string} marketTicker - Market ticker
 * @returns {Promise<Object|null>} Market details or null if not found
 */
export async function getMarketDetails(marketTicker) {
  try {
    const response = await fetch(`${API_BASE}/markets/${marketTicker}`);
    if (!response.ok) {
      console.log('[DFlow] Failed to fetch market details:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('[DFlow] Market details:', data);
    return data;
  } catch (e) {
    console.error('[DFlow] Error fetching market details:', e);
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
 * @param {Object} market - Market object
 * @param {string} category - Market category
 * @returns {string} Image URL
 */
function getMarketImage(market, category) {
  const title = (market.title || '').toLowerCase();

  // Sports - specific matches
  if (title.includes('football') || title.includes('nfl') || title.includes('super bowl') || title.includes('pro football')) {
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
  if (title.includes('college football') || title.includes('ncaa')) {
    return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop';
  }

  // Politics
  if (title.includes('trump') || title.includes('biden') || title.includes('president') || title.includes('election') || title.includes('governor') || title.includes('mayor')) {
    return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop';
  }

  // Crypto
  if (title.includes('bitcoin') || title.includes('btc')) {
    return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop';
  }
  if (title.includes('ethereum') || title.includes('eth')) {
    return 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop';
  }
  if (title.includes('crypto')) {
    return 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop';
  }

  // Finance/Stocks
  if (title.includes('stock') || title.includes('s&p') || title.includes('nasdaq') || title.includes('dow')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop';
  }
  if (title.includes('federal reserve') || title.includes('fed ') || title.includes('rate cut') || title.includes('rate hike') || title.includes('interest rate')) {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop';
  }

  // Weather
  if (title.includes('weather') || title.includes('rain') || title.includes('temperature') || title.includes('hurricane') || title.includes('snow')) {
    return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=600&fit=crop';
  }

  // Tech
  if (title.includes('apple') || title.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=600&fit=crop';
  }
  if (title.includes('google')) {
    return 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&h=600&fit=crop';
  }
  if (title.includes('tesla')) {
    return 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop';
  }
  if (title.includes('ai') || title.includes('artificial intelligence') || title.includes('chatgpt') || title.includes('openai')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
  }

  // Entertainment/Culture
  if (title.includes('spotify') || title.includes('music') || title.includes('artist')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop';
  }
  if (title.includes('time person') || title.includes('time\'s person')) {
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop';
  }

  // Fallback to category-based image
  return categoryImages[category] || categoryImages.Other;
}

/**
 * Transform DFlow market data to our app's format
 * @param {Object} market - Raw DFlow market object
 * @param {Map} eventImages - Map of eventTicker -> imageUrl
 * @returns {Object} Transformed market for our app
 */
export function transformMarket(market, eventImages = new Map()) {
  // Parse prices (they come as strings like "0.4000")
  const yesAsk = parseFloat(market.yesAsk) || 0.5;
  const noAsk = parseFloat(market.noAsk) || 0.5;

  // Calculate profit multipliers
  // If you buy YES at 0.40 and win, you get 1.00 back, so profit = (1/0.40) - 1 = 1.5 (150%)
  const yesProfit = yesAsk > 0 ? (1 / yesAsk) - 1 : 1;
  const noProfit = noAsk > 0 ? (1 / noAsk) - 1 : 1;

  // Extract category from market (checks both ticker and title)
  const category = getCategoryFromMarket(market);

  // Get image: first try event imageUrl, then event image from map, then keyword matching
  let image = market.imageUrl || eventImages.get(market.eventTicker);
  if (!image) {
    image = getMarketImage(market, category);
  }

  // Extract yes/no token mints from USDC settlement account
  const usdcAccount = market.accounts?.[USDC_MINT];
  const accountKeys = Object.keys(market.accounts || {});
  const fallbackAccount = accountKeys.length > 0 ? market.accounts[accountKeys[0]] : null;
  const settlementAccount = usdcAccount || fallbackAccount;

  const yesMint = settlementAccount?.yesMint || null;
  const noMint = settlementAccount?.noMint || null;

  if (settlementAccount) {
    console.log('[DFlow] Extracted mints - YES:', yesMint, 'NO:', noMint);
  }

  return {
    id: market.ticker,
    eventTicker: market.eventTicker,
    title: market.title || 'Unknown Market',
    subtitle: market.subtitle || market.yesSubTitle || '',
    category: category,
    image: image,
    yesProfit: Math.round(yesProfit * 100) / 100, // Round to 2 decimals
    noProfit: Math.round(noProfit * 100) / 100,
    yesPrice: yesAsk,
    noPrice: noAsk,
    volume: market.volume || 0,
    status: market.status,
    expirationTime: market.expirationTime || null, // Unix timestamp
    closeTime: market.closeTime || null,
    // Outcome token mints for trading
    yesMint,
    noMint,
    // Keep raw accounts for debugging
    accounts: market.accounts || null,
  };
}

/**
 * Check if a word appears as a standalone word in text (not part of another word)
 * @param {string} text - Text to search in
 * @param {string} word - Word to find
 * @returns {boolean}
 */
function hasStandaloneWord(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return regex.test(text);
}

/**
 * Determine category from market ticker and title
 * @param {Object} market - Market object with ticker and title
 * @returns {string} Category name
 */
function getCategoryFromMarket(market) {
  const ticker = (market.ticker || '').toUpperCase();
  const title = (market.title || '').toLowerCase();

  // Crypto - check both ticker and title
  if (ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') || ticker.includes('CRYPTO')) return 'Crypto';
  if (title.includes('bitcoin') || title.includes('ethereum') || title.includes('solana') || title.includes('crypto')) return 'Crypto';

  // Sports - check BEFORE tech to prioritize sports keywords
  // Ticker-based detection
  if (ticker.includes('NFL') || ticker.includes('KXSB')) return 'Sports';
  if (ticker.includes('NBA') || ticker.includes('WNBA')) return 'Sports';
  if (ticker.includes('NCAA') || ticker.includes('MLB') || ticker.includes('NHL')) return 'Sports';
  if (ticker.includes('PGA') || ticker.includes('LPGA') || ticker.includes('GOLF')) return 'Sports';
  if (ticker.includes('MLS') || ticker.includes('FIFA')) return 'Sports';
  if (ticker.includes('BOXING') || ticker.includes('UFC') || ticker.includes('MMA')) return 'Sports';
  if (ticker.includes('F1') || ticker.includes('NASCAR')) return 'Sports';

  // Title-based detection - team sports
  if (title.includes('basketball') || title.includes('football') || title.includes('baseball')) return 'Sports';
  if (title.includes('tennis') || title.includes('boxing') || title.includes('ufc')) return 'Sports';

  // Golf
  if (title.includes('golf') || title.includes(' pga') || title.includes('lpga')) return 'Sports';
  if (title.includes('masters') || title.includes('farmers insurance open')) return 'Sports';
  if (title.includes('us open') && !title.includes('stock')) return 'Sports'; // US Open golf/tennis, not stock market

  // Hockey
  if (title.includes('hockey') || title.includes(' nhl') || title.includes('stanley cup')) return 'Sports';

  // Soccer
  if (title.includes('soccer') || title.includes(' mls') || title.includes('premier league')) return 'Sports';
  if (title.includes('world cup') || title.includes('champions league')) return 'Sports';

  // Racing
  if (title.includes('formula 1') || title.includes(' f1 ') || title.includes('nascar')) return 'Sports';
  if (title.includes('grand prix') || title.includes('racing')) return 'Sports';

  // General sports patterns
  if (title.includes('tournament') || title.includes('championship')) return 'Sports';
  if (title.includes('playoffs') || title.includes('super bowl') || title.includes('finals')) return 'Sports';

  // "Will X win the Y" pattern - often sports (tournaments, matches, etc.)
  if (/will .+ win the .+/i.test(title)) {
    // But exclude political wins
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

  // Tech - use standalone word matching for "AI" to avoid false positives
  if (ticker.includes('LLM')) return 'Tech';
  // Check for "AI" as standalone word in ticker (e.g., "KXAI" but not "FAIR")
  if (/\bAI\b/.test(ticker)) return 'Tech';
  // Title checks - be specific about AI
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

/**
 * Interleave markets so the same category NEVER appears consecutively
 * @param {Array} markets - Array of market objects with category field
 * @returns {Array} Interleaved array of markets
 */
function interleaveByCategory(markets) {
  if (markets.length <= 1) return markets;

  // Group markets by category
  const byCategory = {};
  for (const market of markets) {
    const cat = market.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(market);
  }

  const result = [];
  let lastCategory = null;

  // Keep picking markets, always from a different category than the last one
  while (Object.values(byCategory).some(arr => arr.length > 0)) {
    // Get categories that still have markets and are different from last
    const availableCategories = Object.keys(byCategory).filter(
      cat => byCategory[cat].length > 0 && cat !== lastCategory
    );

    let chosenCategory;

    if (availableCategories.length > 0) {
      // Pick from available categories (round-robin style, prioritize those with most markets)
      availableCategories.sort((a, b) => byCategory[b].length - byCategory[a].length);
      chosenCategory = availableCategories[0];
    } else {
      // Only one category left with markets - have to use it
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
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of transformed markets
 */
export async function getMarketsForApp({ limit = 100 } = {}) {
  console.log('[DEBUG-MARKETS] getMarketsForApp called, fetching with include15MinCrypto=true');
  const rawMarkets = await fetchActiveMarkets({ limit, include15MinCrypto: true });

  console.log('[DFlow] Raw markets count:', rawMarkets.length);

  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  // Log raw crypto-related markets before filtering
  const cryptoRaw = rawMarkets.filter(m => {
    const ticker = (m.ticker || '').toUpperCase();
    const title = (m.title || '').toLowerCase();
    return ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') ||
           title.includes('bitcoin') || title.includes('ethereum') || title.includes('solana') || title.includes('crypto');
  });
  console.log('[DFlow] Raw crypto-related markets:', cryptoRaw.length);
  if (cryptoRaw.length > 0) {
    console.log('[DFlow] Sample crypto markets:', cryptoRaw.slice(0, 5).map(m => ({
      ticker: m.ticker,
      title: m.title,
      status: m.status,
      hasUsdc: !!m.accounts?.[USDC_MINT],
      hasPricing: !!(m.yesAsk && m.noAsk),
      yesAsk: m.yesAsk,
      noAsk: m.noAsk,
    })));
  }

  // Filter for valid, binary YES/NO markets with pricing
  const validMarkets = rawMarkets.filter(m => {
    const ticker = (m.ticker || '').toUpperCase();
    const title = (m.title || '').toLowerCase();
    const isCrypto = ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') ||
                     title.includes('bitcoin') || title.includes('ethereum') || title.includes('solana');

    // Must have USDC settlement with token mints
    const usdcAccount = m.accounts?.[USDC_MINT];
    if (!usdcAccount?.yesMint || !usdcAccount?.noMint) {
      if (isCrypto) console.log('[DFlow] Crypto market filtered (no USDC mints):', m.ticker, m.title?.substring(0, 40));
      return false;
    }

    // Must have pricing
    if (!m.yesAsk || !m.noAsk) {
      if (isCrypto) console.log('[DFlow] Crypto market filtered (no pricing):', m.ticker, m.title?.substring(0, 40));
      return false;
    }

    // Must be active
    if (m.status !== 'active') {
      if (isCrypto) console.log('[DFlow] Crypto market filtered (not active):', m.ticker, m.status);
      return false;
    }

    // Binary filter: title must be a YES/NO question
    // Allow: "Will X?" and "X price up in next 15 mins?" patterns
    const titleLower = (m.title || '').toLowerCase().trim();
    const isWillQuestion = titleLower.startsWith('will ');
    const is15MinQuestion = titleLower.includes('price up in next 15 mins') || titleLower.includes('price down in next 15 mins');

    // DEBUG: Log 15-min market title pattern check
    if (m.is15MinMarket) {
      console.log('[DEBUG-CRYPTO15M] Title filter check for:', m.ticker);
      console.log('[DEBUG-CRYPTO15M]   title:', m.title);
      console.log('[DEBUG-CRYPTO15M]   isWillQuestion:', isWillQuestion);
      console.log('[DEBUG-CRYPTO15M]   is15MinQuestion:', is15MinQuestion);
      console.log('[DEBUG-CRYPTO15M]   PASSES:', isWillQuestion || is15MinQuestion);
    }

    if (!isWillQuestion && !is15MinQuestion) {
      if (isCrypto) console.log('[DFlow] Crypto market filtered (not a binary question):', m.ticker, m.title?.substring(0, 50));
      return false;
    }

    return true;
  });

  console.log('[DFlow] Valid binary markets:', validMarkets.length);

  // Log valid crypto markets that passed filters
  const validCrypto = validMarkets.filter(m => {
    const ticker = (m.ticker || '').toUpperCase();
    const title = (m.title || '').toLowerCase();
    return ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') ||
           title.includes('bitcoin') || title.includes('ethereum') || title.includes('solana');
  });
  console.log('[DFlow] Valid crypto markets after filtering:', validCrypto.length);
  if (validCrypto.length > 0) {
    console.log('[DFlow] Valid crypto market samples:', validCrypto.slice(0, 3).map(m => ({ ticker: m.ticker, title: m.title?.substring(0, 40) })));
  }

  // Transform ALL valid markets first (so we can categorize them)
  const allTransformed = validMarkets.map(m => transformMarket(m));

  // Log raw category distribution
  const rawCategoryCount = {};
  allTransformed.forEach(m => {
    rawCategoryCount[m.category] = (rawCategoryCount[m.category] || 0) + 1;
  });
  console.log('[DFlow] Raw category distribution:', rawCategoryCount);

  // Sort each category by expiration (soonest first)
  const byCategory = {};
  for (const market of allTransformed) {
    const cat = market.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(market);
  }

  // Sort each category by expiration
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => {
      const expA = a.expirationTime || Infinity;
      const expB = b.expirationTime || Infinity;
      return expA - expB;
    });
  }

  // Take up to 20 markets from each category (ensuring diversity)
  const selected = [];
  const maxPerCategory = 20;
  for (const cat of Object.keys(byCategory)) {
    selected.push(...byCategory[cat].slice(0, maxPerCategory));
  }

  // Log selected category distribution
  const categoryCount = {};
  selected.forEach(m => {
    categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
  });
  console.log('[DFlow] Selected category distribution:', categoryCount);

  // Interleave markets so the same category never appears consecutively
  const interleaved = interleaveByCategory(selected);

  return interleaved;
}

/**
 * Place a bet via DFlow Trade API
 * @param {Object} options - Bet options
 * @param {Object} options.market - Market object with yesMint/noMint
 * @param {string} options.side - 'yes' or 'no'
 * @param {number} options.amount - Amount in USDC (e.g., 0.01)
 * @param {string} options.userPublicKey - User's Solana wallet address
 * @returns {Promise<Object>} Order response with transaction data
 */
/**
 * Fetch user's prediction market positions using DFlow API
 * Step 1: Get user's token accounts from Solana
 * Step 2: Filter for prediction market tokens via DFlow API
 * Step 3: Get market details for those tokens
 * @param {string} userPublicKey - User's Solana wallet address
 * @returns {Promise<Array>} Array of positions with market info and amounts
 */
export async function fetchUserPositionsOnChain(userPublicKey) {
  if (!userPublicKey) {
    console.log('[DEBUG-HISTORY] fetchUserPositionsOnChain called with NO wallet address');
    return [];
  }

  const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';

  // Use proxy for DFlow API calls
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const proxyBase = isDev ? 'http://localhost:3001' : '';

  try {
    console.log('[DEBUG-HISTORY] ========================================');
    console.log('[DEBUG-HISTORY] fetchUserPositionsOnChain STARTING');
    console.log('[DEBUG-HISTORY] Wallet address being queried:', userPublicKey);
    console.log('[DEBUG-HISTORY] Proxy base URL:', proxyBase);

    // Step 1: Fetch all token accounts for the user (both Token Program and Token-2022)
    const [tokenResponse, token2022Response] = await Promise.all([
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            userPublicKey,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        })
      }),
      fetch(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getTokenAccountsByOwner',
          params: [
            userPublicKey,
            { programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' }, // Token-2022
            { encoding: 'jsonParsed' }
          ]
        })
      })
    ]);

    const tokenData = await tokenResponse.json();
    const token2022Data = await token2022Response.json();

    const allAccounts = [
      ...(tokenData.result?.value || []),
      ...(token2022Data.result?.value || [])
    ];

    console.log('[DEBUG-HISTORY] Token Program accounts:', tokenData.result?.value?.length || 0);
    console.log('[DEBUG-HISTORY] Token-2022 accounts:', token2022Data.result?.value?.length || 0);
    console.log('[DEBUG-HISTORY] Total token accounts found:', allAccounts.length);

    if (allAccounts.length === 0) {
      console.log('[DEBUG-HISTORY] NO token accounts found for this wallet');
      return [];
    }

    // Extract mints with non-zero balances
    const mintBalances = new Map();
    for (const account of allAccounts) {
      const parsed = account.account?.data?.parsed?.info;
      if (!parsed) continue;

      const mint = parsed.mint;
      const tokenAmount = parsed.tokenAmount;

      // Log raw token data for debugging
      console.log('[DEBUG-HISTORY] Token account:', {
        mint: mint?.substring(0, 10) + '...',
        rawAmount: tokenAmount?.amount,
        uiAmount: tokenAmount?.uiAmount,
        decimals: tokenAmount?.decimals,
      });

      // Use uiAmount which is already decimal-adjusted
      const amount = parseFloat(tokenAmount?.uiAmount || 0);

      if (amount > 0) {
        mintBalances.set(mint, {
          amount,
          rawAmount: tokenAmount?.amount,
          decimals: tokenAmount?.decimals,
          tokenAccount: account.pubkey,
        });
      }
    }

    if (mintBalances.size === 0) {
      console.log('[DEBUG-HISTORY] No non-zero token balances found');
      return [];
    }

    console.log('[DEBUG-HISTORY] Tokens with non-zero balances:', mintBalances.size);
    console.log('[DEBUG-HISTORY] All mint addresses:', Array.from(mintBalances.keys()));

    // Step 2: Filter for prediction market tokens via DFlow API
    const allMints = Array.from(mintBalances.keys());
    console.log('[DEBUG-HISTORY] Calling filter_outcome_mints with', allMints.length, 'mints');

    const filterResponse = await fetch(`${proxyBase}/api/filter-mints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: allMints })
    });

    console.log('[DEBUG-HISTORY] filter_outcome_mints response status:', filterResponse.status);

    if (!filterResponse.ok) {
      const errorText = await filterResponse.text();
      console.log('[DEBUG-HISTORY] filter_outcome_mints FAILED:', filterResponse.status, errorText);
      return [];
    }

    const filterData = await filterResponse.json();
    const outcomeMints = filterData.outcomeMints || [];

    console.log('[DEBUG-HISTORY] filter_outcome_mints raw response:', JSON.stringify(filterData));
    console.log('[DEBUG-HISTORY] Prediction market tokens found:', outcomeMints.length);
    console.log('[DEBUG-HISTORY] Outcome mint addresses:', outcomeMints);

    if (outcomeMints.length === 0) {
      console.log('[DEBUG-HISTORY] NO prediction market tokens found in wallet');
      return [];
    }

    // Step 3: Get market details for those mints
    console.log('[DEBUG-HISTORY] Calling markets/batch with mints:', outcomeMints);

    const marketsResponse = await fetch(`${proxyBase}/api/markets-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints: outcomeMints })
    });

    console.log('[DEBUG-HISTORY] markets/batch response status:', marketsResponse.status);

    if (!marketsResponse.ok) {
      const errorText = await marketsResponse.text();
      console.log('[DEBUG-HISTORY] markets/batch FAILED:', marketsResponse.status, errorText);
      return [];
    }

    const marketsData = await marketsResponse.json();
    const markets = marketsData.markets || [];

    console.log('[DEBUG-HISTORY] markets/batch raw response:', JSON.stringify(marketsData).substring(0, 500));
    console.log('[DEBUG-HISTORY] Markets returned:', markets.length);
    console.log('[DEBUG-HISTORY] Market tickers:', markets.map(m => m.ticker));

    // Build positions from markets
    const positions = [];
    for (const market of markets) {
      const usdcAccount = market.accounts?.[USDC_MINT];
      console.log('[DEBUG-HISTORY] Processing market:', market.ticker, 'hasUSDC:', !!usdcAccount);

      if (!usdcAccount) {
        console.log('[DEBUG-HISTORY] Skipping market (no USDC account):', market.ticker);
        continue;
      }

      // Check if user has YES tokens
      if (usdcAccount.yesMint && mintBalances.has(usdcAccount.yesMint)) {
        const balance = mintBalances.get(usdcAccount.yesMint);
        console.log('[DEBUG-HISTORY] YES position in', market.ticker);
        console.log('[DEBUG-HISTORY]   uiAmount:', balance.amount, '| rawAmount:', balance.rawAmount, '| decimals:', balance.decimals);
        console.log('[DEBUG-HISTORY]   market.yesAsk:', market.yesAsk, '| market.yesBid:', market.yesBid);
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

      // Check if user has NO tokens
      if (usdcAccount.noMint && mintBalances.has(usdcAccount.noMint)) {
        const balance = mintBalances.get(usdcAccount.noMint);
        console.log('[DEBUG-HISTORY] NO position in', market.ticker);
        console.log('[DEBUG-HISTORY]   uiAmount:', balance.amount, '| rawAmount:', balance.rawAmount, '| decimals:', balance.decimals);
        console.log('[DEBUG-HISTORY]   market.noAsk:', market.noAsk, '| market.noBid:', market.noBid);
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

    console.log('[DEBUG-HISTORY] ========================================');
    console.log('[DEBUG-HISTORY] FINAL: Found', positions.length, 'on-chain positions');
    console.log('[DEBUG-HISTORY] Position details:', positions.map(p => ({
      market: p.market.title?.substring(0, 30),
      choice: p.choice,
      amount: p.amount,
    })));
    return positions;
  } catch (error) {
    console.error('[DFlow] Failed to fetch on-chain positions:', error);
    return [];
  }
}

export async function placeBet({ market, side, amount, userPublicKey }) {
  console.log('[DFlow] Placing bet:', { market: market.id, side, amount, userPublicKey });

  // Get the appropriate outcome token mint based on side
  let outputMint = side === 'yes' ? market.yesMint : market.noMint;

  // If mint not available, try fetching market details
  if (!outputMint) {
    console.log('[DFlow] Token mint not found, fetching market details...');
    const details = await getMarketDetails(market.id);
    if (details) {
      // Get USDC settlement account or fall back to first account
      const usdcAccount = details.accounts?.[USDC_MINT];
      const fallbackAccount = Object.values(details.accounts || {})[0];
      const settlementAccount = usdcAccount || fallbackAccount;

      const yesMint = settlementAccount?.yesMint;
      const noMint = settlementAccount?.noMint;
      outputMint = side === 'yes' ? yesMint : noMint;
      console.log('[DFlow] Got mints from details - YES:', yesMint, 'NO:', noMint);
    }
  }

  if (!outputMint) {
    console.error('[DFlow] No outcome token mint found for', side, 'Market:', market);
    throw new Error(`No ${side} token mint found for this market`);
  }

  // USDC has 6 decimals
  const amountInSmallestUnit = Math.floor(amount * 1_000_000);
  console.log('[DFlow] Amount calculation:', { amountUSDC: amount, amountInSmallestUnit, outputMint });

  const queryParams = new URLSearchParams();
  queryParams.append('inputMint', USDC_MINT);
  queryParams.append('outputMint', outputMint);
  queryParams.append('amount', amountInSmallestUnit.toString());
  queryParams.append('slippageBps', '100'); // 1% slippage
  queryParams.append('userPublicKey', userPublicKey);

  // Use local/Vercel proxy instead of direct API call (avoids CORS)
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  const proxyBase = isProduction ? '/api/dflow-order' : 'http://localhost:3001/api/dflow-order';

  // Build proxy URL with same query params
  const proxyUrl = `${proxyBase}?${queryParams.toString()}`;
  console.log('[DFlow] Using proxy:', proxyUrl);

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[DFlow] Order failed:', response.status, errorText);
    throw new Error(`Order failed: ${response.status} - ${errorText}`);
  }

  const orderData = await response.json();

  console.log('[DFlow] Order response:', orderData);
  return orderData;
}
