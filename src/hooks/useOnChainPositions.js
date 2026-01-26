import { useState, useEffect, useCallback } from 'react';
import { fetchUserPositionsOnChain, getMarketsForApp } from '../services/dflow';

/**
 * Hook to fetch user's on-chain prediction market positions.
 * This is the source of truth - positions are SPL tokens on Solana.
 * Works across sessions and deployments since data is on-chain.
 *
 * @param {string} walletAddress - User's Solana wallet address
 * @returns {Object} { positions, isLoading, error, refetch }
 */
export function useOnChainPositions(walletAddress) {
  const [positions, setPositions] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch markets once (needed to map token mints to market info)
  useEffect(() => {
    let mounted = true;

    async function loadMarkets() {
      try {
        const data = await getMarketsForApp({ limit: 200 });
        if (mounted) {
          setMarkets(data);
        }
      } catch (err) {
        console.error('[useOnChainPositions] Failed to load markets:', err);
      }
    }

    loadMarkets();
    return () => { mounted = false; };
  }, []);

  // Fetch positions when wallet or markets change
  const fetchPositions = useCallback(async () => {
    if (!walletAddress || markets.length === 0) {
      setPositions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const onChainPositions = await fetchUserPositionsOnChain(walletAddress, markets);

      // Transform to match the bet format used in HistoryPage
      const transformedPositions = onChainPositions.map(pos => ({
        market: pos.market,
        choice: pos.choice,
        amount: pos.amount,
        // On-chain positions don't have these fields, but we can compute some
        profit: ((pos.choice === 'yes' ? pos.market.yesProfit : pos.market.noProfit) * pos.amount).toFixed(2),
        timestamp: Date.now(), // We don't know the actual timestamp from on-chain
        status: 'pending', // Active positions are pending
        tokenMint: pos.tokenMint,
        isOnChain: true, // Flag to indicate this came from on-chain
      }));

      setPositions(transformedPositions);
      console.log('[useOnChainPositions] Found', transformedPositions.length, 'positions');
    } catch (err) {
      console.error('[useOnChainPositions] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, markets]);

  // Auto-fetch when dependencies change
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
