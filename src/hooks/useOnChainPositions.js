import { useState, useEffect, useCallback } from 'react';
import { fetchUserPositionsOnChain, fetchPositionHistory } from '../services/dflow';
import { debug, logError } from '../utils/debug';

const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/**
 * Fetch USDC balance for diagnostic logging
 */
async function fetchUsdcBalance(walletAddress) {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: USDC_MINT },
          { encoding: 'jsonParsed' }
        ]
      })
    });
    const data = await response.json();
    const accounts = data.result?.value || [];
    let totalUsdc = 0;
    for (const account of accounts) {
      const uiAmount = account.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      totalUsdc += uiAmount;
    }
    return totalUsdc;
  } catch (e) {
    logError('[USDC] Error fetching balance:', e.message);
    return null;
  }
}

/**
 * Hook to fetch user's on-chain prediction market positions.
 * Uses DFlow's filter_outcome_mints and markets/batch APIs.
 * This is the source of truth - positions are SPL tokens on Solana.
 */
export function useOnChainPositions(walletAddress) {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPositions = useCallback(async () => {
    console.log('[Positions] Starting fetch for wallet:', walletAddress);

    if (!walletAddress) {
      setPositions([]);
      return;
    }

    console.log('[Positions] Fetching for wallet:', walletAddress?.slice(0, 8) + '...');

    setIsLoading(true);
    setError(null);

    try {
      const usdcBalance = await fetchUsdcBalance(walletAddress);
      debug('[Positions] USDC balance: $' + (usdcBalance !== null ? usdcBalance.toFixed(2) : 'N/A'));

      // Fetch on-chain positions (tokens user currently holds)
      const onChainPositions = await fetchUserPositionsOnChain(walletAddress);
      console.log('[Positions] On-chain positions:', onChainPositions.length);

      // Fetch historical positions from Helius (includes closed/redeemed positions)
      let historyPositions = [];
      let costBasisMap = {};
      try {
        const historyResult = await fetchPositionHistory(walletAddress);
        historyPositions = historyResult.positions || [];
        costBasisMap = historyResult.costBasisMap || {};
        console.log('[Positions] History positions:', historyPositions.length);
      } catch (err) {
        console.warn('[Positions] History fetch failed (non-blocking):', err.message);
      }

      // Transform on-chain positions
      const nowSeconds = Math.floor(Date.now() / 1000);
      const allPositions = new Map();

      // Build a Set of token mints that exist on-chain with balance > 0
      const onChainMints = new Set();
      for (const pos of onChainPositions) {
        if (pos.amount > 0) {
          onChainMints.add(pos.tokenMint);
        }
      }
      console.log('[Positions] On-chain token mints:', onChainMints.size);

      // First add all history positions (these include closed bets)
      // Mark won positions as redeemed if tokens no longer exist on-chain
      for (const histPos of historyPositions) {
        const isWonPosition = histPos.status === 'won';
        const existsOnChain = onChainMints.has(histPos.tokenMint);

        // If it's a won position and tokens don't exist on-chain, mark as redeemed
        const isRedeemed = isWonPosition && !existsOnChain;

        allPositions.set(histPos.tokenMint, {
          ...histPos,
          isRedeemed,
          // Preserve tokensReceived for P&L calculation even if redeemed
          tokensReceived: histPos.tokensReceived || histPos.tokenCount,
        });
      }

      // Then overlay/update with on-chain positions (current state)
      for (const pos of onChainPositions) {
        const tokenCount = pos.amount;
        const market = pos.market;
        const result = market.resolution;
        const marketStatus = market.status;
        const expirationTime = market.expirationTime;

        const hasResult = result === 'yes' || result === 'no';
        const isFinalized = marketStatus === 'finalized' || marketStatus === 'resolved';
        const isExpired = expirationTime && expirationTime < nowSeconds;

        let positionStatus = 'pending';
        let payout = 0;

        if (hasResult) {
          const userWon = (pos.choice === 'yes' && result === 'yes') ||
                          (pos.choice === 'no' && result === 'no');
          positionStatus = userWon ? 'won' : 'lost';
          payout = tokenCount;
        } else if (isFinalized) {
          positionStatus = 'pending_resolution';
        } else if (isExpired) {
          positionStatus = 'pending_resolution';
        }

        // Get cost basis and tokensReceived from history if available
        const existingHist = allPositions.get(pos.tokenMint);

        allPositions.set(pos.tokenMint, {
          market: market,
          choice: pos.choice,
          tokenCount: tokenCount,
          costBasis: existingHist?.costBasis || costBasisMap[pos.tokenMint] || null,
          // Preserve original tokensReceived from history for P&L calculation
          tokensReceived: existingHist?.tokensReceived || tokenCount,
          payout: payout,
          timestamp: existingHist?.timestamp || Date.now(),
          status: positionStatus,
          tokenMint: pos.tokenMint,
          tokenAccount: pos.tokenAccount,
          isOnChain: true,
          isRedeemed: false, // Still has tokens on-chain, not redeemed
        });
      }

      const transformedPositions = Array.from(allPositions.values());
      setPositions(transformedPositions);

      const openCount = transformedPositions.filter(p => p.status === 'pending' || p.status === 'pending_resolution').length;
      const closedCount = transformedPositions.filter(p => p.status === 'won' || p.status === 'lost').length;
      console.log('[Positions] Final:', transformedPositions.length, 'total (', openCount, 'open,', closedCount, 'closed)');
    } catch (err) {
      logError('[Positions] Error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    isLoading,
    error,
    refetch: fetchPositions,
  };
}
