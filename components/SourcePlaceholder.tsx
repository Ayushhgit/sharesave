import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const GRADIENTS: Record<SourcePlatform, [string, string]> = {
  instagram: ['#F58529', '#DD2A7B'],
  youtube: ['#FF0033', '#990024'],
  twitter: ['#1DA1F2', '#0A6AA8'],
  pinterest: ['#E60023', '#A60019'],
  amazon: ['#FFB100', '#FF8000'],
  web: ['#7A7468', '#3B3833'],
  screenshot: ['#A98EFF', '#6D4BFF'],
  note: ['#3DD68C', '#1E8F58'],
  unknown: ['#7A7468', '#3B3833'],
};

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

interface Props {
  source: SourcePlatform;
  aspectRatio?: number;
  size?: 'sm' | 'md' | 'lg';
  width?: number;
  height?: number;
  rounded?: number;
}

export function SourcePlaceholder({
  source,
  aspectRatio,
  size = 'md',
  width,
  height,
  rounded = 0,
}: Props) {
  const Icon = ICONS[source];
  const [c1, c2] = GRADIENTS[source];
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 40 : 30;

  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: width ?? '100%',
        height,
        aspectRatio,
        borderRadius: rounded,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -20,
          bottom: -40,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      />
      <View className="items-center">
        <View
          className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border border-white/25 mb-2"
          style={{ width: iconSize + 28, height: iconSize + 28 }}
        >
          <Icon size={iconSize} color="#fff" strokeWidth={1.8} />
        </View>
        {size !== 'sm' && (
          <Text
            style={[serif, { color: '#fff' }]}
            className="italic mt-1"
          >
            {SOURCE_LABEL[source]}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}
