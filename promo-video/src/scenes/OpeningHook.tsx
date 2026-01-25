import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { fonts } from '../styles';

export const OpeningHook: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene timing (at 30fps):
  // 0-60: "are you still mid-curving..." (2 sec)
  // 60-120: "when was the last time you used your gut....." (2 sec)
  // 120-180: "when was the last time you used your....." then blank (2 sec)

  // Text 1
  const text1Opacity = interpolate(frame, [0, 10, 50, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text1Scale = interpolate(frame, [0, 15], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Text 2
  const text2Opacity = interpolate(frame, [60, 70, 110, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text2Scale = interpolate(frame, [60, 75], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Text 3
  const text3Opacity = interpolate(frame, [120, 130, 160, 165], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text3Scale = interpolate(frame, [120, 135], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // Glitch effect for text 3
  const glitchOffset = frame > 155 && frame < 165 ? Math.sin(frame * 5) * 8 : 0;
  const glitchColor = frame > 155 && frame < 165 && frame % 3 === 0;

  // Screen goes completely black at the end
  const blackScreenOpacity = interpolate(frame, [165, 170, 180], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Clean white text style - bold and large
  const textStyle: React.CSSProperties = {
    fontFamily: fonts.primary,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-2px',
    lineHeight: 1.15,
    textAlign: 'center' as const,
  };

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
        padding: 40,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >

      {/* Text 1 */}
      <div
        style={{
          opacity: text1Opacity,
          transform: `scale(${text1Scale})`,
          position: 'absolute',
          padding: '0 30px',
        }}
      >
        <p style={{ ...textStyle, fontSize: 72, margin: 0 }}>
          are you still
        </p>
        <p style={{ ...textStyle, fontSize: 80, margin: '10px 0' }}>
          mid-curving
        </p>
        <p style={{ ...textStyle, fontSize: 72, margin: 0 }}>
          your prediction
        </p>
        <p style={{ ...textStyle, fontSize: 72, margin: 0 }}>
          market bets,
        </p>
        <p style={{ ...textStyle, fontSize: 80, margin: '10px 0' }}>
          anon?
        </p>
      </div>

      {/* Text 2 */}
      <div
        style={{
          opacity: text2Opacity,
          transform: `scale(${text2Scale})`,
          position: 'absolute',
          padding: '0 30px',
        }}
      >
        <p style={{ ...textStyle, fontSize: 68, margin: 0 }}>
          when was the
        </p>
        <p style={{ ...textStyle, fontSize: 68, margin: 0 }}>
          last time you
        </p>
        <p style={{ ...textStyle, fontSize: 68, margin: 0 }}>
          used your
        </p>
        <p style={{ ...textStyle, fontSize: 90, margin: '15px 0' }}>
          gut.....
        </p>
      </div>

      {/* Text 3 */}
      <div
        style={{
          opacity: text3Opacity,
          transform: `scale(${text3Scale}) translateX(${glitchOffset}px)`,
          position: 'absolute',
          padding: '0 30px',
        }}
      >
        <p style={{ ...textStyle, fontSize: 68, margin: 0, opacity: glitchColor ? 0.5 : 1 }}>
          when was the
        </p>
        <p style={{ ...textStyle, fontSize: 68, margin: 0, opacity: glitchColor ? 0.5 : 1 }}>
          last time you
        </p>
        <p style={{ ...textStyle, fontSize: 68, margin: 0, opacity: glitchColor ? 0.5 : 1 }}>
          used your.....
        </p>
      </div>

      {/* Black screen overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          opacity: blackScreenOpacity,
        }}
      />
    </div>
  );
};
