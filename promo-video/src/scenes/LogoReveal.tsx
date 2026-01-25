import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fonts } from '../styles';

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Flash effect at the start
  const flashOpacity = interpolate(frame, [0, 5, 15], [1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // Logo scale - starts huge, then settles
  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: {
      damping: 8,
      stiffness: 80,
      mass: 0.5,
    },
  });

  const actualLogoScale = interpolate(
    Math.max(0, logoScale),
    [0, 1],
    [3.5, 1],
    { extrapolateRight: 'clamp' }
  );

  // Logo opacity
  const logoOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Shake effect
  const shakeX = frame < 25 ? Math.sin(frame * 8) * (25 - frame) * 0.6 : 0;
  const shakeY = frame < 25 ? Math.cos(frame * 10) * (25 - frame) * 0.4 : 0;

  // Pulsing glow effect
  const glowPulse = Math.sin(frame * 0.3) * 0.3 + 0.7;

  // Background color shift
  const bgHue = interpolate(frame, [0, 60], [0, 30], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.primary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial burst lines */}
      {frame > 5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 6,
                height: interpolate(frame, [5, 30], [0, 1200], { extrapolateRight: 'clamp' }),
                backgroundColor: `hsl(${bgHue + i * 15}, 70%, 50%)`,
                opacity: interpolate(frame, [5, 20, 45], [0.9, 0.6, 0], { extrapolateRight: 'clamp' }),
                transform: `rotate(${i * 15}deg)`,
                transformOrigin: 'center center',
              }}
            />
          ))}
        </div>
      )}

      {/* Main logo - MUCH LARGER */}
      <div
        style={{
          transform: `scale(${actualLogoScale}) translate(${shakeX}px, ${shakeY}px)`,
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: colors.paper,
            border: `8px solid ${colors.border}`,
            borderRadius: 40,
            padding: '50px 90px',
            boxShadow: `
              10px 10px 0 ${colors.border},
              0 0 ${80 * glowPulse}px rgba(34, 197, 94, 0.7),
              0 0 ${150 * glowPulse}px rgba(34, 197, 94, 0.4)
            `,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 120,
              fontWeight: 'bold',
              color: colors.text,
              letterSpacing: '-4px',
            }}
          >
            Instinkt
          </h1>
        </div>
      </div>

      {/* White flash overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#fff',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Particles/sparks effect */}
      {frame > 5 && frame < 50 && (
        <>
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const speed = 18 + (i % 5) * 6;
            const distance = (frame - 5) * speed;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const particleOpacity = interpolate(frame, [5, 50], [1, 0], { extrapolateRight: 'clamp' });

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? colors.yes : '#FFD700',
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: particleOpacity,
                  boxShadow: `0 0 15px ${i % 2 === 0 ? colors.yes : '#FFD700'}`,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
