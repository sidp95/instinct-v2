import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTheme } from '../context/ThemeContext';

export default function LogoutButton() {
  const { handleLogOut } = useDynamicContext();
  const { colors } = useTheme();

  return (
    <button
      onClick={() => handleLogOut()}
      style={{
        position: 'absolute',
        top: '10px',
        right: '12px',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: colors.paper,
        border: `2px solid ${colors.border}`,
        boxShadow: `2px 2px 0 ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      title="Logout"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.text}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
