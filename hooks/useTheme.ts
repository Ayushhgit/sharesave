import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { palette } from '@/constants/theme';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme() ?? 'light';
  const effective = mode === 'system' ? system : mode;
  const isDark = effective === 'dark';
  return {
    isDark,
    scheme: effective,
    colors: isDark ? palette.dark : palette.light,
  };
}
