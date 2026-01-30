import { useState, useEffect } from 'react';
import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { ChainEnum } from '@dynamic-labs/sdk-api-core';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnChainPositions } from './hooks/useOnChainPositions';
import { ToastProvider } from './context/ToastContext';
import { AudioContextProvider } from './context/AudioContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import DynamicProvider from './providers/DynamicProvider';
import ToastContainer from './components/Toast';
import Navigation from './components/Navigation';
import SignInPage from './pages/SignInPage';
import BettingPage from './pages/BettingPage';
import HistoryPage from './pages/HistoryPage';
import WalletPage from './pages/WalletPage';

function MainApp({ audioContext, walletAddress }) {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('bet'); // Default to betting page
  const [balance, setBalance] = useLocalStorage('instinct-balance', 100);
  const [betSize, setBetSize] = useLocalStorage('instinct-betsize', 1);
  // Note: localStorage bets are NOT used for history - on-chain positions are the source of truth
  // localStorage is only for tracking which markets user has seen/skipped

  console.log('[DEBUG-APP] MainApp rendered with walletAddress:', walletAddress);

  // Fetch on-chain positions (source of truth for actual holdings)
  const { positions: onChainPositions, isLoading: positionsLoading, refetch: refetchPositions } = useOnChainPositions(walletAddress);

  console.log('[DEBUG-APP] onChainPositions:', onChainPositions.length, 'positionsLoading:', positionsLoading);

  const handlePlaceBet = (bet) => {
    if (balance >= bet.amount) {
      // Note: We don't save to localStorage bets anymore
      // On-chain positions are fetched directly from blockchain
      setBalance((prev) => prev - bet.amount);
      // Refetch positions after a short delay to pick up the new on-chain position
      setTimeout(() => refetchPositions(), 3000);
      return true;
    }
    return false;
  };

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
        return <HistoryPage bets={onChainPositions} isLoadingPositions={positionsLoading} onRefresh={refetchPositions} />;
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

  // Debug logging
  useEffect(() => {
    console.log('[App] State:', {
      sdkHasLoaded,
      isAuthenticated,
      hasWallet,
      primaryWallet: primaryWallet?.address,
      waasAvailable: !!waas,
      userHasEmbeddedWallet: waas?.userHasEmbeddedWallet,
      walletCreationComplete,
    });
  }, [sdkHasLoaded, isAuthenticated, hasWallet, primaryWallet, waas, walletCreationComplete]);

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
          console.log('[App] Creating embedded Solana wallet...');

          // Add timeout to prevent hanging forever
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Wallet creation timeout')), 30000)
          );

          await Promise.race([
            waas.createWalletAccount([ChainEnum.Sol]),
            timeoutPromise
          ]);

          console.log('[App] Embedded wallet created!');

          // Refresh user data to ensure wallet is detected
          if (refreshUser) {
            console.log('[App] Refreshing user data...');
            await refreshUser();
          }

          // Mark creation as complete - this will allow proceeding even if primaryWallet hasn't updated yet
          setWalletCreationComplete(true);
        } catch (e) {
          console.error('[App] Failed to create embedded wallet:', e);
          // Even on failure, mark as complete to prevent infinite loading
          setWalletCreationComplete(true);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    createWallet();
  }, [isAuthenticated, hasWallet, waas, isCreatingWallet, walletCreationAttempted, walletCreationComplete, refreshUser]);

  // Safety timeout: if still creating wallet after 15 seconds, proceed anyway
  useEffect(() => {
    if (isCreatingWallet) {
      const timeout = setTimeout(() => {
        console.log('[App] Wallet creation taking too long, proceeding anyway...');
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
          console.error('Audio restore error:', e);
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

  // Show loading while creating wallet (but don't block forever)
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
      <MainApp audioContext={audioContext} walletAddress={primaryWallet?.address} />
    </ToastProvider>
  );
}

// Wrapper component to constrain app to mobile-like view on desktop
function AppContainer({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a', // Dark background outside the app
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
