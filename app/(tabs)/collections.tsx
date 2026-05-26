import { View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { COLLECTION_LIST } from '@/constants/categories';
import { useItemsStore } from '@/store/itemsStore';
import { useHaptics } from '@/hooks/useHaptics';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export default function Collections() {
  const items = useItemsStore((s) => s.items);
  const h = useHaptics();

  const countFor = (id: string) => items.filter((i) => i.collection === id).length;
  const previewFor = (id: string) =>
    items.filter((i) => i.collection === id && i.thumbnail).slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-paper-50 dark:bg-ink-900" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-warm" />
            <Text variant="eyebrow">Volume II · Stacks</Text>
          </View>
          <Text
            style={serif}
            className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] font-semibold mt-3"
          >
            Your
          </Text>
          <Text
            style={serif}
            className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] italic"
          >
            collections<Text style={serif} className="text-accent italic">.</Text>
          </Text>
          <Text variant="bodyMuted" className="mt-3 max-w-[300px]">
            Saves grouped by intent, not folders. Each stack a small room of the mind.
          </Text>
        </View>

        <View className="px-5 mt-7 gap-3">
          {COLLECTION_LIST.map((c, idx) => {
            const previews = previewFor(c.id);
            const count = countFor(c.id);
            return (
              <MotiView
                key={c.id}
                from={{ opacity: 0, translateY: 14 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 380, delay: idx * 60 }}
              >
                <Pressable
                  onPress={() => {
                    h.select();
                    router.push(`/collection/${c.id}`);
                  }}
                >
                  <View
                    className="rounded-[22px] overflow-hidden bg-white dark:bg-ink-800 border"
                    style={{
                      borderColor: `${c.accent}25`,
                      shadowColor: c.accent,
                      shadowOpacity: 0.1,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 8 },
                      elevation: 3,
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: c.accent,
                      }}
                    />
                    <View className="p-4 pl-5 flex-row items-center">
                      <View
                        className="w-14 h-14 rounded-2xl items-center justify-center"
                        style={{
                          backgroundColor: `${c.accent}1A`,
                          borderWidth: 1,
                          borderColor: `${c.accent}30`,
                        }}
                      >
                        <Text className="text-2xl">{c.emoji}</Text>
                      </View>
                      <View className="flex-1 ml-3.5">
                        <View className="flex-row items-baseline gap-2">
                          <Text
                            style={serif}
                            className="text-ink-900 dark:text-paper-50 text-[20px] font-semibold"
                          >
                            {c.label}
                          </Text>
                          <Text
                            style={[serif, { color: c.accent }]}
                            className="italic text-[14px]"
                          >
                            · {count}
                          </Text>
                        </View>
                        <Text variant="caption" className="mt-0.5" numberOfLines={1}>
                          {c.description}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {previews.map((p, i) => (
                          <Image
                            key={p.id}
                            source={{ uri: p.thumbnail }}
                            style={{
                              width: 38,
                              height: 50,
                              borderRadius: 10,
                              marginLeft: i === 0 ? 0 : -14,
                              borderWidth: 2,
                              borderColor: '#FBF8F3',
                            }}
                            contentFit="cover"
                          />
                        ))}
                        <ChevronRight size={14} color="#A8A296" style={{ marginLeft: 8 }} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
