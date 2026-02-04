import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';
import SwipeCard from '../components/SwipeCard';
import Timer from '../components/Timer';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import LogoutButton from '../components/LogoutButton';
import { getMarketsForApp, placeBet } from '../services/dflow';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useMarketHistory } from '../hooks/useMarketHistory';
import { playSwipeSound, unlockAudio } from '../utils/sounds';
import { debug, logError } from '../utils/debug';

const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function fetchUsdcBalance(walletAddress) {
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const ownerPubkey = new PublicKey(walletAddress);
    const usdcMintPubkey = new PublicKey(USDC_MINT);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPubkey, {
      mint: usdcMintPubkey,
    });
    if (tokenAccounts.value.length === 0) return 0;
    let total = 0;
    for (const acc of tokenAccounts.value) {
      total += acc.account.data.parsed.info.tokenAmount.uiAmount || 0;
    }
    return total;
  } catch (error) {
    logError('[Betting] Error fetching USDC:', error.message);
    return 0;
  }
}

function getFriendlyErrorMessage(error) {
  const message = error?.message || error?.toString() || '';
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('route_not_found') || lowerMessage.includes('route not found')) {
    return "This market isn't available right now. Try another one!";
  }
  if (lowerMessage.includes('no record of a prior credit') || lowerMessage.includes('debit')) {
    return 'Insufficient funds. Please add USDC to your wallet first.';
  }
  if (lowerMessage.includes('simulation failed')) {
    return 'Transaction failed. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

function ThemeToggleButton({ isDark, onToggle, colors }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'absolute',
        top: '10px',
        right: '56px',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: colors.paper,
        border: `2px solid ${colors.border}`,
        boxShadow: `2px 2px 0 ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

const ALL_CATEGORIES = ['Crypto', 'Sports', 'Politics', 'Finance', 'Tech', 'Culture', 'Other'];

export default function BettingPage({ onPlaceBet, betSize, balance, goToWallet }) {
  const { handleLogOut, primaryWallet } = useDynamicContext();
  const { isDark, toggleTheme, colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMarkets, setAllMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const { success, warning, error } = useToast();

  const walletAddress = primaryWallet?.address || null;

  useEffect(() => {
    if (walletAddress) {
      fetchUsdcBalance(walletAddress).then(setUsdcBalance);
    }
  }, [walletAddress]);

  const { addToHistory, filterMarkets: filterByHistory } = useMarketHistory(walletAddress);

  const [selectedCategories, setSelectedCategories] = useState(() => new Set(ALL_CATEGORIES));

  const handleCategoryToggle = useCallback((category) => {
    setSelectedCategories(prev => {
      const updated = new Set(prev);
      if (updated.has(category)) {
        if (updated.size > 1) {
          updated.delete(category);
        }
      } else {
        updated.add(category);
      }
      return updated;
    });
    setCurrentIndex(0);
  }, []);

  const markets = useMemo(() => {
    const afterHistory = filterByHistory(allMarkets);
    const afterCategory = afterHistory.filter(market =>
      selectedCategories.has(market.category)
    );
    debug('[Betting] Markets:', allMarkets.length, '->', afterHistory.length, '->', afterCategory.length);
    return afterCategory;
  }, [allMarkets, filterByHistory, selectedCategories]);

  const availableCategories = useMemo(() => {
    const cats = new Set(allMarkets.map(m => m.category));
    return ALL_CATEGORIES.filter(cat => cats.has(cat));
  }, [allMarkets]);

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getMarketsForApp({ limit: 100 });
        if (isMounted) {
          debug('[Betting] Loaded', data.length, 'markets');
          setAllMarkets(data);
          setIsLoading(false);
        }
      } catch (err) {
        logError('[Betting] Failed to load markets:', err.message);
        if (isMounted) {
          setLoadError(err.message);
          setIsLoading(false);
        }
      }
    }

    loadMarkets();
    return () => { isMounted = false; };
  }, []);

  const currentMarket = markets.length > 0 ? markets[currentIndex % markets.length] : null;
  const nextMarket = markets.length > 1 ? markets[(currentIndex + 1) % markets.length] : null;

  const handleSwipe = useCallback(async (dir) => {
    if (!currentMarket || isPlacingBet) return;

    if (dir === 'skip') {
      addToHistory(currentMarket.id);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (dir === 'yes' || dir === 'no') {
      if (usdcBalance !== null && usdcBalance === 0) {
        warning('You need USDC to place bets. Tap here to fund your wallet!', {
          duration: 5000,
          onClick: goToWallet,
        });
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      const currentBalance = usdcBalance ?? balance;
      if (currentBalance < betSize) {
        error('Insufficient funds. Please add USDC to your wallet first.', {
          duration: 4000,
          onClick: goToWallet,
        });
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      if (!walletAddress) {
        error('Wallet not connected');
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      setIsPlacingBet(true);

      try {
        const orderResponse = await placeBet({
          market: currentMarket,
          side: dir,
          amount: betSize,
          userPublicKey: walletAddress,
        });

        if (!orderResponse.transaction) {
          warning('Order created but no transaction returned', { duration: 3000 });
          setIsPlacingBet(false);
          setCurrentIndex((prev) => prev + 1);
          return;
        }

        if (!primaryWallet) {
          error('Wallet not found');
          setIsPlacingBet(false);
          setCurrentIndex((prev) => prev + 1);
          return;
        }

        const txBytes = Buffer.from(orderResponse.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBytes);

        if (!isSolanaWallet(primaryWallet)) {
          throw new Error('Not a Solana wallet');
        }

        const signer = await primaryWallet.getSigner();
        const signedTx = await signer.signTransaction(transaction);

        const connection = new Connection(SOLANA_RPC, 'confirmed');
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });

        await connection.confirmTransaction(signature, 'confirmed');

        // Log critical state change
        console.log('[Bet] Placed:', dir.toUpperCase(), 'on', currentMarket.id, '| $' + betSize);

        success(`Bet placed! ${signature.slice(0, 8)}...`, { duration: 5000 });

        const tokenMint = dir === 'yes' ? currentMarket.yesMint : currentMarket.noMint;
        if (tokenMint) {
          try {
            const costBasisData = JSON.parse(localStorage.getItem('instinkt_cost_basis') || '{}');
            const usdcSpent = orderResponse.inAmount ? orderResponse.inAmount / 1000000 : betSize;
            costBasisData[tokenMint] = (costBasisData[tokenMint] || 0) + usdcSpent;
            localStorage.setItem('instinkt_cost_basis', JSON.stringify(costBasisData));
          } catch (e) {
            // Silent fail for cost basis storage
          }
        }

        onPlaceBet({
          market: currentMarket,
          choice: dir,
          amount: betSize,
          profit: dir === 'yes'
            ? (currentMarket.yesProfit * betSize).toFixed(2)
            : (currentMarket.noProfit * betSize).toFixed(2),
          timestamp: Date.now(),
          status: 'pending',
          txSignature: signature,
        });

        addToHistory(currentMarket.id);
        setIsPlacingBet(false);
        setCurrentIndex((prev) => prev + 1);

      } catch (err) {
        logError('[Betting] Failed to place bet:', err.message);
        const friendlyMessage = getFriendlyErrorMessage(err);
        error(friendlyMessage, { duration: 4000 });
        setIsPlacingBet(false);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  }, [currentMarket, betSize, onPlaceBet, balance, error, success, warning, goToWallet, walletAddress, isPlacingBet, primaryWallet, addToHistory, usdcBalance]);

  const handleTimerComplete = useCallback(() => {
    warning('Too slow!', { duration: 3000 });
    if (currentMarket) {
      addToHistory(currentMarket.id);
    }
    setCurrentIndex((prev) => prev + 1);
  }, [warning, currentMarket, addToHistory]);

  const handleButtonClick = (choice) => {
    unlockAudio();
    playSwipeSound();
    handleSwipe(choice);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pb-20">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="card-comic p-8 text-center"
            style={{ backgroundColor: colors.paper, borderColor: colors.border }}
          >
            <div
              className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: colors.border, borderTopColor: 'transparent' }}
            ></div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>Loading markets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col h-full pb-20">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="card-comic p-8 text-center max-w-sm"
            style={{ backgroundColor: colors.paper, borderColor: colors.border }}
          >
            <div className="text-4xl mb-4" style={{ color: colors.text }}>:(</div>
            <p className="text-lg font-bold text-red-500 mb-2">Failed to load markets</p>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-white font-bold rounded-comic active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              style={{
                backgroundColor: colors.border,
                boxShadow: `3px 3px 0 ${colors.border}`,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMarket) {
    const hasAllMarkets = allMarkets.length > 0;
    const afterHistoryCount = filterByHistory(allMarkets).length;
    const allSeenInCategory = hasAllMarkets && afterHistoryCount === 0;
    const filteredOutByCategory = hasAllMarkets && afterHistoryCount > 0 && markets.length === 0;
    const selectedCategoriesArray = Array.from(selectedCategories);
    const noCategoryMarkets = hasAllMarkets && selectedCategoriesArray.length > 0 &&
      !allMarkets.some(m => selectedCategories.has(m.category));

    return (
      <div className="flex flex-col h-full pb-20">
        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} colors={colors} />
        <LogoutButton />
        <Header />

        {hasAllMarkets && (
          <CategoryFilter
            selectedCategories={selectedCategories}
            onToggle={handleCategoryToggle}
            availableCategories={availableCategories}
          />
        )}

        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="card-comic p-8 text-center max-w-sm"
            style={{ backgroundColor: colors.paper, borderColor: colors.border }}
          >
            <div className="text-4xl mb-4" style={{ color: colors.text }}>
              {allSeenInCategory ? '✓' : (filteredOutByCategory || noCategoryMarkets) ? '📭' : '0'}
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {allSeenInCategory
                ? "You've seen all markets!"
                : noCategoryMarkets
                  ? 'No markets in this category right now'
                  : filteredOutByCategory
                    ? "You've seen all markets in these categories"
                    : 'No markets available'}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {allSeenInCategory
                ? 'Check back later for new prediction markets'
                : noCategoryMarkets
                  ? 'Check back soon!'
                  : filteredOutByCategory
                    ? 'Try selecting more categories above'
                    : 'Check back later for new prediction markets!'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const cardMaxHeight = 'calc(100dvh - 330px)';

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '80px',
        overflowX: 'hidden',
        overflowY: 'hidden',
        touchAction: 'pan-y',
        backgroundColor: colors.background,
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} colors={colors} />
      <LogoutButton />

      <div style={{ flexShrink: 0 }}>
        <Header />
        <div style={{ padding: '8px 16px 4px 16px' }}>
          <CategoryFilter
            selectedCategories={selectedCategories}
            onToggle={handleCategoryToggle}
            availableCategories={availableCategories}
          />
        </div>
        <div style={{ padding: '0 16px 8px 16px' }}>
          <Timer
            resetKey={currentIndex}
            onComplete={handleTimerComplete}
          />
        </div>
      </div>

      <div
        className="px-4"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: cardMaxHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="w-full max-w-md mx-auto"
          style={{
            flex: '1 1 auto',
            minHeight: '200px',
            maxHeight: '100%',
            position: 'relative',
          }}
        >
          {nextMarket && (
            <SwipeCard
              market={nextMarket}
              onSwipe={() => {}}
              isTop={false}
            />
          )}

          <AnimatePresence mode="wait">
            <SwipeCard
              key={currentMarket.id || currentMarket.ticker || currentIndex}
              market={currentMarket}
              onSwipe={handleSwipe}
              isTop={true}
              yesProfit={(currentMarket.yesProfit * betSize).toFixed(2)}
              noProfit={(currentMarket.noProfit * betSize).toFixed(2)}
            />
          </AnimatePresence>
        </div>
      </div>

      <div
        className="px-4 pt-2 pb-3"
        style={{
          flexShrink: 0,
          backgroundColor: colors.background,
        }}
      >
        <div
          className="text-center text-xs font-bold mb-2"
          style={{ color: colors.textMuted }}
        >
          <span className="opacity-50">&larr; NO</span>
          <span className="mx-2 opacity-50">|</span>
          <span className="opacity-50">SKIP &uarr;</span>
          <span className="mx-2 opacity-50">|</span>
          <span className="opacity-50">YES &rarr;</span>
        </div>

        <div className="flex gap-3 max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick('no')}
            className="flex-1 py-2.5 border-3 rounded-comic font-bold text-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            style={{
              backgroundColor: isDark ? '#4a2020' : '#fee2e2',
              borderColor: colors.border,
              boxShadow: `3px 3px 0 ${colors.border}`,
              color: isDark ? '#fca5a5' : '#dc2626',
            }}
          >
            NO +${(currentMarket.noProfit * betSize).toFixed(2)}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick('yes')}
            className="flex-1 py-2.5 border-3 rounded-comic font-bold text-sm active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            style={{
              backgroundColor: isDark ? '#1a3a20' : '#dcfce7',
              borderColor: colors.border,
              boxShadow: `3px 3px 0 ${colors.border}`,
              color: isDark ? '#86efac' : '#16a34a',
            }}
          >
            YES +${(currentMarket.yesProfit * betSize).toFixed(2)}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
