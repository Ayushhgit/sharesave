import { Pressable, View } from 'react-native';
import { cn } from '@/utils/format';
import { Text } from './Text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: string;
  trailing?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  tone,
  trailing,
  size = 'md',
  className,
}: Props) {
  const heightClass = size === 'sm' ? 'h-8 px-3' : 'h-9 px-3.5';

  const style = tone
    ? selected
      ? { backgroundColor: tone, borderColor: tone }
      : {
          backgroundColor: hexToRgba(tone, 0.1),
          borderColor: hexToRgba(tone, 0.25),
        }
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-full flex-row items-center border',
        heightClass,
        !tone && (selected
          ? 'bg-ink-900 dark:bg-paper-50 border-transparent'
          : 'bg-transparent border-ink-200 dark:border-ink-700'),
        className
      )}
      style={style}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text
        className={cn(
          'text-sm font-medium tracking-tight',
          !tone && (selected ? 'text-paper-50 dark:text-ink-900' : 'text-ink-700 dark:text-ink-200')
        )}
        style={tone ? { color: selected ? '#fff' : tone } : undefined}
      >
        {label}
      </Text>
      {trailing && <View className="ml-1.5">{trailing}</View>}
    </Pressable>
  );
}
