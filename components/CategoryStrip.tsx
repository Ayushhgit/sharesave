import { ScrollView, View } from 'react-native';
import * as Lucide from 'lucide-react-native';
import { CATEGORY_LIST } from '@/constants/categories';
import { useItemsStore } from '@/store/itemsStore';
import { Chip } from './ui/Chip';
import { useHaptics } from '@/hooks/useHaptics';

export function CategoryStrip() {
  const active = useItemsStore((s) => s.activeCategory);
  const setActive = useItemsStore((s) => s.setCategory);
  const items = useItemsStore((s) => s.items);
  const h = useHaptics();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 2 }}
    >
      <Chip
        label={`All · ${items.length}`}
        selected={active === 'all'}
        onPress={() => {
          h.select();
          setActive('all');
        }}
      />
      {CATEGORY_LIST.map((c) => {
        const Icon = (Lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[c.icon] ?? Lucide.Tag;
        const selected = active === c.id;
        const count = items.filter((i) => i.category === c.id).length;
        return (
          <Chip
            key={c.id}
            label={count > 0 ? `${c.label} · ${count}` : c.label}
            selected={selected}
            tone={c.color}
            onPress={() => {
              h.select();
              setActive(c.id);
            }}
            icon={<Icon size={13} color={selected ? '#fff' : c.color} />}
          />
        );
      })}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}
