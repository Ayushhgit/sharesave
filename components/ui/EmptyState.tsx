import { View } from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  emoji?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ emoji = '✺', title, body, ctaLabel, onCta }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 480 }}
      className="items-center px-8 py-16"
    >
      <View className="relative items-center justify-center mb-7">
        <View className="absolute w-32 h-32 rounded-full bg-accent/10 dark:bg-accent/15" />
        <View className="absolute w-24 h-24 rounded-full bg-paper-100 dark:bg-ink-700/70" />
        <View className="w-20 h-20 rounded-full bg-white dark:bg-ink-800 items-center justify-center border border-paper-200/60 dark:border-ink-700/60">
          <Text className="text-3xl">{emoji}</Text>
        </View>
      </View>
      <Text variant="eyebrow" className="mb-3">
        Nothing here · yet
      </Text>
      <Text
        variant="displaySerif"
        className="text-center text-3xl leading-snug mb-3 max-w-[280px]"
      >
        {title}
      </Text>
      {body && (
        <Text variant="bodyMuted" className="text-center max-w-xs leading-relaxed">
          {body}
        </Text>
      )}
      {ctaLabel && onCta && (
        <View className="mt-7 w-full max-w-xs">
          <Button label={ctaLabel} onPress={onCta} full />
        </View>
      )}
    </MotiView>
  );
}
