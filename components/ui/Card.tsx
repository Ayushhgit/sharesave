import { View, type ViewProps } from 'react-native';
import { cn } from '@/utils/format';

interface Props extends ViewProps {
  variant?: 'surface' | 'muted' | 'outline' | 'paper';
  padded?: boolean;
  elevated?: boolean;
}

export function Card({
  variant = 'surface',
  padded = true,
  elevated = true,
  className,
  style,
  ...rest
}: Props) {
  const variants = {
    surface:
      'bg-white dark:bg-ink-800 border border-ink-100/70 dark:border-ink-700/40',
    paper:
      'bg-paper-50 dark:bg-ink-800 border border-paper-200/60 dark:border-ink-700/40',
    muted: 'bg-paper-100 dark:bg-ink-800/70 border border-transparent',
    outline: 'bg-transparent border border-ink-200 dark:border-ink-700',
  } as const;

  return (
    <View
      style={[
        elevated && {
          shadowColor: '#0A0A0B',
          shadowOpacity: 0.06,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
          elevation: 3,
        },
        style,
      ]}
      className={cn(
        'rounded-[20px]',
        variants[variant],
        padded && 'p-4',
        className
      )}
      {...rest}
    />
  );
}
