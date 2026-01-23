import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import SwipeCard from '../components/SwipeCard';
import Timer from '../components/Timer';
import Header from '../components/Header';
import { getMarketsForApp, placeBet } from '../services/dflow';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e';

// Theme toggle button component
function ThemeToggleButton({ isDark, onToggle, colors }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'absolute',
        top: '16px',
        right: '64px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: colors.paper,
        border: `3px solid ${colors.border}`,
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
        // Sun icon for dark mode (click to go light)
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        // Moon icon for light mode (click to go dark)
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// Logout button component
function LogoutButton({ onLogout, colors }) {
  return (
    <button
      onClick={onLogout}
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: colors.paper,
        border: `3px solid ${colors.border}`,
        boxShadow: `2px 2px 0 ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      title="Logout"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.text}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}

export default function BettingPage({ onPlaceBet, betSize, balance, goToWallet }) {
  const { handleLogOut, primaryWallet } = useDynamicContext();
  const { isDark, toggleTheme, colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { success, warning, error } = useToast();

  // Get wallet from Dynamic
  const walletAddress = primaryWallet?.address || null;

  // Debug logging
  console.log('[BettingPage] primaryWallet object:', primaryWallet);
  console.log('[BettingPage] Wallet address for betting:', walletAddress);

  // Fetch markets from API on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getMarketsForApp({ limit: 100 });
        if (isMounted) {
          console.log('[BettingPage] Loaded markets:', data.length);
          console.log('[BettingPage] First 5 markets IDs:', data.slice(0, 5).map(m => ({ id: m.id, ticker: m.ticker, title: m.title?.substring(0, 30) })));
          setMarkets(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load markets:', err);
        if (isMounted) {
          setLoadError(err.message);
          setIsLoading(false);
        }
      }
    }

    loadMarkets();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentMarket = markets.length > 0 ? markets[currentIndex % markets.length] : null;
  const nextMarket = markets.length > 1 ? markets[(currentIndex + 1) % markets.length] : null;

  const handleSwipe = useCallback(async (dir) => {
    console.log('[BettingPage] handleSwipe called with direction:', dir);

    if (!currentMarket) {
      console.log('[BettingPage] No current market, returning');
      return;
    }
    if (isPlacingBet) {
      console.log('[BettingPage] Already placing bet, returning');
      return;
    }

    // Handle skip - just move to next card
    if (dir === 'skip') {
      console.log('[BettingPage] SKIP - advancing to next card');
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Handle YES/NO bets
    if (dir === 'yes' || dir === 'no') {
      // Check for insufficient funds
      if (balance < betSize) {
        error('Not enough balance', {
          button: 'Top up',
          onButtonClick: goToWallet,
        });
        // Still advance to next card
        console.log('[BettingPage] Insufficient funds - advancing anyway');
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      // Check for wallet
      if (!walletAddress) {
        error('Wallet not connected');
        console.error('[BettingPage] No wallet address found');
        // Still advance to next card
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      setIsPlacingBet(true);

      try {
        // Call DFlow Trade API to get order transaction
        console.log('[BettingPage] Placing bet via DFlow API...');
        const orderResponse = await placeBet({
          market: currentMarket,
          side: dir,
          amount: betSize,
          userPublicKey: walletAddress,
        });

        console.log('[BettingPage] Order response:', orderResponse);

        if (!orderResponse.transaction) {
          warning('Order created but no transaction returned', { duration: 3000 });
          setIsPlacingBet(false);
          setCurrentIndex((prev) => prev + 1);
          return;
        }

        // Sign and submit the transaction using Dynamic wallet
        console.log('[BettingPage] Signing transaction...');
        console.log('[BettingPage] primaryWallet:', primaryWallet);

        if (!primaryWallet) {
          error('Wallet not found');
          setIsPlacingBet(false);
          setCurrentIndex((prev) => prev + 1);
          return;
        }

        // Decode the base64 transaction
        const txBytes = Buffer.from(orderResponse.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBytes);
        console.log('[BettingPage] Transaction deserialized');

        // Sign with Dynamic wallet - check if it's a Solana wallet first
        if (!isSolanaWallet(primaryWallet)) {
          throw new Error('Not a Solana wallet');
        }

        const signer = await primaryWallet.getSigner();
        const signedTx = await signer.signTransaction(transaction);
        console.log('[BettingPage] Transaction signed');

        // Submit using our Helius connection
        const connection = new Connection(SOLANA_RPC, 'confirmed');
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        console.log('[BettingPage] Transaction submitted:', signature);

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        console.log('[BettingPage] Transaction confirmed!');
        success(`Bet placed! ${signature.slice(0, 8)}...`, { duration: 5000 });

        // Track bet locally
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

        setIsPlacingBet(false);
        setCurrentIndex((prev) => prev + 1);

      } catch (err) {
        console.error('[BettingPage] Failed to place bet:', err);
        error(`Bet failed: ${err.message}`, { duration: 4000 });
        setIsPlacingBet(false);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  }, [currentMarket, betSize, onPlaceBet, balance, error, success, warning, goToWallet, walletAddress, isPlacingBet, primaryWallet]);

  const handleTimerComplete = useCallback(() => {
    // Show expired toast
    warning('Too slow!', { duration: 3000 });
    // Skip to next card when timer runs out
    setCurrentIndex((prev) => prev + 1);
  }, [warning]);

  const handleButtonClick = (choice) => {
    handleSwipe(choice);
  };

  // Loading state
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

  // Error state
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

  // No markets available
  if (!currentMarket) {
    return (
      <div className="flex flex-col h-full pb-20">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="card-comic p-8 text-center max-w-sm"
            style={{ backgroundColor: colors.paper, borderColor: colors.border }}
          >
            <div className="text-4xl mb-4" style={{ color: colors.text }}>0</div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>No markets available</p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Check back later for new prediction markets!</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('[BettingPage] Current market for card:', {
    index: currentIndex,
    id: currentMarket?.id,
    ticker: currentMarket?.ticker,
    title: currentMarket?.title?.substring(0, 30),
    keyUsed: currentMarket?.id || currentMarket?.ticker || currentIndex
  });

  return (
    <div className="flex flex-col h-full pb-20" style={{ position: 'relative', overflowX: 'hidden', touchAction: 'pan-y' }}>
      <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} colors={colors} />
      <LogoutButton onLogout={() => handleLogOut()} colors={colors} />
      <Header />

      {/* Timer Section */}
      <div className="flex justify-center py-4">
        <div
          className="card-comic p-3"
          style={{ backgroundColor: colors.paper, borderColor: colors.border }}
        >
          <Timer
            resetKey={currentIndex}
            onComplete={handleTimerComplete}
          />
        </div>
      </div>

      {/* Card Stack Section - fixed height for absolute positioning */}
      <div className="flex-1 px-4" style={{ minHeight: '340px', overflow: 'hidden' }}>
        <div className="relative h-full w-full max-w-md mx-auto" style={{ height: '100%', minHeight: '320px', overflow: 'hidden' }}>
          {/* Background card */}
          {nextMarket && (
            <SwipeCard
              market={nextMarket}
              onSwipe={() => {}}
              isTop={false}
            />
          )}

          {/* Top card */}
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

      {/* Bet Buttons */}
      <div className="px-4 py-4">
        <div className="flex gap-4 max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick('no')}
            className="flex-1 py-4 border-3 rounded-comic font-bold text-lg active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
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
            className="flex-1 py-4 border-3 rounded-comic font-bold text-lg active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
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

        {/* Swipe hints */}
        <div className="text-center mt-3 text-sm font-bold" style={{ color: colors.textMuted }}>
          <span className="opacity-60">&larr; NO</span>
          <span className="mx-4 opacity-60">|</span>
          <span className="opacity-60">SKIP &uarr;</span>
          <span className="mx-4 opacity-60">|</span>
          <span className="opacity-60">YES &rarr;</span>
        </div>
      </div>
    </div>
  );
}
