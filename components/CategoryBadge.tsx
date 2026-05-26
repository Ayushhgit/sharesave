import { View } from 'react-native';
import * as Lucide from 'lucide-react-native';
import { CATEGORIES } from '@/constants/categories';
import { Text } from './ui/Text';
import type { IntentCategoryId } from '@/types';

interface Props {
  id: IntentCategoryId;
  small?: boolean;
  solid?: boolean;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CategoryBadge({ id, small, solid }: Props) {
  const cat = CATEGORIES[id];
  const Icon =
    (Lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[cat.icon] ??
    Lucide.Tag;
  const iconSize = small ? 11 : 13;
  const bg = solid ? cat.color : hexToRgba(cat.color, 0.13);
  const fg = solid ? '#fff' : cat.color;
  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        backgroundColor: bg,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 3 : 4,
        borderWidth: solid ? 0 : 1,
        borderColor: solid ? 'transparent' : hexToRgba(cat.color, 0.22),
      }}
    >
      <Icon size={iconSize} color={fg} />
      <Text
        className="ml-1 font-semibold tracking-tight"
        style={{ color: fg, fontSize: small ? 10 : 11 }}
      >
        {cat.label.toUpperCase()}
      </Text>
    </View>
  );
}
