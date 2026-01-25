import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { colors, fonts } from '../styles';

// Comic book text style helper
const comicText = (size: number, color: string = '#fff'): React.CSSProperties => ({
  fontFamily: fonts.primary,
  fontSize: size,
  fontWeight: 'bold',
  color,
  textShadow: `
    3px 3px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000
  `,
  WebkitTextStroke: '1px #000',
  letterSpacing: '-1px',
  margin: 0,
  textAlign: 'center' as const,
});

// Sample market images
const BITCOIN_IMAGE = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600&fit=crop';
const SPORTS_IMAGE = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop';

// Feature 1: Sign up with email
const SignUpFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Typing animation for email
  const email = "anon@gmail.com";
  const typedChars = Math.min(Math.floor(frame / 2), email.length);
  const displayEmail = email.substring(0, typedChars);

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
      }}
    >
      {/* Feature text - LARGER */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <p style={comicText(56)}>Sign up with</p>
        <p style={comicText(64, colors.yes)}>EMAIL</p>
        <p style={{ ...comicText(36), marginTop: 15, color: '#888' }}>No KYC. No hassle.</p>
      </div>

      {/* Phone mockup - MUCH LARGER scale */}
      <div
        style={{
          transform: `scale(${phoneScale})`,
          marginTop: 100,
        }}
      >
        <PhoneFrame scale={1.15}>
          {/* Sign in screen */}
          <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginTop: 50, marginBottom: 50 }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: colors.paper,
                  border: `4px solid ${colors.border}`,
                  borderRadius: 20,
                  padding: '16px 32px',
                  boxShadow: `4px 4px 0 ${colors.border}`,
                }}
              >
                <span style={{ fontSize: 36, fontWeight: 'bold', color: colors.text }}>Instinkt</span>
              </div>
            </div>

            {/* Email input */}
            <div
              style={{
                backgroundColor: colors.paper,
                border: `4px solid ${colors.border}`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 6 }}>Email</div>
              <div style={{ fontSize: 22, color: colors.text, fontWeight: 'bold' }}>
                {displayEmail}
                <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
              </div>
            </div>

            {/* Continue button */}
            <div
              style={{
                backgroundColor: colors.yes,
                border: `4px solid ${colors.border}`,
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
                boxShadow: `4px 4px 0 ${colors.border}`,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>Continue</span>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
};

// Feature 2: Non-custodial wallets
const WalletFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, stiffness: 150 },
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
      }}
    >
      {/* Feature text - LARGER */}
      <div
        style={{
          textAlign: 'center',
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <p style={comicText(52)}>Non-custodial</p>
        <p style={comicText(64, colors.yes)}>WALLETS</p>
      </div>

      {/* Lock icon - LARGER */}
      <div
        style={{
          marginTop: 50,
          transform: `scale(${Math.max(0, lockScale)})`,
          fontSize: 180,
        }}
      >
        🔐
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 40,
          opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [20, 30], [30, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: colors.paper,
            border: `4px solid ${colors.border}`,
            borderRadius: 16,
            padding: '16px 32px',
            boxShadow: `4px 4px 0 ${colors.border}`,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>
            Your keys. Your crypto.
          </span>
        </div>
      </div>
    </div>
  );
};

// Feature 3: Swipe to bet
const SwipeFeature: React.FC = () => {
  const frame = useCurrentFrame();

  // Swipe animation phases
  const swipePhase = Math.floor(frame / 35) % 3;
  const phaseFrame = frame % 35;

  let cardRotation = 0;
  let cardX = 0;
  let showYes = false;
  let showNo = false;

  if (swipePhase === 1) {
    cardX = interpolate(phaseFrame, [5, 30], [0, 250], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    cardRotation = interpolate(phaseFrame, [5, 30], [0, 25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    showYes = phaseFrame > 12;
  } else if (swipePhase === 2) {
    cardX = interpolate(phaseFrame, [5, 30], [0, -250], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    cardRotation = interpolate(phaseFrame, [5, 30], [0, -25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    showNo = phaseFrame > 12;
  }

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
      }}
    >
      {/* Feature text - LARGER */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <p style={comicText(64)}>Swipe to</p>
        <p style={comicText(80, colors.yes)}>BET</p>
      </div>

      {/* Phone with swipe card - MUCH LARGER */}
      <div style={{ marginTop: 60 }}>
        <PhoneFrame scale={1.15}>
          <div style={{ padding: 20, position: 'relative', height: '100%' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 'bold', color: colors.text }}>Instinkt</span>
              <div
                style={{
                  backgroundColor: colors.yes,
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 24,
                  fontSize: 18,
                  fontWeight: 'bold',
                  border: `3px solid ${colors.border}`,
                }}
              >
                $25.00
              </div>
            </div>

            {/* Swipe card - MUCH LARGER */}
            <div style={{ position: 'relative', height: 520 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  border: `4px solid ${colors.border}`,
                  boxShadow: `5px 5px 0 ${colors.border}`,
                  overflow: 'hidden',
                  transform: `translateX(${cardX}px) rotate(${cardRotation}deg)`,
                }}
              >
                {/* Card background image */}
                <img
                  src={BITCOIN_IMAGE}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Category badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: colors.categories.Crypto,
                    border: `3px solid ${colors.border}`,
                    borderRadius: 24,
                    padding: '6px 16px',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  Crypto
                </div>

                {/* Time badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: `3px solid ${colors.border}`,
                    borderRadius: 24,
                    padding: '6px 16px',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  ⏱ 5d 12h
                </div>

                {/* Title */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderTop: `4px solid ${colors.border}`,
                    padding: 16,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: colors.text }}>
                    Will Bitcoin hit $150K by March?
                  </p>
                </div>

                {/* YES stamp */}
                {showYes && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: colors.yes,
                        border: `8px solid ${colors.yes}`,
                        borderRadius: 16,
                        padding: '12px 32px',
                        transform: 'rotate(-12deg)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                      }}
                    >
                      YES
                    </div>
                  </div>
                )}

                {/* NO stamp */}
                {showNo && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: colors.no,
                        border: `8px solid ${colors.no}`,
                        borderRadius: 16,
                        padding: '12px 32px',
                        transform: 'rotate(12deg)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                      }}
                    >
                      NO
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Swipe hints - LARGER */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 25,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 36 }}>👈</span>
                <div style={{ fontSize: 20, color: colors.no, fontWeight: 'bold' }}>NO</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 36 }}>👉</span>
                <div style={{ fontSize: 20, color: colors.yes, fontWeight: 'bold' }}>YES</div>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
};

// Feature 4: Countdown timer
const CountdownFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const countdownValue = Math.max(0, 30 - Math.floor(frame * 1.2));
  const exploded = countdownValue === 0 && frame > 25;
  const explosionScale = exploded ? spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 100 },
  }) : 0;

  const shake = countdownValue < 10 && countdownValue > 0
    ? Math.sin(frame * 20) * (10 - countdownValue) * 0.8
    : 0;

  const timerColor = countdownValue > 20 ? '#fff' : countdownValue > 10 ? '#FFA500' : colors.no;

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
        position: 'relative',
      }}
    >
      {/* Feature text - LARGER */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          textAlign: 'center',
          padding: '0 30px',
        }}
      >
        <p style={comicText(52)}>Only 30 seconds</p>
        <p style={comicText(52)}>to decide</p>
        <p style={{ ...comicText(44, colors.no), marginTop: 20 }}>
          before market disappears
        </p>
      </div>

      {/* Countdown display - LARGER */}
      {!exploded ? (
        <div
          style={{
            transform: `translateX(${shake}px)`,
            marginTop: 80,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: `6px solid ${timerColor}`,
              borderRadius: 24,
              padding: '40px 80px',
              boxShadow: `0 0 50px ${timerColor}`,
            }}
          >
            <span
              style={{
                fontSize: 160,
                fontWeight: 'bold',
                color: timerColor,
                fontFamily: 'monospace',
                textShadow: `0 0 30px ${timerColor}`,
              }}
            >
              {countdownValue.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ transform: `scale(${explosionScale})`, marginTop: 80 }}>
          <span style={{ fontSize: 200 }}>💥</span>
        </div>
      )}
    </div>
  );
};

// Feature 5: Get paid
const GetPaidFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numCoins = Math.min(Math.floor(frame / 2.5), 12);

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
        position: 'relative',
      }}
    >
      {/* Feature text - LARGER */}
      <div
        style={{
          textAlign: 'center',
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <p style={comicText(60)}>Get paid to</p>
        <p style={comicText(60)}>listen to your</p>
        <p style={comicText(80, colors.yes)}>GUT</p>
      </div>

      {/* Coins stack - LARGER */}
      <div
        style={{
          marginTop: 50,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          maxWidth: 500,
        }}
      >
        {Array.from({ length: numCoins }).map((_, i) => (
          <div
            key={i}
            style={{
              fontSize: 80,
              transform: `translateY(${Math.sin((frame - i * 2) * 0.3) * 8}px)`,
            }}
          >
            🪙
          </div>
        ))}
      </div>

      {/* Money bag - LARGER */}
      <div
        style={{
          marginTop: 30,
          fontSize: 120,
          opacity: interpolate(frame, [30, 40], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `scale(${spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 100 } })})`,
        }}
      >
        💰
      </div>
    </div>
  );
};

// Feature 6: Monetize tagline
const MonetizeFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const glowIntensity = Math.sin(frame * 0.2) * 0.3 + 0.7;

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
      }}
    >
      <div
        style={{
          transform: `scale(${textScale})`,
          textAlign: 'center',
        }}
      >
        <p style={comicText(56)}>Monetize your</p>
        <p style={comicText(72, '#FFD700')}>INSTINCT</p>
        <p style={{ ...comicText(56), marginTop: 30 }}>on</p>
        <p
          style={{
            ...comicText(80, colors.yes),
            marginTop: 10,
            textShadow: `
              3px 3px 0 #000,
              0 0 ${50 * glowIntensity}px ${colors.yes}
            `,
          }}
        >
          Instinkt
        </p>
      </div>
    </div>
  );
};

// Main export combining all features
export const MainPromo: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={45}>
        <SignUpFeature />
      </Sequence>
      <Sequence from={45} durationInFrames={40}>
        <WalletFeature />
      </Sequence>
      <Sequence from={85} durationInFrames={105}>
        <SwipeFeature />
      </Sequence>
      <Sequence from={190} durationInFrames={50}>
        <CountdownFeature />
      </Sequence>
      <Sequence from={240} durationInFrames={45}>
        <GetPaidFeature />
      </Sequence>
      <Sequence from={285} durationInFrames={45}>
        <MonetizeFeature />
      </Sequence>
    </>
  );
};
