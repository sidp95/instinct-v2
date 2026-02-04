import { useState, useEffect, useCallback } from 'react';
import { fetchUserPositionsOnChain } from '../services/dflow';
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
    if (!walletAddress) {
      setPositions([]);
      return;
    }

    debug('[Positions] Fetching for wallet:', walletAddress?.slice(0, 8) + '...');

    setIsLoading(true);
    setError(null);

    try {
      const usdcBalance = await fetchUsdcBalance(walletAddress);
      debug('[Positions] USDC balance: $' + (usdcBalance !== null ? usdcBalance.toFixed(2) : 'N/A'));

      const onChainPositions = await fetchUserPositionsOnChain(walletAddress);
      debug('[Positions] Found', onChainPositions.length, 'positions on-chain');

      // Deduplicate by tokenMint
      const seen = new Set();
      const uniquePositions = onChainPositions.filter(pos => {
        const key = pos.tokenMint || `${pos.market?.id}-${pos.choice}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Transform to match the bet format used in HistoryPage
      const nowSeconds = Math.floor(Date.now() / 1000);

      const transformedPositions = uniquePositions.map(pos => {
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

        return {
          market: market,
          choice: pos.choice,
          tokenCount: tokenCount,
          payout: payout,
          timestamp: Date.now(),
          status: positionStatus,
          tokenMint: pos.tokenMint,
          tokenAccount: pos.tokenAccount,
          isOnChain: true,
        };
      });

      setPositions(transformedPositions);
      const totalTokens = transformedPositions.reduce((sum, p) => sum + (p.tokenCount || 0), 0);
      debug('[Positions] Loaded:', transformedPositions.length, 'positions, $' + totalTokens.toFixed(2), 'total value');
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
