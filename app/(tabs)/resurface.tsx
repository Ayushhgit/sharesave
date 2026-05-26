import { View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { ResurfaceCard } from '@/components/ResurfaceCard';
import { MOCK_RESURFACE } from '@/utils/mockData';
import { useItemsStore } from '@/store/itemsStore';
import { router } from 'expo-router';
import { ItemCard } from '@/components/ItemCard';
import { CATEGORIES } from '@/constants/categories';
import { relativeDate } from '@/utils/format';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export default function Resurface() {
  const items = useItemsStore((s) => s.items);
  const olderThanWeek = items
    .filter((i) => Date.now() - +new Date(i.createdAt) > 7 * 86_400_000)
    .slice(0, 5);
  const withReminders = items.filter((i) => i.reminder).slice(0, 4);

  return (
    <SafeAreaView className="flex-1 bg-paper-50 dark:bg-ink-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-rose" />
            <Text variant="eyebrow">Volume III · Resurface</Text>
          </View>
          <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] font-semibold mt-3">
            Bring
          </Text>
          <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] italic">
            it back<Text style={serif} className="text-rose italic">.</Text>
          </Text>
          <Text variant="bodyMuted" className="mt-3 max-w-[300px]">
            Things you saved with intent — gently nudged when the moment feels right.
          </Text>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 480, delay: 100 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
          >
            {MOCK_RESURFACE.map((r, i) => (
              <ResurfaceCard key={r.id} suggestion={r} index={i} />
            ))}
          </ScrollView>
        </MotiView>

        <View className="px-5 mt-8">
          <View className="flex-row items-end justify-between mb-3">
            <View>
              <Text variant="eyebrow">Forgotten</Text>
              <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[22px] italic mt-0.5">
                from a while ago
              </Text>
            </View>
            <Sparkles size={14} color="#6D4BFF" />
          </View>
          <View className="gap-2.5">
            {olderThanWeek.map((item, idx) => {
              const cat = CATEGORIES[item.category];
              return (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateX: -8 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 320, delay: idx * 50 }}
                >
                  <Pressable onPress={() => router.push(`/item/${item.id}`)}>
                    <View
                      className="flex-row items-center bg-white dark:bg-ink-800 rounded-2xl p-3.5 border border-paper-200/70 dark:border-ink-700/60"
                      style={{
                        shadowColor: '#0A0A0B',
                        shadowOpacity: 0.04,
                        shadowRadius: 14,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 1,
                      }}
                    >
                      <View
                        className="w-1 h-12 rounded-full mr-3"
                        style={{ backgroundColor: cat.color }}
                      />
                      <View className="flex-1">
                        <Text
                          style={serif}
                          className="text-ink-900 dark:text-paper-50 text-[15px] font-semibold"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text variant="caption" className="mt-0.5">
                          Saved {relativeDate(item.createdAt)} · {cat.label}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#A8A296" />
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </View>
        </View>

        {withReminders.length > 0 && (
          <View className="px-5 mt-8">
            <Text variant="eyebrow" className="mb-3">
              Scheduled to return
            </Text>
            <View className="gap-2.5">
              {withReminders.map((item, i) => (
                <ItemCard key={item.id} item={item} layout="list" index={i} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
