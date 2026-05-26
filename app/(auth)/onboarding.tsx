import { useRef, useState } from 'react';
import { View, FlatList, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ONBOARDING_SLIDES } from '@/features/onboarding/slides';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { storage, STORAGE_KEYS } from '@/utils/storage';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const ref = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < ONBOARDING_SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      storage.set(STORAGE_KEYS.onboarded, true).catch(() => undefined);
      router.replace('/(auth)/signup');
    }
  };

  return (
    <View className="flex-1 bg-ink-900">
      <SafeAreaView className="flex-1">
        <FlatList
          ref={ref}
          data={ONBOARDING_SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <View style={{ width }} className="flex-1 justify-end px-7 pb-4">
              <LinearGradient
                colors={item.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 30,
                  right: 30,
                  height: 380,
                  borderRadius: 36,
                  opacity: 0.9,
                }}
              />
              <MotiView
                from={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 600 }}
                className="absolute top-[120px] left-0 right-0 items-center"
              >
                <Text className="text-[110px]">{item.emoji}</Text>
              </MotiView>
              <View className="mb-12">
                <Text className="text-white text-[40px] leading-[44px] font-semibold tracking-tight">
                  {item.title}
                </Text>
                <Text className="text-white/70 mt-3 text-base leading-relaxed">
                  {item.body}
                </Text>
              </View>
            </View>
          )}
        />

        <View className="px-6 pb-8">
          <View className="flex-row justify-center mb-6">
            {ONBOARDING_SLIDES.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 mx-1 rounded-full ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </View>
          <Button label={index === ONBOARDING_SLIDES.length - 1 ? 'Get started' : 'Next'} full size="lg" onPress={next} />
          <Pressable onPress={() => router.replace('/(auth)/signup')} className="items-center mt-4">
            <Text className="text-white/60">Skip</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
