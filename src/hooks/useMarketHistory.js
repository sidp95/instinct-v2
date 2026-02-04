import { useState, useEffect, useCallback } from 'react';
import { debug, logError } from '../utils/debug';

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
          debug('[History] Loaded', parsed.length, 'seen markets');
        }
      }
    } catch (error) {
      logError('[History] Failed to load:', error.message);
    }
  }, [storageKey, walletAddress]);

  const saveToStorage = useCallback((marketIds) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(marketIds)));
    } catch (error) {
      logError('[History] Failed to save:', error.message);
    }
  }, [storageKey]);

  const addToHistory = useCallback((marketId) => {
    if (!marketId || !storageKey) return;

    setInteractedMarkets((prev) => {
      if (prev.has(marketId)) return prev;
      const updated = new Set(prev);
      updated.add(marketId);
      saveToStorage(updated);
      debug('[History] Added:', marketId);
      return updated;
    });
  }, [storageKey, saveToStorage]);

  const hasInteracted = useCallback((marketId) => {
    return interactedMarkets.has(marketId);
  }, [interactedMarkets]);

  const filterMarkets = useCallback((markets) => {
    if (!markets || !Array.isArray(markets)) return [];
    if (interactedMarkets.size === 0) return markets;

    const filtered = markets.filter(market => !interactedMarkets.has(market.id));
    debug('[History] Filtered:', markets.length, '->', filtered.length, 'markets');
    return filtered;
  }, [interactedMarkets]);

  const clearHistory = useCallback(() => {
    if (!storageKey) return;
    setInteractedMarkets(new Set());
    localStorage.removeItem(storageKey);
    console.log('[History] Cleared');
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
