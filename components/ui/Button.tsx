import { Pressable, ActivityIndicator, View, type PressableProps } from 'react-native';
import { MotiView } from 'moti';
import { cn } from '@/utils/format';
import { Text } from './Text';
import { useHaptics } from '@/hooks/useHaptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
  haptic?: 'light' | 'medium' | 'select' | 'none';
}

const sizeMap: Record<Size, string> = {
  sm: 'h-10 px-3.5',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};

const labelSize: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

export function Button({
  label,
  icon,
  trailing,
  variant = 'primary',
  size = 'md',
  loading,
  full,
  haptic = 'light',
  className,
  onPress,
  disabled,
  ...rest
}: Props) {
  const h = useHaptics();
  const tone: Record<Variant, string> = {
    primary: 'bg-ink-900 dark:bg-paper-50',
    accent: 'bg-accent',
    secondary: 'bg-paper-100 dark:bg-ink-700',
    ghost: 'bg-transparent',
    danger: 'bg-rose/15',
  };
  const textTone: Record<Variant, string> = {
    primary: 'text-paper-50 dark:text-ink-900',
    accent: 'text-white',
    secondary: 'text-ink-900 dark:text-paper-50',
    ghost: 'text-ink-700 dark:text-ink-100',
    danger: 'text-rose',
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={(e) => {
        if (haptic !== 'none') h[haptic]?.();
        onPress?.(e);
      }}
      className={cn(
        'rounded-full flex-row items-center justify-center',
        sizeMap[size],
        tone[variant],
        full && 'w-full',
        disabled && 'opacity-40',
        className
      )}
      {...rest}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: loading ? 0.98 : 1 }}
        transition={{ type: 'timing', duration: 120 }}
        className="flex-row items-center"
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'accent' ? '#fff' : '#6D4BFF'} />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={cn('font-semibold tracking-tight', labelSize[size], textTone[variant])}>
              {label}
            </Text>
            {trailing && <View className="ml-2">{trailing}</View>}
          </>
        )}
      </MotiView>
    </Pressable>
  );
}
