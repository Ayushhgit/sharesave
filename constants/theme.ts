export const palette = {
  light: {
    bg: '#FBF8F3',
    surface: '#FFFFFF',
    surfaceMuted: '#F4EFE6',
    border: '#E8E1D3',
    text: '#0A0A0B',
    textMuted: '#544F46',
    accent: '#6D4BFF',
  },
  dark: {
    bg: '#0A0A0B',
    surface: '#141312',
    surfaceMuted: '#22201D',
    border: '#2E2A24',
    text: '#FBF8F3',
    textMuted: '#A8A296',
    accent: '#A98EFF',
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type Palette = typeof palette.light;
