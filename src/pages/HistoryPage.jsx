import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryColors } from '../data/markets';
import { useTheme } from '../context/ThemeContext';
import LogoutButton from '../components/LogoutButton';
import { redeemWinnings } from '../services/dflow';
import { debug, logError } from '../utils/debug';

const HELIUS_API_KEY = 'fc70f382-f7ec-48d3-a615-9bacd782570e';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function fetchTotalSpent(walletAddress) {
  if (!walletAddress) return 0;

  try {
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=100`;
    const response = await fetch(url);
    const transactions = await response.json();

    if (!Array.isArray(transactions)) return 0;

    let totalSpent = 0;
    for (const tx of transactions) {
      const usdcOut = tx.tokenTransfers?.find(t =>
        t.fromUserAccount === walletAddress &&
        t.mint === USDC_MINT
      );
      if (!usdcOut) continue;
      const amount = usdcOut.tokenAmount || 0;
      if (amount >= 0.10 && amount <= 5.00) {
        totalSpent += amount;
      }
    }
    return totalSpent;
  } catch (error) {
    logError('[History] Error fetching spent:', error.message);
    return 0;
  }
}

function getCostBasis(tokenMint) {
  if (!tokenMint) return null;
  try {
    const costBasisData = JSON.parse(localStorage.getItem('instinkt_cost_basis') || '{}');
    return costBasisData[tokenMint] || null;
  } catch (e) {
    return null;
  }
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

const CATEGORIES = ['All', 'Crypto', 'Sports', 'Politics', 'Weather', 'Stocks', 'Commodities'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'most-tokens', label: 'Most tokens' },
  { value: 'least-tokens', label: 'Least tokens' },
];

function formatTimeRemaining(timestamp) {
  if (!timestamp) return 'Unknown';

  const now = Math.floor(Date.now() / 1000);
  const remaining = Math.max(0, timestamp - now);

  if (remaining === 0) return 'Resolving...';

  const minutes = Math.floor(remaining / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Resolves in ${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `Resolves in ${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `Resolves in ${minutes}m`;
  } else {
    return `Resolves in ${remaining}s`;
  }
}

function getMarketTime(market) {
  const is15Min = market.is15MinMarket || (market.id && market.id.includes('15M'));
  if (is15Min && market.closeTime) {
    return market.closeTime;
  }
  return market.expirationTime;
}

function OpenPositionCard({ bet, colors }) {
  const [timeDisplay, setTimeDisplay] = useState('');
  const isPendingResolution = bet.status === 'pending_resolution';
  const potentialPayout = bet.tokenCount || 0;
  const marketTime = getMarketTime(bet.market);

  useEffect(() => {
    const updateTime = () => {
      if (isPendingResolution) {
        setTimeDisplay('Awaiting result');
      } else {
        setTimeDisplay(formatTimeRemaining(marketTime));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [marketTime, isPendingResolution]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-comic p-4 mb-3 relative"
      style={{ backgroundColor: colors.paper, borderColor: colors.border }}
    >
      <span
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold border-2"
        style={{ backgroundColor: categoryColors[bet.market.category] || '#888', borderColor: colors.border }}
      >
        {bet.market.category}
      </span>

      <h3 className="font-bold text-lg mb-3 leading-tight pr-20" style={{ color: colors.text }}>
        {bet.market.title}
      </h3>

      <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: colors.backgroundSecondary }}>
        <div className="flex items-center gap-2">
          <span style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Bet:</span>
          <span
            className={`px-3 py-1 rounded-lg text-white font-bold text-sm border-2 ${
              bet.choice === 'yes' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ borderColor: colors.border }}
          >
            {bet.choice.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: isPendingResolution ? '#f59e0b' : colors.textMuted }}>
            {timeDisplay}
          </div>
          <span className="font-bold text-green-600 text-lg">
            To win: ${potentialPayout.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ClosedPositionCard({ bet, colors }) {
  const won = bet.status === 'won';
  const tokenCount = bet.tokenCount || 0;
  const costBasis = getCostBasis(bet.tokenMint);

  let pnlDisplay = null;
  if (won) {
    if (costBasis !== null) {
      const profit = tokenCount - costBasis;
      pnlDisplay = <span className="font-bold text-xl text-green-600">Won +${profit.toFixed(2)}</span>;
    } else {
      pnlDisplay = <span className="font-bold text-xl text-green-600">Won</span>;
    }
  } else {
    if (costBasis !== null) {
      pnlDisplay = <span className="font-bold text-xl text-red-600">Lost -${costBasis.toFixed(2)}</span>;
    } else {
      pnlDisplay = <span className="font-bold text-xl text-red-600">Lost</span>;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-comic p-4 mb-3 relative"
      style={{ backgroundColor: colors.paper, borderColor: colors.border }}
    >
      <span
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold border-2"
        style={{ backgroundColor: categoryColors[bet.market.category] || '#888', borderColor: colors.border }}
      >
        {bet.market.category}
      </span>

      <h3 className="font-bold text-lg mb-3 leading-tight pr-20" style={{ color: colors.text }}>
        {bet.market.title}
      </h3>

      <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: colors.backgroundSecondary }}>
        <div className="flex items-center gap-2">
          <span style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Bet:</span>
          <span
            className={`px-3 py-1 rounded-lg text-white font-bold text-sm border-2 ${
              bet.choice === 'yes' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ borderColor: colors.border }}
          >
            {bet.choice.toUpperCase()}
          </span>
        </div>
        {pnlDisplay}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle, colors }) {
  return (
    <div className="card-comic p-8 text-center" style={{ backgroundColor: colors.paper, borderColor: colors.border }}>
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>{title}</h2>
      <p style={{ color: colors.textSecondary }}>{subtitle}</p>
    </div>
  );
}

function FilterBar({ selectedCategory, setSelectedCategory, sortBy, setSortBy, colors }) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const getCategoryStyle = (category, isSelected) => {
    if (isSelected) {
      return { backgroundColor: colors.border, color: '#fff' };
    }
    if (category === 'All') {
      return { backgroundColor: colors.backgroundSecondary, color: colors.text };
    }
    return { backgroundColor: categoryColors[category] || colors.backgroundSecondary, color: '#222' };
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const style = getCategoryStyle(category, isSelected);

          return (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-full font-bold text-sm border-2 whitespace-nowrap transition-all"
              style={{
                ...style,
                borderColor: colors.border,
                boxShadow: isSelected ? 'none' : `1px 1px 0 ${colors.border}`,
              }}
            >
              {category}
            </motion.button>
          );
        })}
      </div>

      <div className="relative">
        <motion.button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 border-2 rounded-xl font-bold text-sm flex items-center justify-between"
          style={{
            backgroundColor: colors.paper,
            borderColor: colors.border,
            color: colors.text,
            boxShadow: `1px 1px 0 ${colors.border}`,
          }}
        >
          <span>Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
          <svg
            className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showSortDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 border-2 rounded-xl overflow-hidden z-20"
              style={{
                backgroundColor: colors.paper,
                borderColor: colors.border,
                boxShadow: `3px 3px 0 ${colors.border}`,
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left font-bold text-sm transition-colors"
                  style={{
                    backgroundColor: sortBy === option.value ? colors.border : 'transparent',
                    color: sortBy === option.value ? '#fff' : colors.text,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function HistoryPage({ bets, isLoadingPositions, onRefresh, walletAddress, onRedeemWinnings }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('open');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoadingSpent, setIsLoadingSpent] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      setIsLoadingSpent(true);
      fetchTotalSpent(walletAddress)
        .then(spent => {
          setTotalSpent(spent);
          setIsLoadingSpent(false);
        })
        .catch(() => setIsLoadingSpent(false));
    }
  }, [walletAddress]);

  const handleRefresh = async () => {
    if (isRefreshing || isLoadingPositions) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRefreshing(false);
    }
  };

  const allBets = useMemo(() => bets, [bets]);

  const openPositions = useMemo(() => {
    const open = allBets.filter(bet => bet.status === 'pending' || bet.status === 'pending_resolution');
    debug('[History] Open positions:', open.length);
    return open;
  }, [allBets]);

  const closedPositions = useMemo(() => {
    const closed = allBets.filter(bet => bet.status === 'won' || bet.status === 'lost');
    debug('[History] Closed positions:', closed.length);
    return closed;
  }, [allBets]);

  const unredeemedWinnings = useMemo(() => {
    const wonPositions = closedPositions.filter(bet => bet.status === 'won' && bet.tokenCount > 0);
    const totalValue = wonPositions.reduce((sum, bet) => sum + (bet.tokenCount || 0), 0);
    debug('[History] Unredeemed winnings: $' + totalValue.toFixed(2));
    return { positions: wonPositions, totalValue };
  }, [closedPositions]);

  const handleRedeemAll = useCallback(async () => {
    if (isRedeeming || unredeemedWinnings.positions.length === 0) return;

    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    const results = { success: 0, failed: 0, total: unredeemedWinnings.positions.length };

    for (let i = 0; i < unredeemedWinnings.positions.length; i++) {
      const position = unredeemedWinnings.positions[i];
      try {
        const orderResponse = await redeemWinnings({
          tokenMint: position.tokenMint,
          amount: position.tokenCount,
          userPublicKey: walletAddress,
        });

        if (!orderResponse.transaction) {
          results.failed++;
          continue;
        }

        if (onRedeemWinnings) {
          const success = await onRedeemWinnings(orderResponse.transaction, position);
          if (success) {
            results.success++;
          } else {
            results.failed++;
          }
        } else {
          results.failed++;
        }

        if (i < unredeemedWinnings.positions.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        logError('[Redeem] Error:', err.message);
        results.failed++;
      }
    }

    setIsRedeeming(false);

    if (results.success > 0) {
      console.log('[Redeem] Redeemed', results.success, 'of', results.total, 'positions');
      setRedeemSuccess(`Redeemed ${results.success} of ${results.total} positions! Refreshing...`);
    }
    if (results.failed > 0) {
      setRedeemError(`${results.failed} uncertain - will verify on refresh`);
    }

    if (onRefresh) {
      await new Promise(r => setTimeout(r, 3000));
      await onRefresh();
      setTimeout(() => {
        setRedeemSuccess(null);
        setRedeemError(null);
      }, 2000);
    }
  }, [isRedeeming, unredeemedWinnings, walletAddress, onRedeemWinnings, onRefresh]);

  const filteredOpen = useMemo(() => {
    let filtered = openPositions;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(bet => bet.market.category === selectedCategory);
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'most-tokens': return (b.tokenCount || 0) - (a.tokenCount || 0);
        case 'least-tokens': return (a.tokenCount || 0) - (b.tokenCount || 0);
        default: return 0;
      }
    });
  }, [openPositions, selectedCategory, sortBy]);

  const filteredClosed = useMemo(() => {
    let filtered = closedPositions;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(bet => bet.market.category === selectedCategory);
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'most-tokens': return (b.tokenCount || 0) - (a.tokenCount || 0);
        case 'least-tokens': return (a.tokenCount || 0) - (b.tokenCount || 0);
        default: return 0;
      }
    });
  }, [closedPositions, selectedCategory, sortBy]);

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} colors={colors} />
      <LogoutButton />

      <header
        className="px-4 py-4 border-b-3"
        style={{ backgroundColor: colors.paper, borderColor: colors.border, minHeight: '56px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>My Positions</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: colors.paper,
              border: `2px solid ${colors.border}`,
              boxShadow: `1px 1px 0 ${colors.border}`,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              marginRight: '80px',
            }}
            title="Refresh positions"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.text}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => setActiveTab('open')}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border-3 transition-all"
            style={{
              backgroundColor: activeTab === 'open' ? colors.border : colors.paper,
              color: activeTab === 'open' ? '#fff' : colors.text,
              borderColor: colors.border,
              boxShadow: activeTab === 'open' ? 'none' : `2px 2px 0 ${colors.border}`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            Open
            {openPositions.length > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: activeTab === 'open' ? '#fff' : colors.border,
                  color: activeTab === 'open' ? colors.border : '#fff',
                }}
              >
                {openPositions.length}
              </span>
            )}
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('closed')}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border-3 transition-all"
            style={{
              backgroundColor: activeTab === 'closed' ? colors.border : colors.paper,
              color: activeTab === 'closed' ? '#fff' : colors.text,
              borderColor: colors.border,
              boxShadow: activeTab === 'closed' ? 'none' : `2px 2px 0 ${colors.border}`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            Closed
            {closedPositions.length > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: activeTab === 'closed' ? '#fff' : colors.border,
                  color: activeTab === 'closed' ? colors.border : '#fff',
                }}
              >
                {closedPositions.length}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'open' ? (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                colors={colors}
              />

              {openPositions.length === 0 ? (
                <EmptyState icon="📊" title="No open positions" subtitle="Start betting to see your positions here!" colors={colors} />
              ) : filteredOpen.length === 0 ? (
                <EmptyState icon="🔍" title="No matching positions" subtitle="Try changing your filters" colors={colors} />
              ) : (
                <>
                  <div className="card-comic p-4 mb-4 border-3" style={{ backgroundColor: colors.paper, borderColor: colors.border }}>
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>{filteredOpen.length}</div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Positions</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>
                          {isLoadingSpent ? '...' : `$${totalSpent.toFixed(2)}`}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Spent</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${filteredOpen.reduce((sum, b) => sum + (b.tokenCount || 0), 0).toFixed(2)}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>To Win</div>
                      </div>
                    </div>
                  </div>

                  {filteredOpen.map((bet) => (
                    <OpenPositionCard key={`${bet.market.id}-${bet.choice}-${bet.timestamp}`} bet={bet} colors={colors} />
                  ))}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                colors={colors}
              />

              {closedPositions.length === 0 ? (
                <EmptyState icon="📜" title="No resolved trades yet" subtitle="Winning and losing bets will appear here once markets resolve." colors={colors} />
              ) : filteredClosed.length === 0 ? (
                <EmptyState icon="🔍" title="No matching positions" subtitle="Try changing your filters" colors={colors} />
              ) : (
                <>
                  <div className="card-comic p-4 mb-4 border-3" style={{ backgroundColor: colors.paper, borderColor: colors.border }}>
                    <div className="flex justify-around text-center">
                      <div>
                        {(() => {
                          let netPnL = 0;
                          let hasAnyCost = false;

                          filteredClosed.forEach(b => {
                            const cost = getCostBasis(b.tokenMint);
                            if (cost !== null) {
                              hasAnyCost = true;
                              if (b.status === 'won') {
                                netPnL += (b.tokenCount || 0) - cost;
                              } else {
                                netPnL -= cost;
                              }
                            }
                          });

                          const isPositive = netPnL >= 0;
                          return (
                            <>
                              <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {hasAnyCost ? `${isPositive ? '+' : '-'}$${Math.abs(netPnL).toFixed(2)}` : '—'}
                              </div>
                              <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Net P&L</div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>{filteredClosed.length}</div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Bets</div>
                      </div>
                    </div>
                  </div>

                  {/* Redeem Winnings Banner */}
                  {unredeemedWinnings.totalValue > 0 && (
                    <div
                      className="card-comic p-4 mb-4 border-3"
                      style={{ backgroundColor: '#ecfdf5', borderColor: '#059669' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-green-700">
                            ${unredeemedWinnings.totalValue.toFixed(2)} Unredeemed
                          </div>
                          <div className="text-xs text-green-600">
                            {unredeemedWinnings.positions.length} winning position{unredeemedWinnings.positions.length !== 1 ? 's' : ''} ready to redeem
                          </div>
                        </div>
                        <motion.button
                          onClick={handleRedeemAll}
                          disabled={isRedeeming}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-xl font-bold text-white border-2"
                          style={{
                            backgroundColor: isRedeeming ? '#9ca3af' : '#059669',
                            borderColor: '#047857',
                            boxShadow: isRedeeming ? 'none' : '2px 2px 0 #047857',
                            cursor: isRedeeming ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isRedeeming ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Redeeming...
                            </span>
                          ) : (
                            'Redeem All'
                          )}
                        </motion.button>
                      </div>
                      {redeemSuccess && <div className="mt-2 text-sm text-green-700 font-medium">{redeemSuccess}</div>}
                      {redeemError && <div className="mt-2 text-sm text-red-600 font-medium">{redeemError}</div>}
                    </div>
                  )}

                  {/* Position cards */}
                  {filteredClosed.map((bet) => (
                    <ClosedPositionCard key={`${bet.market.id}-${bet.choice}-${bet.timestamp}`} bet={bet} colors={colors} />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
