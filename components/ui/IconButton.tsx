import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { cn } from '@/utils/format';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
  icon: LucideIcon;
  onPress?: () => void;
  size?: number;
  variant?: 'surface' | 'overlay' | 'tint';
  tint?: string;
  className?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  size = 40,
  variant = 'surface',
  tint,
  className,
  accessibilityLabel,
}: Props) {
  const { isDark } = useTheme();
  const h = useHaptics();

  const fg =
    tint ??
    (variant === 'overlay' ? '#0A0A0B' : isDark ? '#FFFFFF' : '#0A0A0B');

  const bg =
    variant === 'overlay'
      ? 'bg-white/90'
      : variant === 'tint'
      ? 'bg-accent/15'
      : 'bg-white dark:bg-ink-800 border border-ink-100/60 dark:border-ink-700/60';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        h.light();
        onPress?.();
      }}
      className={cn('rounded-full items-center justify-center', bg, className)}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.5)} color={fg} />
    </Pressable>
  );
}
