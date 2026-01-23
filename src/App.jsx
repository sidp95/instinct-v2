import { useState, useEffect } from 'react';
import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { ChainEnum } from '@dynamic-labs/sdk-api-core';
import { useLocalStorage } from './hooks/useLocalStorage';
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

function MainApp({ audioContext }) {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('wallet'); // Default to wallet for export
  const [balance, setBalance] = useLocalStorage('instinct-balance', 100);
  const [betSize, setBetSize] = useLocalStorage('instinct-betsize', 1);
  const [bets, setBets] = useLocalStorage('instinct-bets', []);

  const handlePlaceBet = (bet) => {
    if (balance >= bet.amount) {
      setBets((prev) => [...prev, bet]);
      setBalance((prev) => prev - bet.amount);
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
        return <HistoryPage bets={bets} />;
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
  const { sdkHasLoaded, user, primaryWallet } = useDynamicContext();
  const waas = useDynamicWaas();
  const { colors } = useTheme();
  const [audioContext, setAudioContext] = useState(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletCreationAttempted, setWalletCreationAttempted] = useState(false);

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
    });
  }, [sdkHasLoaded, isAuthenticated, hasWallet, primaryWallet, waas]);

  // Auto-create embedded wallet if user doesn't have one
  useEffect(() => {
    const createWallet = async () => {
      if (
        isAuthenticated &&
        !hasWallet &&
        !isCreatingWallet &&
        !walletCreationAttempted &&
        waas?.createWalletAccount
      ) {
        setIsCreatingWallet(true);
        setWalletCreationAttempted(true);
        try {
          console.log('[App] Creating embedded Solana wallet...');
          await waas.createWalletAccount([ChainEnum.Sol]);
          console.log('[App] Embedded wallet created!');
        } catch (e) {
          console.error('[App] Failed to create embedded wallet:', e);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    createWallet();
  }, [isAuthenticated, hasWallet, waas, isCreatingWallet, walletCreationAttempted]);

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
      <MainApp audioContext={audioContext} />
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DynamicProvider>
        <AppContent />
      </DynamicProvider>
    </ThemeProvider>
  );
}
