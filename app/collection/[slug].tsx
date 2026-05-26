import { View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, ArrowUpDown } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLLECTIONS } from '@/constants/categories';
import { useItemsStore } from '@/store/itemsStore';
import { useFilteredItems } from '@/hooks/useFilteredItems';
import { useTheme } from '@/hooks/useTheme';
import type { CollectionId } from '@/types';

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: CollectionId }>();
  const collection = slug && COLLECTIONS[slug as CollectionId];
  const items = useFilteredItems({ collection: slug as CollectionId });
  const sort = useItemsStore((s) => s.sort);
  const setSort = useItemsStore((s) => s.setSort);
  const { isDark } = useTheme();

  if (!collection) {
    return (
      <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900 items-center justify-center">
        <Text variant="bodyMuted">Collection not found.</Text>
      </SafeAreaView>
    );
  }

  const cycleSort = () => {
    const order: Array<'recent' | 'oldest' | 'category'> = ['recent', 'oldest', 'category'];
    const next = order[(order.indexOf(sort) + 1) % order.length];
    setSort(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-ink-800 items-center justify-center border border-ink-100/60 dark:border-ink-700/60"
        >
          <ChevronLeft size={20} color={isDark ? '#FFFFFF' : '#0A0A0B'} />
        </Pressable>
        <Pressable
          onPress={cycleSort}
          className="flex-row items-center px-3.5 h-10 rounded-full bg-white dark:bg-ink-800 border border-ink-100/60 dark:border-ink-700/60"
        >
          <ArrowUpDown size={14} color="#85858F" />
          <Text className="ml-2 text-sm font-medium text-ink-700 dark:text-ink-200">
            {sort === 'recent' ? 'Newest' : sort === 'oldest' ? 'Oldest' : 'By category'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 140, gap: 10 }}
        ListHeaderComponent={
          <View className="px-5 mb-4">
            <View
              className="rounded-3xl p-5 mb-4"
              style={{ backgroundColor: `${collection.accent}22` }}
            >
              <Text className="text-3xl">{collection.emoji}</Text>
              <Text className="text-ink-900 dark:text-white text-[32px] leading-tight mt-2 font-semibold tracking-tight">
                {collection.label}
              </Text>
              <Text variant="bodyMuted" className="mt-1">
                {collection.description} · {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => <ItemCard item={item} layout="grid" index={index} />}
        ListEmptyComponent={
          <EmptyState
            emoji={collection.emoji}
            title={`Nothing in ${collection.label} yet`}
            body="Save something that fits this bucket. Intent will route it here automatically."
          />
        }
      />
    </SafeAreaView>
  );
}
