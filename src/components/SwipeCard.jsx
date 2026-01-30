import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { categoryColors } from '../data/markets';
import { useTheme } from '../context/ThemeContext';
import { playSwipeSound, unlockAudio } from '../utils/sounds';

// Global flag to track if we've set up touch listener
let touchListenerAdded = false;

function formatTimeUntil(expirationTime) {
  if (!expirationTime) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  const diffSec = expirationTime - nowSec;
  if (diffSec <= 0) return 'Expired';
  const mins = Math.floor(diffSec / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  if (days < 7) return `${days}d ${hours % 24}h`;
  return `${days}d`;
}

export default function SwipeCard({ market, onSwipe, isTop, yesProfit, noProfit }) {
  const [imageError, setImageError] = useState(false);
  const { colors, isDark } = useTheme();

  // Set up early audio unlock on any touch/click
  useEffect(() => {
    if (touchListenerAdded) return;

    const handleFirstInteraction = () => {
      console.log('[SwipeCard] First interaction detected, unlocking audio...');
      unlockAudio();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('mousedown', handleFirstInteraction);
    };

    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('mousedown', handleFirstInteraction, { once: true });
    touchListenerAdded = true;

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('mousedown', handleFirstInteraction);
    };
  }, []);

  // Framer motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Derived transforms
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const yesOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const noOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const skipOpacity = useTransform(y, [-150, -75, 0], [1, 0.5, 0]);

  const fallbackBg = categoryColors[market.category] || '#6B7280';

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 card-comic overflow-hidden scale-95 opacity-60"
        style={{ backgroundColor: fallbackBg, borderColor: colors.border }}
      >
        {market.image && (
          <img src={market.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
      </div>
    );
  }

  // Unlock audio on first touch (iOS requirement)
  const handleDragStart = () => {
    unlockAudio();
  };

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    const yThreshold = 80;

    console.log('[SwipeCard] handleDragEnd - offset:', info.offset.x, info.offset.y);

    // Check if vertical movement is dominant (for skip) - prioritize this
    const isVerticalDominant = Math.abs(info.offset.y) > Math.abs(info.offset.x) * 0.7;

    if (isVerticalDominant && info.offset.y < -yThreshold) {
      // Swipe up - SKIP (prioritize when vertical movement is dominant)
      playSwipeSound();
      animate(y, -500, { duration: 0.3 });
      animate(x, 0, { duration: 0.3 });
      setTimeout(() => {
        console.log('[SwipeCard] Calling onSwipe(skip)');
        onSwipe('skip');
      }, 300);
    } else if (info.offset.x > threshold) {
      // Swipe right - YES
      playSwipeSound();
      animate(x, 500, { duration: 0.3 });
      setTimeout(() => {
        console.log('[SwipeCard] Calling onSwipe(yes)');
        onSwipe('yes');
      }, 300);
    } else if (info.offset.x < -threshold) {
      // Swipe left - NO
      playSwipeSound();
      animate(x, -500, { duration: 0.3 });
      setTimeout(() => {
        console.log('[SwipeCard] Calling onSwipe(no)');
        onSwipe('no');
      }, 300);
    } else {
      // Snap back to center
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* YES profit preview */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: useTransform(x, [0, 50, 150], [0, 0.3, 1]) }}
      >
        <div className="text-center px-3 py-2 rounded-xl border-2 border-comic-border" style={{ backgroundColor: '#D1FAE5' }}>
          <div className="text-base font-bold" style={{ color: '#059669' }}>YES</div>
          <div className="text-sm font-bold" style={{ color: '#059669' }}>+${yesProfit}</div>
        </div>
      </motion.div>

      {/* NO profit preview */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: useTransform(x, [-150, -50, 0], [1, 0.3, 0]) }}
      >
        <div className="text-center px-3 py-2 rounded-xl border-2 border-comic-border" style={{ backgroundColor: '#FEE2E2' }}>
          <div className="text-base font-bold" style={{ color: '#DC2626' }}>NO</div>
          <div className="text-sm font-bold" style={{ color: '#DC2626' }}>+${noProfit}</div>
        </div>
      </motion.div>

      {/* The draggable card */}
      <motion.div
        className="absolute inset-0 card-comic overflow-hidden cursor-grab active:cursor-grabbing z-10"
        style={{
          x,
          y,
          rotate,
          backgroundColor: fallbackBg,
          borderColor: colors.border,
          touchAction: 'none'
        }}
        drag
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        {market.image && !imageError && (
          <img
            src={market.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
            onError={() => setImageError(true)}
          />
        )}

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="px-2 py-0.5 rounded-full border-2 font-bold text-xs" style={{ backgroundColor: categoryColors[market.category] || '#888', borderColor: colors.border }}>
            {market.category}
          </div>
          {market.expirationTime && (
            <div className="px-2 py-0.5 rounded-full border-2 font-bold text-xs" style={{ backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderColor: colors.border, color: colors.text }}>
              ⏱ {formatTimeUntil(market.expirationTime)}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm border-t-3 p-3 pointer-events-none" style={{ backgroundColor: isDark ? 'rgba(42, 42, 42, 0.85)' : 'rgba(255, 255, 255, 0.75)', borderColor: colors.border }}>
          <h2 className="text-lg font-bold leading-tight" style={{ color: colors.text }}>{market.title}</h2>
        </div>

        {/* YES stamp */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: yesOpacity }}>
          <div className="text-4xl font-bold text-green-500 border-4 border-green-500 rounded-xl px-5 py-2 -rotate-12" style={{ backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.8)' }}>YES</div>
        </motion.div>

        {/* NO stamp */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: noOpacity }}>
          <div className="text-4xl font-bold text-red-500 border-4 border-red-500 rounded-xl px-5 py-2 rotate-12" style={{ backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.8)' }}>NO</div>
        </motion.div>

        {/* SKIP stamp */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: skipOpacity }}>
          <div className="text-3xl font-bold text-blue-500 border-4 border-blue-500 rounded-xl px-5 py-2" style={{ backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.8)' }}>SKIP</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
