import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Linking,
  Share,
  Alert,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ChevronLeft,
  Share2,
  ExternalLink,
  BellPlus,
  Check,
  Trash2,
  Tag as TagIcon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { SourceTag } from '@/components/SourceTag';
import { SourcePlaceholder } from '@/components/SourcePlaceholder';
import { useItemsStore } from '@/store/itemsStore';
import { useDeleteItem } from '@/hooks/useItems';
import { useUIStore } from '@/store/uiStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { fullDateTime, relativeDate } from '@/utils/format';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useItemsStore((s) => s.items.find((i) => i.id === id));
  const toggleAction = useItemsStore((s) => s.toggleAction);
  const remove = useDeleteItem();
  const update = useItemsStore((s) => s.update);
  const openReminder = useUIStore((s) => s.openReminder);
  const h = useHaptics();
  const { isDark } = useTheme();
  const [notes, setNotes] = useState(item?.notes ?? '');

  if (!item) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper-50 dark:bg-ink-900">
        <Text style={serif} className="italic text-ink-900 dark:text-paper-50 text-2xl">
          gone.
        </Text>
        <Text variant="bodyMuted" className="mt-2">
          This save isn't around anymore.
        </Text>
        <View className="mt-6">
          <Button label="Back to feed" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const onShare = async () => {
    h.light();
    await Share.share({
      message: `${item.title}${item.url ? `\n\n${item.url}` : ''}`,
    });
  };

  const onOpen = () => {
    if (!item.url) return;
    h.light();
    Linking.openURL(item.url).catch(() => undefined);
  };

  const onDelete = () => {
    h.medium();
    Alert.alert('Delete save?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(item.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-paper-50 dark:bg-ink-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="relative">
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: '100%', aspectRatio: 4 / 3 }}
              contentFit="cover"
              transition={400}
            />
          ) : (
            <SourcePlaceholder source={item.source} aspectRatio={4 / 3} size="lg" />
          )}
          <LinearGradient
            colors={['rgba(10,10,11,0.55)', 'transparent', isDark ? '#0A0A0B' : '#FBF8F3']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0">
            <View className="flex-row items-center justify-between px-5 pt-2">
              <Pressable
                onPress={() => router.back()}
                className="w-11 h-11 rounded-full bg-white/95 dark:bg-ink-800/95 items-center justify-center border border-paper-200/60 dark:border-ink-700/60"
                style={{
                  shadowColor: '#0A0A0B',
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <ChevronLeft size={20} color={isDark ? '#FBF8F3' : '#0A0A0B'} />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={onShare}
                  className="w-11 h-11 rounded-full bg-white/95 dark:bg-ink-800/95 items-center justify-center border border-paper-200/60 dark:border-ink-700/60"
                  style={{
                    shadowColor: '#0A0A0B',
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <Share2 size={17} color={isDark ? '#FBF8F3' : '#0A0A0B'} />
                </Pressable>
                <Pressable
                  onPress={onDelete}
                  className="w-11 h-11 rounded-full bg-rose/95 items-center justify-center"
                  style={{
                    shadowColor: '#FF6B8A',
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  <Trash2 size={17} color="#fff" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View className="px-5 -mt-8">
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 460 }}
            className="rounded-[24px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 p-5"
            style={{
              shadowColor: '#0A0A0B',
              shadowOpacity: 0.08,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <SourceTag source={item.source} />
              <Text variant="eyebrow">{relativeDate(item.createdAt).toUpperCase()}</Text>
            </View>
            <Text
              style={serif}
              className="text-ink-900 dark:text-paper-50 text-[28px] leading-[32px] font-semibold"
            >
              {item.title}
            </Text>
            <View className="flex-row items-center mt-4 gap-2">
              <CategoryBadge id={item.category} />
              {item.reminder && (
                <View className="flex-row items-center bg-accent/12 px-2.5 py-1 rounded-full border border-accent/20">
                  <BellPlus size={11} color="#6D4BFF" />
                  <Text className="ml-1 text-2xs uppercase tracking-wider font-semibold text-accent">
                    Scheduled
                  </Text>
                </View>
              )}
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 460, delay: 100 }}
            className="mt-4"
          >
            <View
              className="rounded-[20px] overflow-hidden bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60"
            >
              <LinearGradient
                colors={['rgba(109,75,255,0.08)', 'rgba(109,75,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View className="p-5">
                <View className="flex-row items-center mb-2.5">
                  <View className="w-7 h-7 rounded-full bg-accent/15 items-center justify-center border border-accent/25">
                    <Sparkles size={13} color="#6D4BFF" />
                  </View>
                  <Text variant="eyebrow" className="ml-2 text-accent">
                    AI · Summary
                  </Text>
                </View>
                <Text
                  style={serif}
                  className="text-[17px] leading-[24px] italic text-ink-900 dark:text-paper-50"
                >
                  "{item.summary}"
                </Text>
              </View>
            </View>
          </MotiView>

          {item.keyPoints.length > 0 && (
            <Section eyebrow="No. 01" title="Key points">
              <View className="rounded-[20px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 p-5">
                <View className="gap-4">
                  {item.keyPoints.map((kp, i) => (
                    <View key={i} className="flex-row">
                      <View className="mr-3 items-center" style={{ width: 28 }}>
                        <Text
                          style={serif}
                          className="text-accent italic text-[22px] leading-6"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </Text>
                        <View className="w-px h-3 bg-paper-200 dark:bg-ink-700 mt-1" />
                      </View>
                      <Text className="flex-1 text-[15px] text-ink-800 dark:text-ink-100 leading-[22px]">
                        {kp}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Section>
          )}

          {item.actions.length > 0 && (
            <Section eyebrow="No. 02" title="Next actions">
              <View className="rounded-[20px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 overflow-hidden">
                {item.actions.map((a, idx) => (
                  <View key={a.id}>
                    <Pressable
                      onPress={() => {
                        h.light();
                        toggleAction(item.id, a.id);
                      }}
                      className="flex-row items-center px-4 py-3.5"
                    >
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center border ${
                          a.done ? 'bg-accent border-transparent' : 'border-ink-300 dark:border-ink-600'
                        }`}
                      >
                        {a.done && <Check size={14} color="#fff" strokeWidth={3} />}
                      </View>
                      <Text
                        className={`ml-3 flex-1 text-[15px] ${
                          a.done
                            ? 'line-through text-ink-400'
                            : 'text-ink-800 dark:text-ink-100'
                        }`}
                      >
                        {a.label}
                      </Text>
                    </Pressable>
                    {idx < item.actions.length - 1 && (
                      <View className="h-px bg-paper-200/70 dark:bg-ink-700/50 ml-13" />
                    )}
                  </View>
                ))}
              </View>
            </Section>
          )}

          <Section eyebrow="No. 03" title="Reminder">
            <View
              className="rounded-[20px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 p-4 flex-row items-center"
            >
              <View className="w-11 h-11 rounded-2xl bg-accent/12 items-center justify-center border border-accent/20">
                <BellPlus size={17} color="#6D4BFF" />
              </View>
              <View className="flex-1 ml-3">
                {item.reminder ? (
                  <>
                    <Text style={serif} className="italic text-ink-900 dark:text-paper-50 text-[16px]">
                      {item.reminder.preset
                        ? item.reminder.preset.charAt(0).toUpperCase() +
                          item.reminder.preset.slice(1).replace('-', ' ')
                        : 'Scheduled'}
                    </Text>
                    <Text variant="caption" className="mt-0.5">
                      {fullDateTime(item.reminder.scheduledFor)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={serif} className="italic text-ink-900 dark:text-paper-50 text-[16px]">
                      No reminder yet
                    </Text>
                    <Text variant="caption" className="mt-0.5">
                      Bring this back when you'll act on it.
                    </Text>
                  </>
                )}
              </View>
              <Pressable
                onPress={() => openReminder(item.id)}
                className="px-3.5 py-2 rounded-full bg-ink-900 dark:bg-paper-50"
              >
                <Text className="text-paper-50 dark:text-ink-900 text-xs font-semibold uppercase tracking-wider">
                  {item.reminder ? 'Edit' : 'Set'}
                </Text>
              </Pressable>
            </View>
          </Section>

          <Section eyebrow="No. 04" title="Notes">
            <View className="rounded-[20px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60 p-4">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                onEndEditing={() => update(item.id, { notes })}
                multiline
                placeholder="Why did you save this? What would make it worth opening again?"
                placeholderTextColor={isDark ? '#7A7468' : '#A8A296'}
                className="text-ink-900 dark:text-paper-50 text-[15px] min-h-[100px] leading-[22px]"
                style={[serif, { textAlignVertical: 'top', fontStyle: 'italic' }]}
              />
            </View>
          </Section>

          {item.tags.length > 0 && (
            <Section eyebrow="No. 05" title="Tags">
              <View className="flex-row flex-wrap gap-2">
                {item.tags.map((t) => (
                  <View
                    key={t}
                    className="flex-row items-center px-3 py-1.5 rounded-full bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/60"
                  >
                    <TagIcon size={10} color="#7A7468" />
                    <Text className="ml-1.5 text-[11px] uppercase tracking-wider font-semibold text-ink-700 dark:text-ink-200">
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {item.url && (
            <View className="mt-7">
              <Pressable
                onPress={onOpen}
                className="rounded-full overflow-hidden"
                style={{
                  shadowColor: '#6D4BFF',
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 4,
                }}
              >
                <LinearGradient
                  colors={['#8B6BFF', '#6D4BFF', '#3A22A8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 56,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExternalLink size={17} color="#fff" />
                  <Text className="ml-2.5 text-white font-semibold text-base tracking-tight">
                    Open original
                  </Text>
                  <ArrowUpRight size={15} color="#fff" style={{ marginLeft: 6 }} />
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <View className="flex-row items-baseline justify-between mb-3 px-1">
        <View className="flex-row items-baseline">
          <Text variant="eyebrow">{eyebrow}</Text>
          <Text variant="eyebrow" className="mx-2">
            ·
          </Text>
          <Text style={serif} className="italic text-ink-900 dark:text-paper-50 text-[17px]">
            {title}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}
