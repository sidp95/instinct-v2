import { useTheme } from '../context/ThemeContext';

export default function Navigation({ activeTab, onTabChange }) {
  const { colors } = useTheme();

  const tabs = [
    { id: 'history', label: 'History', icon: 'clock' },
    { id: 'bet', label: 'Bet', icon: 'bolt' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: '80px',
      backgroundColor: colors.backgroundSecondary,
      borderTop: `3px solid ${colors.border}`,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 16px',
      boxSizing: 'border-box',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            width: '80px',
            height: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            border: activeTab === tab.id ? `2px solid ${colors.border}` : '2px solid transparent',
            backgroundColor: activeTab === tab.id ? colors.paper : 'transparent',
            boxShadow: activeTab === tab.id ? `2px 2px 0 ${colors.border}` : 'none',
            cursor: 'pointer',
            transition: 'none',
            color: colors.text,
          }}
        >
          {tab.icon === 'clock' && (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {tab.icon === 'bolt' && (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {tab.icon === 'wallet' && (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )}
          <span style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
