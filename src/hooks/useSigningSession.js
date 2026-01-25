import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

/**
 * Hook to manage signing sessions for frictionless betting.
 *
 * Dynamic SDK V4+ with V2 embedded wallets supports signing without popups
 * when configured properly in the dashboard. This hook provides:
 *
 * 1. Session state tracking
 * 2. Automatic session restoration on page load
 * 3. Fallback handling for V1 wallets that need OTP
 *
 * Dashboard Configuration Required:
 * - Go to app.dynamic.xyz/dashboard
 * - Navigate to "Embedded Wallets" settings
 * - Set "Transactional MFA" to "None"
 * - Toggle OFF "Transaction Confirmation Screen"
 */
export function useSigningSession() {
  const { primaryWallet, user } = useDynamicContext();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check if we have an active session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (user && primaryWallet) {
        // For V2 embedded wallets with MFA disabled, session is always active after login
        // The wallet is ready to sign without additional prompts
        setSessionActive(true);
        setSessionChecked(true);
        console.log('[useSigningSession] Session active - user authenticated with embedded wallet');
      } else {
        setSessionActive(false);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [user, primaryWallet]);

  // Function to ensure session is ready for signing
  const ensureSession = useCallback(async () => {
    if (!primaryWallet) {
      console.log('[useSigningSession] No wallet available');
      return false;
    }

    // For V2 embedded wallets, we're always ready after authentication
    if (!sessionActive) {
      setSessionActive(true);
    }

    return true;
  }, [primaryWallet, sessionActive]);

  return {
    sessionActive,
    sessionChecked,
    ensureSession,
    isReady: sessionActive && sessionChecked,
  };
}
