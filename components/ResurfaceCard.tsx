import { Pressable, View, Platform } from 'react-native';
import { MotiView } from 'moti';
import { ArrowUpRight, History, Heart, Layers, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/Text';
import type { ResurfaceSuggestion } from '@/types';
import { router } from 'expo-router';
import { useHaptics } from '@/hooks/useHaptics';

const ICONS = {
  memory: History,
  'intent-check': Heart,
  related: Layers,
  weekend: Sparkles,
} as const;

const GRADIENTS: Record<ResurfaceSuggestion['type'], [string, string, string]> = {
  memory: ['#3A22A8', '#6D4BFF', '#A98EFF'],
  'intent-check': ['#FF6B8A', '#FF8A5C', '#F5B544'],
  related: ['#1E3A8A', '#4FB6FF', '#6D4BFF'],
  weekend: ['#E5532E', '#F5B544', '#FF6B8A'],
};

const LABELS: Record<ResurfaceSuggestion['type'], string> = {
  memory: 'A memory',
  'intent-check': 'Intent check',
  related: 'Connected',
  weekend: 'Weekend pick',
};

interface Props {
  suggestion: ResurfaceSuggestion;
  index?: number;
}

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export function ResurfaceCard({ suggestion, index = 0 }: Props) {
  const Icon = ICONS[suggestion.type];
  const h = useHaptics();
  const colors = GRADIENTS[suggestion.type];

  const onPress = () => {
    h.select();
    if (suggestion.itemIds[0]) router.push(`/item/${suggestion.itemIds[0]}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 460, delay: index * 80 }}
      className="mr-3"
    >
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 296,
            height: 220,
            borderRadius: 28,
            padding: 20,
            justifyContent: 'space-between',
            shadowColor: colors[1],
            shadowOpacity: 0.35,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
            elevation: 6,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: -30,
              bottom: -60,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-white/15 rounded-full pl-1.5 pr-3 py-1">
              <View className="w-7 h-7 rounded-full bg-white/25 items-center justify-center">
                <Icon size={14} color="#fff" />
              </View>
              <Text className="ml-2 text-white text-[11px] uppercase tracking-[0.18em] font-semibold">
                {LABELS[suggestion.type]}
              </Text>
            </View>
            <Text
              style={serif}
              className="text-white/40 text-3xl italic"
            >
              {String(index + 1).padStart(2, '0')}
            </Text>
          </View>

          <View>
            <Text
              style={serif}
              className="text-white text-[22px] leading-[26px] font-semibold"
              numberOfLines={2}
            >
              {suggestion.title}
            </Text>
            <Text className="text-white/85 mt-2 text-[13px] leading-snug" numberOfLines={2}>
              {suggestion.body}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-white/95 rounded-full pl-3.5 pr-2 py-1.5">
              <Text className="text-ink-900 font-semibold text-[13px] mr-1.5">
                {suggestion.cta}
              </Text>
              <View className="w-5 h-5 rounded-full bg-ink-900 items-center justify-center">
                <ArrowUpRight size={11} color="#fff" />
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-1 h-1 rounded-full bg-white/60" />
              <View className="w-1 h-1 rounded-full bg-white/30" />
              <View className="w-1 h-1 rounded-full bg-white/30" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </MotiView>
  );
}
