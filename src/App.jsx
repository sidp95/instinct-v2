import { useState, useEffect, useRef, useCallback } from 'react';
import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { ChainEnum } from '@dynamic-labs/sdk-api-core';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnChainPositions } from './hooks/useOnChainPositions';
import { ToastProvider, useToast } from './context/ToastContext';
import { AudioContextProvider } from './context/AudioContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import DynamicProvider from './providers/DynamicProvider';
import ToastContainer from './components/Toast';
import Navigation from './components/Navigation';
import SignInPage from './pages/SignInPage';
import BettingPage from './pages/BettingPage';
import HistoryPage from './pages/HistoryPage';
import WalletPage from './pages/WalletPage';
import { redeemWinnings, findCloseableAccounts, buildCloseAccountsTransaction, backfillCostBasis } from './services/dflow';
import { debug, logError } from './utils/debug';

function MainApp({ audioContext, walletAddress, primaryWallet }) {
  const { colors, isDark } = useTheme();
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [activeTab, setActiveTab] = useState('bet');
  const [balance, setBalance] = useLocalStorage('instinct-balance', 100);
  const [betSize, setBetSize] = useLocalStorage('instinct-betsize', 1);

  const autoRedeemRan = useRef(false);
  const autoCleanupRan = useRef(false);
  const [isAutoRedeeming, setIsAutoRedeeming] = useState(false);

  const { positions: onChainPositions, isLoading: positionsLoading, refetch: refetchPositions } = useOnChainPositions(walletAddress);

  // Helper function for signing redemption transactions
  const signAndSubmitRedemption = useCallback(async (transaction, position) => {
    try {
      const { Connection, VersionedTransaction } = await import('@solana/web3.js');
      const { isSolanaWallet } = await import('@dynamic-labs/solana');

      if (!isSolanaWallet(primaryWallet)) return false;

      const txBytes = Buffer.from(transaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBytes);

      const signer = await primaryWallet.getSigner();
      const signedTx = await signer.signTransaction(tx);

      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e', 'confirmed');
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      debug('[Redeem] Tx submitted:', signature?.slice(0, 8) + '...');

      try {
        await Promise.race([
          connection.confirmTransaction(signature, 'confirmed'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
        ]);
        return true;
      } catch {
        await new Promise(r => setTimeout(r, 2000));
        const status = await connection.getSignatureStatus(signature);
        return status?.value?.confirmationStatus === 'confirmed' ||
               status?.value?.confirmationStatus === 'finalized';
      }
    } catch (err) {
      logError('[Redeem] Sign error:', err.message);
      return false;
    }
  }, [primaryWallet]);

  // Auto-redemption: silently redeem winning tokens when app loads
  const runAutoRedemption = useCallback(async (positions) => {
    if (!primaryWallet || !walletAddress) return;

    const redeemable = positions.filter(pos => {
      // Skip positions that have already been redeemed (tokens no longer on-chain)
      if (pos.isRedeemed) return false;
      // Only redeem positions that actually exist on-chain
      if (!pos.isOnChain) return false;

      const result = pos.market?.resolution;
      if (!result) return false;
      const userWon = (pos.choice === 'yes' && result === 'yes') ||
                      (pos.choice === 'no' && result === 'no');
      return userWon && pos.tokenCount > 0;
    });

    if (redeemable.length === 0) return;

    const totalValue = redeemable.reduce((sum, p) => sum + (p.tokenCount || 0), 0);
    debug('[AutoRedeem] Found', redeemable.length, 'positions worth $' + totalValue.toFixed(2));

    setIsAutoRedeeming(true);
    toastInfo(`Redeeming $${totalValue.toFixed(2)} in winnings...`, { duration: 5000 });

    let successCount = 0;
    let redeemedValue = 0;

    for (const position of redeemable) {
      try {
        const orderResponse = await redeemWinnings({
          tokenMint: position.tokenMint,
          amount: position.tokenCount,
          userPublicKey: walletAddress,
        });

        if (!orderResponse.transaction) continue;

        const success = await signAndSubmitRedemption(orderResponse.transaction, position);
        if (success) {
          successCount++;
          redeemedValue += position.tokenCount;
        }

        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        logError('[AutoRedeem] Error:', err.message);
      }
    }

    setIsAutoRedeeming(false);

    if (successCount > 0) {
      console.log('[Redeem] Redeemed $' + redeemedValue.toFixed(2) + ' in winnings');
      toastSuccess(`Redeemed $${redeemedValue.toFixed(2)} in winnings!`, { duration: 5000 });
      setTimeout(() => refetchPositions(), 3000);
    }
  }, [primaryWallet, walletAddress, signAndSubmitRedemption, toastInfo, toastSuccess, refetchPositions]);

  // Trigger auto-redemption once when positions load
  useEffect(() => {
    if (
      !autoRedeemRan.current &&
      !positionsLoading &&
      onChainPositions.length > 0 &&
      primaryWallet &&
      walletAddress
    ) {
      autoRedeemRan.current = true;
      runAutoRedemption(onChainPositions);
    }
  }, [positionsLoading, onChainPositions, primaryWallet, walletAddress, runAutoRedemption]);

  // Sign and submit a close accounts transaction
  const signAndSubmitCleanup = useCallback(async (transaction) => {
    try {
      const { Connection, VersionedTransaction } = await import('@solana/web3.js');
      const { isSolanaWallet } = await import('@dynamic-labs/solana');

      if (!isSolanaWallet(primaryWallet)) return false;

      const txBytes = Buffer.from(transaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBytes);

      const signer = await primaryWallet.getSigner();
      const signedTx = await signer.signTransaction(tx);

      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e', 'confirmed');
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      debug('[Cleanup] Tx submitted:', signature?.slice(0, 8) + '...');

      try {
        await Promise.race([
          connection.confirmTransaction(signature, 'confirmed'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
        ]);
        return true;
      } catch {
        await new Promise(r => setTimeout(r, 2000));
        const status = await connection.getSignatureStatus(signature);
        return status?.value?.confirmationStatus === 'confirmed' ||
               status?.value?.confirmationStatus === 'finalized';
      }
    } catch (err) {
      logError('[Cleanup] Sign error:', err.message);
      return false;
    }
  }, [primaryWallet]);

  // Auto-cleanup: silently close worthless token accounts to reclaim rent
  const runAutoCleanup = useCallback(async () => {
    if (!primaryWallet || !walletAddress) return;

    try {
      const closeableAccounts = await findCloseableAccounts(walletAddress);
      if (closeableAccounts.length === 0) return;

      debug('[AutoCleanup] Found', closeableAccounts.length, 'closeable accounts');

      const transaction = await buildCloseAccountsTransaction(closeableAccounts, walletAddress);
      const success = await signAndSubmitCleanup(transaction);

      if (success) {
        debug('[AutoCleanup] Closed', closeableAccounts.length, 'accounts');
      }
    } catch (err) {
      // Silent fail - cleanup is non-critical
      debug('[AutoCleanup] Error:', err.message);
    }
  }, [primaryWallet, walletAddress, signAndSubmitCleanup]);

  // Trigger auto-cleanup after auto-redemption completes
  useEffect(() => {
    if (
      !autoCleanupRan.current &&
      autoRedeemRan.current &&
      !isAutoRedeeming &&
      !positionsLoading &&
      primaryWallet &&
      walletAddress
    ) {
      autoCleanupRan.current = true;
      // Delay cleanup slightly to not overwhelm the user with notifications
      setTimeout(() => runAutoCleanup(), 3000);
    }
  }, [isAutoRedeeming, positionsLoading, primaryWallet, walletAddress, runAutoCleanup]);

  // Run cost basis backfill once when wallet is ready
  const costBackfillRan = useRef(false);
  useEffect(() => {
    if (!costBackfillRan.current && walletAddress) {
      costBackfillRan.current = true;
      backfillCostBasis(walletAddress).then(result => {
        if (result.added > 0) {
          console.log('[CostBasis] Added', result.added, 'entries from transaction history');
        }
        if (result.fixed > 0) {
          console.log('[CostBasis] Fixed', result.fixed, 'entries');
        }
      });
    }
  }, [walletAddress]);

  const handlePlaceBet = (bet) => {
    if (balance >= bet.amount) {
      setBalance((prev) => prev - bet.amount);
      setTimeout(() => refetchPositions(), 3000);
      return true;
    }
    return false;
  };

  const handleRedeemWinnings = useCallback(async (transaction, position) => {
    return signAndSubmitRedemption(transaction, position);
  }, [signAndSubmitRedemption]);

  const renderPage = () => {
    switch (activeTab) {
      case 'bet':
        return (
          <BettingPage
            onPlaceBet={handlePlaceBet}
            betSize={betSize}
            balance={balance}
            goToWallet={() => setActiveTab('wallet')}
          />
        );
      case 'history':
        return <HistoryPage bets={onChainPositions} isLoadingPositions={positionsLoading} onRefresh={refetchPositions} walletAddress={walletAddress} onRedeemWinnings={handleRedeemWinnings} />;
      case 'wallet':
        return (
          <WalletPage
            betSize={betSize}
            setBetSize={setBetSize}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AudioContextProvider audioContext={audioContext}>
      <ToastContainer />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${isDark ? '#444' : '#222'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.05,
          }}
        />
        <main className="relative z-10" style={{ minHeight: 'calc(100vh - 96px)', paddingBottom: '96px' }}>
          {renderPage()}
        </main>
      </div>
    </AudioContextProvider>
  );
}

function AppContent() {
  const { sdkHasLoaded, user, primaryWallet, refreshUser } = useDynamicContext();
  const waas = useDynamicWaas();
  const { colors } = useTheme();
  const [audioContext, setAudioContext] = useState(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletCreationAttempted, setWalletCreationAttempted] = useState(false);
  const [walletCreationComplete, setWalletCreationComplete] = useState(false);

  const isAuthenticated = !!user;
  const hasWallet = !!primaryWallet;

  // Auto-create embedded wallet if user doesn't have one
  useEffect(() => {
    const createWallet = async () => {
      if (
        isAuthenticated &&
        !hasWallet &&
        !isCreatingWallet &&
        !walletCreationAttempted &&
        !walletCreationComplete &&
        waas?.createWalletAccount
      ) {
        setIsCreatingWallet(true);
        setWalletCreationAttempted(true);
        try {
          debug('[App] Creating embedded Solana wallet...');

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Wallet creation timeout')), 30000)
          );

          await Promise.race([
            waas.createWalletAccount([ChainEnum.Sol]),
            timeoutPromise
          ]);

          debug('[App] Wallet created');

          if (refreshUser) await refreshUser();
          setWalletCreationComplete(true);
        } catch (e) {
          logError('[App] Wallet creation failed:', e.message);
          setWalletCreationComplete(true);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    createWallet();
  }, [isAuthenticated, hasWallet, waas, isCreatingWallet, walletCreationAttempted, walletCreationComplete, refreshUser]);

  // Safety timeout
  useEffect(() => {
    if (isCreatingWallet) {
      const timeout = setTimeout(() => {
        setIsCreatingWallet(false);
        setWalletCreationComplete(true);
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [isCreatingWallet]);

  useEffect(() => {
    if (isAuthenticated && !audioContext) {
      const initAudio = async () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          await ctx.resume();
          setAudioContext(ctx);
        } catch (e) {
          logError('Audio restore error:', e.message);
        }
        window.removeEventListener('click', initAudio);
        window.removeEventListener('touchstart', initAudio);
      };
      window.addEventListener('click', initAudio);
      window.addEventListener('touchstart', initAudio);
      return () => {
        window.removeEventListener('click', initAudio);
        window.removeEventListener('touchstart', initAudio);
      };
    }
  }, [isAuthenticated, audioContext]);

  const handleAudioInit = (ctx) => setAudioContext(ctx);

  if (!sdkHasLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}>
        <div
          className="animate-spin w-12 h-12 border-4 rounded-full"
          style={{ borderColor: colors.border, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPage onAudioInit={handleAudioInit} />;
  }

  if (isCreatingWallet) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        gap: '16px',
      }}>
        <div
          className="animate-spin w-12 h-12 border-4 rounded-full"
          style={{ borderColor: colors.border, borderTopColor: 'transparent' }}
        />
        <p style={{ color: colors.text, fontWeight: 'bold' }}>Creating your wallet...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <MainApp audioContext={audioContext} walletAddress={primaryWallet?.address} primaryWallet={primaryWallet} />
    </ToastProvider>
  );
}

function AppContainer({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          minHeight: '100vh',
          position: 'relative',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppContainer>
      <ThemeProvider>
        <DynamicProvider>
          <AppContent />
        </DynamicProvider>
      </ThemeProvider>
    </AppContainer>
  );
}
