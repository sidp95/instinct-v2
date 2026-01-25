import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { colors, fonts } from '../styles';

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline animation
  const taglineOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const taglineY = interpolate(frame, [25, 40], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Pulsing glow
  const glowPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Comic text style
  const comicText = (size: number, color: string = '#fff'): React.CSSProperties => ({
    fontFamily: fonts.primary,
    fontSize: size,
    fontWeight: 'bold',
    color,
    textShadow: `
      4px 4px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000
    `,
    WebkitTextStroke: '1px #000',
    margin: 0,
    textAlign: 'center' as const,
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.primary,
        padding: 40,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Subtle comic dots pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.2,
          pointerEvents: 'none',
        }}
      />

      {/* Logo - LARGER */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 50,
        }}
      >
        <div
          style={{
            backgroundColor: colors.paper,
            border: `6px solid ${colors.border}`,
            borderRadius: 32,
            padding: '40px 80px',
            boxShadow: `
              8px 8px 0 ${colors.border},
              0 0 ${60 * glowPulse}px rgba(34, 197, 94, 0.5)
            `,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 100,
              fontWeight: 'bold',
              color: colors.text,
              letterSpacing: '-3px',
            }}
          >
            Instinkt
          </h1>
        </div>
      </div>

      {/* Tagline - LARGER */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          textAlign: 'center',
        }}
      >
        <p style={comicText(48)}>Trust your gut.</p>
        <p style={{ ...comicText(56, colors.yes), marginTop: 15 }}>Get paid.</p>
      </div>
    </div>
  );
};
