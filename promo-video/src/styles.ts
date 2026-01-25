// Styles matching the Instinkt app exactly
import { loadFont } from '@remotion/google-fonts/ComicNeue';

// Load Comic Neue font
const { fontFamily } = loadFont();

export const colors = {
  // Light mode (used in video)
  background: '#E8E8E8',
  backgroundSecondary: '#f5f5f5',
  paper: '#fff',
  border: '#222',
  text: '#222',
  textSecondary: '#666',
  textMuted: '#888',

  // Action colors
  yes: '#22C55E',
  yesBg: '#D1FAE5',
  no: '#EF4444',
  noBg: '#FEE2E2',
  skip: '#3B82F6',
  skipBg: '#DBEAFE',

  // Category colors
  categories: {
    Crypto: '#F59E0B',
    Sports: '#3B82F6',
    Politics: '#8B5CF6',
    Weather: '#06B6D4',
    Stocks: '#10B981',
    Commodities: '#EC4899',
    Finance: '#10B981',
    Tech: '#6366F1',
    Culture: '#EC4899',
    Other: '#6B7280',
  }
};

export const fonts = {
  primary: fontFamily,
};

// Comic-style card styling
export const cardStyle: React.CSSProperties = {
  backgroundColor: colors.paper,
  border: `3px solid ${colors.border}`,
  borderRadius: '16px',
  boxShadow: `4px 4px 0 ${colors.border}`,
};

// Comic button styling
export const buttonStyle: React.CSSProperties = {
  fontFamily: fonts.primary,
  fontWeight: 'bold',
  border: `3px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: `3px 3px 0 ${colors.border}`,
  cursor: 'pointer',
};
