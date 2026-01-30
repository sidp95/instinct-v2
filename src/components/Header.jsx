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
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: colors.border,
            boxShadow: `2px 2px 0 ${colors.border}`,
          }}
        >
          <span className="text-white font-bold text-xl">I</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: colors.text }}>Instinkt</h1>
      </div>
    </header>
  );
}
