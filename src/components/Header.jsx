import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { colors } = useTheme();

  return (
    <header
      className="flex items-center px-4 border-b-3"
      style={{
        backgroundColor: colors.paper,
        borderColor: colors.border,
        height: '56px',
        minHeight: '56px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: `2px solid ${colors.border}`,
            boxShadow: `2px 2px 0 ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
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
        <h1 className="text-xl font-bold" style={{ color: colors.text }}>Instinkt</h1>
      </div>
    </header>
  );
}
