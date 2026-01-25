import { useState, useEffect } from 'react';
import { useEmbeddedWallet } from '@dynamic-labs/sdk-react-core';
import { useTheme } from '../context/ThemeContext';

/**
 * SessionGate Component
 *
 * This component ensures the user has an active signing session before
 * allowing them to place bets. With an active session, transactions
 * can be signed without showing confirmation popups.
 *
 * Note: V2 embedded wallets don't require OTP sessions - they sign directly.
 * This gate is primarily for V1 embedded wallets that need OTP verification.
 */
export default function SessionGate({ children }) {
  const { colors } = useTheme();
  const {
    isSessionActive,
    sendOneTimeCode,
    createOrRestoreSession,
    userHasEmbeddedWallet,
    getWalletVersion,
  } = useEmbeddedWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if user has embedded wallet (it's a function)
  const hasEmbeddedWallet = typeof userHasEmbeddedWallet === 'function'
    ? userHasEmbeddedWallet()
    : userHasEmbeddedWallet;

  // Check wallet version (V2 wallets don't need OTP sessions)
  const walletVersion = typeof getWalletVersion === 'function' ? getWalletVersion() : null;
  const isV2Wallet = walletVersion === 'v2' || walletVersion === 2;

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log('[SessionGate] Checking session...', {
        hasEmbeddedWallet,
        walletVersion,
        isV2Wallet,
        isSessionActive
      });

      // V2 wallets don't need OTP sessions - proceed directly
      if (isV2Wallet) {
        console.log('[SessionGate] V2 wallet detected - no OTP session needed');
        setIsLoading(false);
        return;
      }

      try {
        // If session is already active, we're good
        if (isSessionActive) {
          console.log('[SessionGate] Session is active');
          setIsLoading(false);
          return;
        }

        // Try to restore existing session (no OTP needed if session exists)
        console.log('[SessionGate] Trying to restore session...');
        await createOrRestoreSession();
        console.log('[SessionGate] Session restored');
        setIsLoading(false);
      } catch (err) {
        console.log('[SessionGate] No existing session:', err?.message);
        // Only show verification UI for V1 wallets
        if (!isV2Wallet) {
          setNeedsVerification(true);
        }
        setIsLoading(false);
      }
    };

    if (hasEmbeddedWallet) {
      checkSession();
    } else {
      // No embedded wallet, just proceed
      console.log('[SessionGate] No embedded wallet, proceeding...');
      setIsLoading(false);
    }
  }, [isSessionActive, createOrRestoreSession, hasEmbeddedWallet, isV2Wallet, walletVersion]);

  // If session becomes active, hide verification UI
  useEffect(() => {
    if (isSessionActive && needsVerification) {
      setNeedsVerification(false);
    }
  }, [isSessionActive, needsVerification]);

  const handleSendOtp = async () => {
    try {
      setError(null);
      console.log('[SessionGate] Sending OTP...');
      console.log('[SessionGate] sendOneTimeCode function:', sendOneTimeCode);
      const result = await sendOneTimeCode();
      console.log('[SessionGate] OTP sent result:', result);
      setOtpSent(true);
      console.log('[SessionGate] OTP sent to email');
    } catch (err) {
      console.error('[SessionGate] Failed to send OTP:', err);
      console.error('[SessionGate] Error details:', err?.message, err?.stack);
      setError(`Failed to send code: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Pass OTP as object with oneTimeCode property
      await createOrRestoreSession({ oneTimeCode: otpCode.trim() });
      console.log('[SessionGate] Session created successfully');
      setNeedsVerification(false);
    } catch (err) {
      console.error('[SessionGate] Failed to verify OTP:', err);
      setError('Invalid code. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background,
      }}>
        <div
          className="animate-spin w-12 h-12 border-4 rounded-full"
          style={{ borderColor: colors.border, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // Session verification UI
  if (needsVerification && hasEmbeddedWallet) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: colors.paper,
          border: `4px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: `6px 6px 0 ${colors.border}`,
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            Enable Quick Betting
          </h2>

          <p style={{
            color: colors.textMuted,
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            Verify once to swipe and bet without confirmations
          </p>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
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
                boxShadow: `4px 4px 0 ${colors.border}`,
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(4px, 4px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `4px 4px 0 ${colors.border}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `4px 4px 0 ${colors.border}`;
              }}
            >
              Send Verification Code
            </button>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <p style={{
                color: colors.text,
                textAlign: 'center',
                marginBottom: '16px',
                fontSize: '14px',
              }}>
                Check your email for the code
              </p>

              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter code"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  border: `3px solid ${colors.border}`,
                  borderRadius: '12px',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
                autoFocus
              />

              <button
                type="submit"
                disabled={isVerifying || !otpCode.trim()}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  backgroundColor: isVerifying ? colors.textMuted : colors.border,
                  color: '#fff',
                  border: `4px solid ${isVerifying ? colors.textMuted : colors.border}`,
                  borderRadius: '14px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: isVerifying ? 'not-allowed' : 'pointer',
                  boxShadow: `4px 4px 0 ${colors.border}`,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseDown={(e) => {
                  if (!isVerifying && otpCode.trim()) {
                    e.currentTarget.style.transform = 'translate(4px, 4px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `4px 4px 0 ${colors.border}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `4px 4px 0 ${colors.border}`;
                }}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {error && (
            <p style={{
              color: '#EF4444',
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '14px',
            }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Session is active, render children
  return children;
}
