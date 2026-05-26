import { View, Pressable } from 'react-native';
import { LayoutGrid, Rows3 } from 'lucide-react-native';
import { useItemsStore } from '@/store/itemsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';

export function ViewToggle() {
  const view = useItemsStore((s) => s.view);
  const setView = useItemsStore((s) => s.setView);
  const h = useHaptics();
  const { isDark } = useTheme();

  const isGrid = view === 'grid';
  const activeColor = isDark ? '#FBF8F3' : '#0A0A0B';
  const inactive = '#A8A296';

  return (
    <View className="flex-row items-center bg-white dark:bg-ink-800 rounded-full p-1 border border-paper-200/70 dark:border-ink-700/50">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Grid view"
        onPress={() => {
          h.select();
          setView('grid');
        }}
        className={`w-8 h-8 rounded-full items-center justify-center ${
          isGrid ? 'bg-paper-100 dark:bg-ink-700' : ''
        }`}
      >
        <LayoutGrid size={14} color={isGrid ? activeColor : inactive} strokeWidth={2} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="List view"
        onPress={() => {
          h.select();
          setView('list');
        }}
        className={`w-8 h-8 rounded-full items-center justify-center ${
          !isGrid ? 'bg-paper-100 dark:bg-ink-700' : ''
        }`}
      >
        <Rows3 size={14} color={!isGrid ? activeColor : inactive} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
