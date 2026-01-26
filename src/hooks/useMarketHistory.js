import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'instinkt_history_';

/**
 * Hook to manage persistent market history per wallet address.
 * Tracks markets the user has interacted with (bet or skipped).
 * Persists across sessions using localStorage keyed by wallet address.
 */
export function useMarketHistory(walletAddress) {
  const [interactedMarkets, setInteractedMarkets] = useState(new Set());
  const storageKey = walletAddress ? `${STORAGE_PREFIX}${walletAddress}` : null;

  // Load history from localStorage on mount or wallet change
  useEffect(() => {
    if (!storageKey) {
      setInteractedMarkets(new Set());
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInteractedMarkets(new Set(parsed));
          console.log(`[useMarketHistory] Loaded ${parsed.length} interacted markets for ${walletAddress?.slice(0, 8)}...`);
        }
      }
    } catch (error) {
      console.error('[useMarketHistory] Failed to load history:', error);
    }
  }, [storageKey, walletAddress]);

  // Save to localStorage whenever interactedMarkets changes
  const saveToStorage = useCallback((marketIds) => {
    if (!storageKey) return;

    try {
      const arrayToStore = Array.from(marketIds);
      localStorage.setItem(storageKey, JSON.stringify(arrayToStore));
    } catch (error) {
      console.error('[useMarketHistory] Failed to save history:', error);
    }
  }, [storageKey]);

  // Add a market to history (called on bet or skip)
  const addToHistory = useCallback((marketId) => {
    if (!marketId || !storageKey) return;

    setInteractedMarkets((prev) => {
      if (prev.has(marketId)) return prev;

      const updated = new Set(prev);
      updated.add(marketId);
      saveToStorage(updated);
      console.log(`[useMarketHistory] Added market ${marketId} to history`);
      return updated;
    });
  }, [storageKey, saveToStorage]);

  // Check if a market has been interacted with
  const hasInteracted = useCallback((marketId) => {
    return interactedMarkets.has(marketId);
  }, [interactedMarkets]);

  // Filter out markets the user has already interacted with
  const filterMarkets = useCallback((markets) => {
    if (!markets || !Array.isArray(markets)) return [];
    if (interactedMarkets.size === 0) return markets;

    const filtered = markets.filter(market => !interactedMarkets.has(market.id));
    console.log(`[useMarketHistory] Filtered ${markets.length} -> ${filtered.length} markets (removed ${markets.length - filtered.length} interacted)`);
    return filtered;
  }, [interactedMarkets]);

  // Clear all history for this wallet (optional utility)
  const clearHistory = useCallback(() => {
    if (!storageKey) return;

    setInteractedMarkets(new Set());
    localStorage.removeItem(storageKey);
    console.log('[useMarketHistory] Cleared history');
  }, [storageKey]);

  return {
    interactedMarkets,
    addToHistory,
    hasInteracted,
    filterMarkets,
    clearHistory,
    historyCount: interactedMarkets.size,
  };
}
