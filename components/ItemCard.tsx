import { Pressable, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Bell, Clock, Bookmark } from 'lucide-react-native';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { CategoryBadge } from './CategoryBadge';
import { SourceTag } from './SourceTag';
import { SourcePlaceholder } from './SourcePlaceholder';
import { CATEGORIES } from '@/constants/categories';
import { relativeDate, truncate } from '@/utils/format';
import { useHaptics } from '@/hooks/useHaptics';
import type { SavedItem } from '@/types';

interface Props {
  item: SavedItem;
  layout?: 'grid' | 'list';
  index?: number;
}

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export function ItemCard({ item, layout = 'grid', index = 0 }: Props) {
  const h = useHaptics();
  const isGrid = layout === 'grid';
  const cat = CATEGORIES[item.category];

  const onPress = () => {
    h.select();
    router.push(`/item/${item.id}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 360, delay: Math.min(index, 8) * 50 }}
      className={isGrid ? 'flex-1' : 'w-full'}
    >
      <Pressable onPress={onPress}>
        <Card padded={false} className="overflow-hidden">
          {isGrid ? (
            <View>
              <View className="relative">
                {item.thumbnail ? (
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={{ width: '100%', aspectRatio: 3 / 4 }}
                    contentFit="cover"
                    transition={400}
                  />
                ) : (
                  <SourcePlaceholder source={item.source} aspectRatio={3 / 4} size="lg" />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.55)']}
                  start={{ x: 0.5, y: 0.4 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '55%',
                  }}
                />
                <View className="absolute top-2.5 left-2.5">
                  <View className="bg-white/95 dark:bg-ink-900/90 rounded-full px-2 py-1 flex-row items-center">
                    <SourceTag source={item.source} compact />
                  </View>
                </View>
                {item.reminder && (
                  <View className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-accent items-center justify-center">
                    <Bell size={12} color="#fff" />
                  </View>
                )}
                <View className="absolute left-3 right-3 bottom-3">
                  <Text
                    style={[serif, { color: '#fff' }]}
                    className="text-[16px] leading-tight font-semibold"
                  >
                    {truncate(item.title, 60)}
                  </Text>
                </View>
              </View>
              <View
                className="px-3 pt-2.5 pb-3 border-t"
                style={{ borderColor: `${cat.color}1A` }}
              >
                <Text variant="caption" className="leading-snug" numberOfLines={2}>
                  {truncate(item.summary, 80)}
                </Text>
                <View className="flex-row items-center justify-between mt-2.5">
                  <CategoryBadge id={item.category} small />
                  <View className="flex-row items-center">
                    <Clock size={10} color="#A8A296" />
                    <Text variant="caption" className="ml-1 text-[10px]">
                      {relativeDate(item.createdAt).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row p-3.5">
              <View className="relative">
                {item.thumbnail ? (
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={{ width: 92, height: 116, borderRadius: 14 }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{ width: 92, height: 116 }}>
                    <SourcePlaceholder
                      source={item.source}
                      width={92}
                      height={116}
                      rounded={14}
                      size="sm"
                    />
                  </View>
                )}
                <View
                  className="absolute -top-1 -left-1 w-5 h-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: cat.color }}
                >
                  <Bookmark size={9} color="#fff" />
                </View>
              </View>
              <View className="flex-1 ml-3.5 justify-between">
                <View>
                  <View className="flex-row items-center justify-between mb-1">
                    <SourceTag source={item.source} compact />
                    {item.reminder && <Bell size={11} color="#6D4BFF" />}
                  </View>
                  <Text
                    style={serif}
                    className="text-[16px] mt-0.5 text-ink-900 dark:text-paper-50 font-semibold leading-snug"
                  >
                    {truncate(item.title, 64)}
                  </Text>
                  <Text variant="caption" className="mt-1 leading-snug">
                    {truncate(item.summary, 80)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <CategoryBadge id={item.category} small />
                  <Text variant="caption" className="text-[10px] uppercase tracking-wider">
                    {relativeDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>
      </Pressable>
    </MotiView>
  );
}
