import { View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { cn } from '@/utils/format';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
  className?: string;
}

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export function Avatar({ uri, name, size = 38, className }: Props) {
  const initials = (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (uri) {
    return (
      <View
        className={cn(className)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: 2,
          backgroundColor: 'rgba(109,75,255,0.18)',
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
          contentFit="cover"
        />
      </View>
    );
  }
  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(109,75,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(109,75,255,0.28)',
      }}
    >
      <Text
        className="text-accent font-semibold italic"
        style={[serif, { fontSize: size * 0.42 }]}
      >
        {initials}
      </Text>
    </View>
  );
}
