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

  // Calculate progress for circular indicator (clockwise from top)
  const progress = seconds / TIMER_SECONDS;
  const circumference = 2 * Math.PI * 36;
  // Offset increases as time decreases (ring depletes)
  const strokeDashoffset = circumference * (1 - progress);

  // Determine if in warning zone
  const isWarning = seconds <= 10;
  const isUrgent = seconds <= 5;

  // Breathing animation speed
  const pulseSpeed = isUrgent ? 0.3 : 0.6;

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG Circle Progress - rotated to start from top (12 o'clock), scaleX(-1) for clockwise */}
      <svg className="w-24 h-24" viewBox="0 0 80 80" style={{ transform: 'rotate(90deg) scaleX(-1)', transformOrigin: 'center' }}>
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke={isDark ? '#444' : '#D1D5DB'}
          strokeWidth="6"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke={isWarning ? '#EF4444' : colors.text}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>

      {/* Timer text - just the number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-3xl font-bold transition-colors duration-300"
          style={{
            color: isWarning ? '#EF4444' : colors.text,
            animation: isWarning ? `breathe ${pulseSpeed}s ease-in-out infinite` : 'none',
            textShadow: isWarning ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)' : 'none',
          }}
        >
          {seconds}
        </span>
      </div>

      {/* Inline keyframes for breathing animation */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
