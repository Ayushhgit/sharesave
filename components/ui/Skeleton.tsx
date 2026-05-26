import { MotiView } from 'moti';
import { View } from 'react-native';
import { cn } from '@/utils/format';

interface Props {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  height?: number;
  width?: number | string;
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'xl', height, width }: Props) {
  return (
    <View
      className={cn('overflow-hidden bg-paper-100 dark:bg-ink-800', roundedMap[rounded], className)}
      style={{ height, width: width as number | undefined }}
    >
      <MotiView
        from={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
          repeatReverse: true,
        }}
        className="flex-1 bg-paper-200/60 dark:bg-ink-700/50"
      />
    </View>
  );
}

export function ItemCardSkeleton() {
  return (
    <View className="rounded-[20px] overflow-hidden bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 mb-3">
      <Skeleton height={180} rounded="sm" className="rounded-none" />
      <View className="p-3.5">
        <Skeleton height={14} width="80%" rounded="sm" className="mb-2" />
        <Skeleton height={10} width="55%" rounded="sm" className="mb-3" />
        <View className="flex-row items-center justify-between">
          <Skeleton height={20} width={70} rounded="full" />
          <Skeleton height={10} width={40} rounded="sm" />
        </View>
      </View>
    </View>
  );
}
