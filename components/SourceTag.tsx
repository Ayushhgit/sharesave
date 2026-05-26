import { View } from 'react-native';
import {
  Instagram,
  Youtube,
  Twitter,
  Globe,
  ShoppingBag,
  Image as ImageIcon,
  Notebook,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from './ui/Text';
import type { SourcePlatform } from '@/types';
import { SOURCE_LABEL } from '@/utils/source';

const ICONS: Record<SourcePlatform, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  pinterest: ImageIcon,
  amazon: ShoppingBag,
  web: Globe,
  screenshot: ImageIcon,
  note: Notebook,
  unknown: Globe,
};

const COLORS: Record<SourcePlatform, string> = {
  instagram: '#E1306C',
  youtube: '#FF0033',
  twitter: '#1DA1F2',
  pinterest: '#E60023',
  amazon: '#FF9900',
  web: '#7A7468',
  screenshot: '#6D4BFF',
  note: '#544F46',
  unknown: '#7A7468',
};

interface Props {
  source: SourcePlatform;
  compact?: boolean;
}

export function SourceTag({ source, compact }: Props) {
  const Icon = ICONS[source];
  const color = COLORS[source];
  return (
    <View className="flex-row items-center">
      <Icon size={compact ? 11 : 13} color={color} strokeWidth={2} />
      <Text
        className="ml-1.5 uppercase font-semibold tracking-[0.16em]"
        style={{
          color,
          fontSize: compact ? 9 : 10,
        }}
      >
        {SOURCE_LABEL[source]}
      </Text>
    </View>
  );
}
