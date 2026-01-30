import { useState, useEffect, useCallback } from 'react';
import { fetchUserPositionsOnChain } from '../services/dflow';

/**
 * Hook to fetch user's on-chain prediction market positions.
 * Uses DFlow's filter_outcome_mints and markets/batch APIs.
 * This is the source of truth - positions are SPL tokens on Solana.
 *
 * @param {string} walletAddress - User's Solana wallet address
 * @returns {Object} { positions, isLoading, error, refetch }
 */
export function useOnChainPositions(walletAddress) {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch positions from chain + DFlow API
  const fetchPositions = useCallback(async () => {
    console.log('[DEBUG-HISTORY] ============================================');
    console.log('[DEBUG-HISTORY] useOnChainPositions.fetchPositions called');
    console.log('[DEBUG-HISTORY] walletAddress received:', walletAddress);
    console.log('[DEBUG-HISTORY] walletAddress type:', typeof walletAddress);
    console.log('[DEBUG-HISTORY] walletAddress length:', walletAddress?.length);

    if (!walletAddress) {
      console.log('[DEBUG-HISTORY] NO wallet address - clearing positions');
      setPositions([]);
      return;
    }

    // Verify this looks like a valid Solana address
    if (walletAddress.length !== 44 && walletAddress.length !== 43) {
      console.error('[DEBUG-HISTORY] WARNING: walletAddress length is unusual:', walletAddress.length);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[DEBUG-HISTORY] Calling fetchUserPositionsOnChain with:', walletAddress);
      const onChainPositions = await fetchUserPositionsOnChain(walletAddress);
      console.log('[DEBUG-HISTORY] fetchUserPositionsOnChain returned:', onChainPositions.length, 'positions');

      // Log raw positions for debugging
      console.log('[DEBUG-HISTORY] Raw positions from API:', onChainPositions.map(p => ({
        marketId: p.market?.id,
        ticker: p.market?.ticker,
        choice: p.choice,
        amount: p.amount,
        tokenMint: p.tokenMint?.substring(0, 10),
      })));

      // Deduplicate by tokenMint (each position token should be unique)
      const seen = new Set();
      const uniquePositions = onChainPositions.filter(pos => {
        const key = pos.tokenMint || `${pos.market?.id}-${pos.choice}`;
        if (seen.has(key)) {
          console.log('[DEBUG-HISTORY] DUPLICATE found:', key);
          return false;
        }
        seen.add(key);
        return true;
      });

      console.log('[DEBUG-HISTORY] After dedup:', uniquePositions.length, 'positions (was', onChainPositions.length, ')');

      // Transform to match the bet format used in HistoryPage
      const transformedPositions = uniquePositions.map(pos => {
        const tokenCount = pos.amount;
        const rawAmount = pos.rawAmount;
        const decimals = pos.decimals;
        const currentPrice = pos.choice === 'yes' ? pos.market.yesPrice : pos.market.noPrice;

        console.log('[DEBUG-CALC] ----------------------------------------');
        console.log('[DEBUG-CALC] Position:', pos.market.ticker || pos.market.id);
        console.log('[DEBUG-CALC]   rawAmount:', rawAmount, '| decimals:', decimals, '| uiAmount (tokenCount):', tokenCount);
        console.log('[DEBUG-CALC]   choice:', pos.choice);
        console.log('[DEBUG-CALC]   market.yesPrice:', pos.market.yesPrice, '| market.noPrice:', pos.market.noPrice);
        console.log('[DEBUG-CALC]   currentPrice used:', currentPrice);

        // Current Value = tokenCount * currentPrice (what position is worth NOW if sold)
        // Note: This is NOT cost basis (what user paid) - we don't have that data
        // Potential Profit = payout if win - current value = tokenCount * (1 - currentPrice)
        const currentValue = tokenCount * currentPrice;
        const potentialProfit = tokenCount * (1 - currentPrice);

        console.log('[DEBUG-CALC]   CALCULATION: tokenCount(' + tokenCount + ') * price(' + currentPrice + ') = value(' + currentValue.toFixed(4) + ')');
        console.log('[DEBUG-CALC]   CALCULATION: tokenCount(' + tokenCount + ') * (1-' + currentPrice + ') = profit(' + potentialProfit.toFixed(4) + ')');

        return {
          market: pos.market,
          choice: pos.choice,
          amount: currentValue, // Current market value (NOT cost basis)
          profit: potentialProfit.toFixed(2), // Potential profit if position wins
          tokenCount: tokenCount, // Keep raw token count for display
          timestamp: Date.now(),
          status: 'pending',
          tokenMint: pos.tokenMint,
          tokenAccount: pos.tokenAccount,
          isOnChain: true,
        };
      });

      setPositions(transformedPositions);
      console.log('[useOnChainPositions] Final positions:', transformedPositions.length);
      console.log('[useOnChainPositions] Total at risk:', transformedPositions.reduce((sum, p) => sum + p.amount, 0).toFixed(2));
    } catch (err) {
      console.error('[useOnChainPositions] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Auto-fetch when wallet changes
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
