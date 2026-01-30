import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryColors } from '../data/markets';
import { useTheme } from '../context/ThemeContext';
import LogoutButton from '../components/LogoutButton';

// Theme toggle button component (same as BettingPage)
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
  { value: 'highest-bet', label: 'Highest bet' },
  { value: 'lowest-bet', label: 'Lowest bet' },
  { value: 'highest-profit', label: 'Highest profit' },
];

function formatTimeRemaining(expirationTime) {
  // expirationTime is a Unix timestamp in seconds from DFlow
  if (!expirationTime) return 'Unknown';

  const now = Math.floor(Date.now() / 1000);
  const remaining = Math.max(0, expirationTime - now);

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

function OpenPositionCard({ bet, colors }) {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const updateTime = () => {
      // Use expirationTime from market (Unix timestamp in seconds)
      setTimeDisplay(formatTimeRemaining(bet.market.expirationTime));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute instead of every second
    return () => clearInterval(interval);
  }, [bet.market.expirationTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-comic p-4 mb-3 relative"
      style={{ backgroundColor: colors.paper, borderColor: colors.border }}
    >
      {/* Category badge - top right */}
      <span
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold border-2"
        style={{ backgroundColor: categoryColors[bet.market.category] || '#888', borderColor: colors.border }}
      >
        {bet.market.category}
      </span>

      {/* Title */}
      <h3 className="font-bold text-lg mb-3 leading-tight pr-20" style={{ color: colors.text }}>
        {bet.market.title}
      </h3>

      {/* Direction | Amount row */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`px-3 py-1 rounded-lg text-white font-bold text-sm border-2 ${
            bet.choice === 'yes' ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ borderColor: colors.border }}
        >
          {bet.choice.toUpperCase()}
        </span>
        <div>
          <span className="font-bold text-lg" style={{ color: colors.text }}>
            ${parseFloat(bet.amount).toFixed(2)}
          </span>
          {bet.tokenCount && (
            <span className="text-xs ml-2" style={{ color: colors.textMuted }}>
              ({bet.tokenCount} tokens)
            </span>
          )}
        </div>
      </div>

      {/* Time to resolution | Potential profit row */}
      <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: colors.backgroundSecondary }}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke={colors.textMuted} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold" style={{ color: colors.textSecondary }}>{timeDisplay}</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-green-600 text-lg">+${parseFloat(bet.profit).toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ClosedPositionCard({ bet, colors }) {
  const won = bet.status === 'won';
  const pnl = won ? `+$${bet.profit}` : `-$${bet.amount}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-comic p-4 mb-3 relative"
      style={{ backgroundColor: colors.paper, borderColor: colors.border }}
    >
      {/* Category badge - top right */}
      <span
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold border-2"
        style={{ backgroundColor: categoryColors[bet.market.category] || '#888', borderColor: colors.border }}
      >
        {bet.market.category}
      </span>

      {/* Title */}
      <h3 className="font-bold text-lg mb-3 leading-tight pr-20" style={{ color: colors.text }}>
        {bet.market.title}
      </h3>

      {/* Direction | Amount row */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`px-3 py-1 rounded-lg text-white font-bold text-sm border-2 ${
            bet.choice === 'yes' ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ borderColor: colors.border }}
        >
          {bet.choice.toUpperCase()}
        </span>
        <span className="font-bold text-lg" style={{ color: colors.text }}>
          ${bet.amount}
        </span>
      </div>

      {/* Outcome | PnL row */}
      <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: colors.backgroundSecondary }}>
        <span
          className={`px-3 py-1 rounded-lg font-bold text-sm border-2 ${
            won
              ? 'bg-green-100 text-green-700 border-green-500'
              : 'bg-red-100 text-red-700 border-red-500'
          }`}
        >
          {won ? 'WON' : 'LOST'}
        </span>
        <span className={`font-bold text-lg ${won ? 'text-green-600' : 'text-red-600'}`}>
          {pnl}
        </span>
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
      return {
        backgroundColor: colors.border,
        color: '#fff',
      };
    }
    // "All" gets theme-appropriate gray when unselected
    if (category === 'All') {
      return {
        backgroundColor: colors.backgroundSecondary,
        color: colors.text,
      };
    }
    // Other categories get their badge color
    return {
      backgroundColor: categoryColors[category] || colors.backgroundSecondary,
      color: '#222',
    };
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Category filter - horizontal scroll */}
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

      {/* Sort dropdown */}
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

export default function HistoryPage({ bets, isLoadingPositions, onRefresh }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('open');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug: Log bets received from parent
  console.log('[HistoryPage] ========================================');
  console.log('[HistoryPage] Bets received:', bets?.length || 0);
  console.log('[HistoryPage] isLoadingPositions:', isLoadingPositions);
  if (bets && bets.length > 0) {
    console.log('[HistoryPage] All bets summary:');
    bets.forEach((b, i) => {
      console.log(`[HistoryPage]   ${i}: ${b.market?.ticker || b.market?.title?.substring(0, 20)} | ${b.choice} | $${b.amount?.toFixed(2)} | mint: ${b.tokenMint?.substring(0, 8)}...`);
    });
    console.log('[HistoryPage] Total at risk (sum):', bets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0).toFixed(2));
  }

  // Refresh positions from on-chain
  const handleRefresh = async () => {
    if (isRefreshing || isLoadingPositions) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRefreshing(false);
    }
  };

  // Use real bets only
  const allBets = useMemo(() => {
    return bets;
  }, [bets]);

  // Separate bets into open (pending) and closed (won/lost)
  const openPositions = useMemo(() => {
    return allBets.filter(bet => bet.status === 'pending');
  }, [allBets]);

  const closedPositions = useMemo(() => {
    return allBets.filter(bet => bet.status === 'won' || bet.status === 'lost');
  }, [allBets]);

  // Filter and sort positions - memoized to react to filter/sort changes
  const filteredOpen = useMemo(() => {
    let filtered = openPositions;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(bet => bet.market.category === selectedCategory);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'highest-bet':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'lowest-bet':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'highest-profit':
          return parseFloat(b.profit) - parseFloat(a.profit);
        default:
          return 0;
      }
    });
  }, [openPositions, selectedCategory, sortBy]);

  const filteredClosed = useMemo(() => {
    let filtered = closedPositions;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(bet => bet.market.category === selectedCategory);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'highest-bet':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'lowest-bet':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'highest-profit':
          return parseFloat(b.profit) - parseFloat(a.profit);
        default:
          return 0;
      }
    });
  }, [closedPositions, selectedCategory, sortBy]);

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      {/* Theme toggle and logout buttons - positioned in header */}
      <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} colors={colors} />
      <LogoutButton />

      {/* Header */}
      <header
        className="px-4 py-4 border-b-3"
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.border,
          minHeight: '56px',
        }}
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
              marginRight: '80px', // Space for theme + logout buttons
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
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
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

      {/* Content */}
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
              {/* Filters */}
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                colors={colors}
              />

              {openPositions.length === 0 ? (
                <EmptyState
                  icon="📊"
                  title="No open positions"
                  subtitle="Start betting to see your positions here!"
                  colors={colors}
                />
              ) : filteredOpen.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No matching positions"
                  subtitle="Try changing your filters"
                  colors={colors}
                />
              ) : (
                <>
                  {/* Summary card */}
                  <div
                    className="card-comic p-4 mb-4 border-3"
                    style={{ backgroundColor: colors.paper, borderColor: colors.border }}
                  >
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>{filteredOpen.length}</div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Active</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>
                          ${filteredOpen.reduce((sum, b) => sum + parseFloat(b.amount), 0).toFixed(2)}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Value</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          +${filteredOpen.reduce((sum, b) => sum + parseFloat(b.profit), 0).toFixed(2)}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Potential</div>
                      </div>
                    </div>
                  </div>

                  {/* Position cards */}
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
              {/* Filters */}
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                colors={colors}
              />

              {closedPositions.length === 0 ? (
                <EmptyState
                  icon="📜"
                  title="No closed positions yet"
                  subtitle="Your resolved bets will appear here."
                  colors={colors}
                />
              ) : filteredClosed.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No matching positions"
                  subtitle="Try changing your filters"
                  colors={colors}
                />
              ) : (
                <>
                  {/* Summary card */}
                  <div
                    className="card-comic p-4 mb-4 border-3"
                    style={{ backgroundColor: colors.paper, borderColor: colors.border }}
                  >
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {filteredClosed.filter(b => b.status === 'won').length}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Won</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {filteredClosed.filter(b => b.status === 'lost').length}
                        </div>
                        <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Lost</div>
                      </div>
                      <div className="w-px" style={{ backgroundColor: colors.backgroundSecondary }} />
                      <div>
                        {(() => {
                          const totalPnl = filteredClosed.reduce((sum, b) => {
                            return sum + (b.status === 'won' ? parseFloat(b.profit) : -parseFloat(b.amount));
                          }, 0);
                          const isPositive = totalPnl >= 0;
                          return (
                            <>
                              <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}${totalPnl.toFixed(2)}
                              </div>
                              <div className="text-xs font-bold" style={{ color: colors.textMuted }}>Net PnL</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

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
