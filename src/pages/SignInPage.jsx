import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTheme } from '../context/ThemeContext';

export default function SignInPage({ onAudioInit }) {
  const { setShowAuthFlow } = useDynamicContext();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      await ctx.resume();
      onAudioInit(ctx);
    } catch (e) {
      console.error('Audio init error:', e);
      onAudioInit(null);
    }
    setShowAuthFlow(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: colors.background,
        backgroundImage: `radial-gradient(${isDark ? '#444' : '#ccc'} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: `6px 6px 0 ${colors.border}`,
          border: `4px solid ${colors.border}`,
          padding: '8px',
        }}
      >
        <img
          src="/logo.png"
          alt="Instinkt"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: colors.text,
          margin: '0 0 8px 0',
          textAlign: 'center',
        }}
      >
        Instinkt
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '18px',
          color: colors.textSecondary,
          margin: '0 0 48px 0',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Bet on your gut feeling
      </p>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: colors.paper,
          border: `4px solid ${colors.border}`,
          borderRadius: '20px',
          padding: '32px',
          boxShadow: `8px 8px 0 ${colors.border}`,
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Feature highlights - centered group with left-aligned rows */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.border}`,
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="#f59e0b" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text }}>
                30 seconds per bet
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.border}`,
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text }}>
                Swipe to decide
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.border}`,
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text }}>
                Win real rewards
              </span>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '18px 24px',
            backgroundColor: colors.border,
            color: '#fff',
            border: `4px solid ${colors.border}`,
            borderRadius: '14px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: `4px 4px 0 ${isDark ? '#000' : colors.border}`,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(4px, 4px)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = `4px 4px 0 ${isDark ? '#000' : colors.border}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = `4px 4px 0 ${isDark ? '#000' : colors.border}`;
          }}
        >
          Sign In
        </button>

        {/* Subtext */}
        <p
          style={{
            fontSize: '13px',
            color: colors.textMuted,
            margin: '16px 0 0 0',
          }}
        >
          Trust your instincts. Make your move.
        </p>
      </div>

      {/* Bottom text */}
      <p
        style={{
          fontSize: '12px',
          color: colors.textMuted,
          marginTop: '32px',
          textAlign: 'center',
        }}
      >
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  );
}
