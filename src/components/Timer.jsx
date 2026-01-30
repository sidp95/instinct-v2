import { useState, useEffect, useRef } from 'react';
import { useAudioContext } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

const TIMER_SECONDS = 30;

// Create tick sound using Web Audio API
async function createTickSound(audioContext, isUrgent) {
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Higher pitch and louder in last 5 seconds
    oscillator.frequency.value = isUrgent ? 1200 : 800;
    oscillator.type = 'sine';

    const volume = isUrgent ? 0.15 : 0.08;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (e) {
    // Ignore audio errors
  }
}

export default function Timer({ onComplete, resetKey }) {
  const [seconds, setSeconds] = useState(TIMER_SECONDS);
  const audioContext = useAudioContext();
  const { colors, isDark } = useTheme();
  const hasCompletedRef = useRef(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset timer when resetKey changes (new card)
  useEffect(() => {
    setSeconds(TIMER_SECONDS);
    hasCompletedRef.current = false;
  }, [resetKey]);

  // Main timer effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        const newSeconds = prevSeconds - 1;

        // Play tick sound in last 10 seconds (but not at 0)
        if (newSeconds <= 10 && newSeconds > 0 && audioContext) {
          const isUrgent = newSeconds <= 5;
          createTickSound(audioContext, isUrgent);
        }

        // Timer completed
        if (newSeconds <= 0) {
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            // Call onComplete outside of setState to avoid issues
            setTimeout(() => onCompleteRef.current?.(), 0);
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }

        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [resetKey, audioContext]);

  // Calculate progress (0 to 1, where 1 is full)
  const progress = seconds / TIMER_SECONDS;

  // Determine if in warning zone
  const isWarning = seconds <= 10;
  const isUrgent = seconds <= 5;

  // Get bar color based on state
  const getBarColor = () => {
    if (isUrgent) return '#EF4444';
    if (isWarning) return '#F59E0B';
    return isDark ? '#22c55e' : '#16a34a';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
      }}
    >
      {/* Progress bar container */}
      <div
        style={{
          flex: 1,
          height: '6px',
          backgroundColor: isDark ? '#333' : '#e5e7eb',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar fill */}
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: getBarColor(),
            borderRadius: '3px',
            transition: 'width 1s linear, background-color 0.3s ease',
          }}
        />
      </div>

      {/* Seconds display */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: isWarning ? '#EF4444' : colors.textSecondary,
          minWidth: '28px',
          textAlign: 'right',
          animation: isUrgent ? 'pulse 0.5s ease-in-out infinite' : 'none',
        }}
      >
        {seconds}s
      </span>

      {/* Pulse animation for urgent state */}
      {isUrgent && (
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      )}
    </div>
  );
}
