import { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { Bell, Sparkles } from 'lucide-react-native';
import { format } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { CategoryStrip } from '@/components/CategoryStrip';
import { ItemCard } from '@/components/ItemCard';
import { ItemCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ViewToggle } from '@/components/ViewToggle';
import { ResurfaceCard } from '@/components/ResurfaceCard';
import { useItemsQuery } from '@/hooks/useItems';
import { useFilteredItems } from '@/hooks/useFilteredItems';
import { useItemsStore } from '@/store/itemsStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { MOCK_RESURFACE } from '@/utils/mockData';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export default function Home() {
  const { isLoading, refetch } = useItemsQuery();
  const items = useFilteredItems();
  const allItems = useItemsStore((s) => s.items);
  const view = useItemsStore((s) => s.view);
  const openSave = useUIStore((s) => s.openSave);
  const user = useAuthStore((s) => s.user);
  const { isDark } = useTheme();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), qc.invalidateQueries({ queryKey: ['items'] })]);
    setRefreshing(false);
  }, [refetch, qc]);

  const isGrid = view === 'grid';
  const numColumns = isGrid ? 2 : 1;

  const weekStart = Date.now() - 7 * 86_400_000;
  const thisWeek = allItems.filter((i) => +new Date(i.createdAt) > weekStart).length;
  const reminderCount = allItems.filter((i) => i.reminder).length;

  return (
    <SafeAreaView className="flex-1 bg-paper-50 dark:bg-ink-900" edges={['top']}>
      <FlatList
        key={numColumns}
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={numColumns}
        columnWrapperStyle={isGrid ? { gap: 12, paddingHorizontal: 20 } : undefined}
        contentContainerStyle={{ paddingBottom: 160, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D4BFF" />
        }
        ListHeaderComponent={
          <View>
            <HeroHeader user={user} isDark={isDark} />
            <View className="px-5 mt-5">
              <SearchBar />
            </View>
            <StatBar total={allItems.length} week={thisWeek} reminders={reminderCount} />
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 480, delay: 140 }}
              className="mt-7"
            >
              <SectionHead eyebrow="No. 01" title="Resurface" caption="curated for now" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}
              >
                {MOCK_RESURFACE.map((r, i) => (
                  <ResurfaceCard key={r.id} suggestion={r} index={i} />
                ))}
              </ScrollView>
            </MotiView>

            <View className="mt-7">
              <SectionHead eyebrow="No. 02" title="Filter" caption="by intent" />
              <View className="mt-3">
                <CategoryStrip />
              </View>
            </View>

            <View className="flex-row items-end justify-between px-5 mt-8 mb-3">
              <View>
                <Text variant="eyebrow">No. 03 — Library</Text>
                <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[26px] italic mt-0.5">
                  {items.length}{' '}
                  <Text style={serif} className="text-ink-400 italic">
                    saves
                  </Text>
                </Text>
              </View>
              <ViewToggle />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className={isGrid ? '' : 'px-5'}>
            <ItemCard item={item} layout={view} index={index} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 flex-row flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} className="w-[48%]">
                  <ItemCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              emoji="✺"
              title="A blank page, on purpose."
              body="Save a reel, link, or screenshot. Intent figures out what it is, what it's for, and when to bring it back."
              ctaLabel="Quick save"
              onCta={openSave}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function HeroHeader({
  user,
  isDark,
}: {
  user: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  isDark: boolean;
}) {
  const today = new Date();
  const dateLabel = format(today, "EEEE · MMM d").toUpperCase();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Friend';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 520 }}
    >
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-accent" />
          <Text variant="eyebrow">Intent · No. {format(today, 'DDD')}</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Pressable className="w-10 h-10 rounded-full bg-white dark:bg-ink-800 items-center justify-center border border-paper-200/70 dark:border-ink-700/60">
            <Bell size={16} color={isDark ? '#FBF8F3' : '#0A0A0B'} />
            <View
              className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose"
              style={{ shadowColor: '#FF6B8A', shadowOpacity: 0.6, shadowRadius: 4 }}
            />
          </Pressable>
          <Avatar name={user?.displayName ?? user?.email ?? 'You'} uri={user?.photoURL ?? undefined} />
        </View>
      </View>

      <View className="px-5 mt-7">
        <Text variant="eyebrow">{dateLabel}</Text>
        <View className="flex-row items-end mt-2 flex-wrap">
          <Text
            style={serif}
            className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] font-semibold"
          >
            {greeting()},{'\n'}
          </Text>
        </View>
        <View className="flex-row items-end flex-wrap mt-1">
          <Text
            style={serif}
            className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] italic"
          >
            {firstName}
          </Text>
          <Text
            style={serif}
            className="text-accent text-[44px] leading-[46px] italic ml-0.5"
          >
            .
          </Text>
        </View>
        <View className="flex-row items-center mt-3.5">
          <Sparkles size={12} color="#6D4BFF" />
          <Text variant="caption" className="ml-1.5 text-ink-500 dark:text-ink-300">
            Saved with intention. Surfaced with care.
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

function StatBar({ total, week, reminders }: { total: number; week: number; reminders: number }) {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 480, delay: 80 }}
      className="px-5 mt-5"
    >
      <View className="flex-row items-stretch bg-white dark:bg-ink-800 rounded-2xl border border-paper-200/70 dark:border-ink-700/50 overflow-hidden">
        <Stat label="Saved" value={total} />
        <Divider />
        <Stat label="This week" value={week} accent />
        <Divider />
        <Stat label="Reminders" value={reminders} />
      </View>
    </MotiView>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View className="flex-1 px-4 py-3">
      <Text variant="eyebrow">{label}</Text>
      <View className="flex-row items-baseline mt-1">
        <Text
          style={serif}
          className={`text-[26px] leading-7 font-semibold ${accent ? 'text-accent' : 'text-ink-900 dark:text-paper-50'}`}
        >
          {value}
        </Text>
        {accent && (
          <Text style={serif} className="text-accent italic text-base ml-1">
            ↗
          </Text>
        )}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="w-px bg-paper-200/80 dark:bg-ink-700/60 my-3" />;
}

function SectionHead({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <View className="px-5 flex-row items-end justify-between">
      <View>
        <Text variant="eyebrow">{eyebrow}</Text>
        <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[26px] italic mt-0.5">
          {title}
        </Text>
      </View>
      {caption && (
        <Text variant="caption" className="mb-1.5 lowercase italic" style={serif}>
          {caption}
        </Text>
      )}
    </View>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}
