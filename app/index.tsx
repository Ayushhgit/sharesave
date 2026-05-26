import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { MotiView } from 'moti';
import { useAuthStore } from '@/store/authStore';
import { Text } from '@/components/ui/Text';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-ink-900">
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 480 }}
          className="items-center"
        >
          <Text className="text-white text-5xl tracking-tight font-semibold">Intent.</Text>
          <Text className="text-ink-400 text-center mt-2">your second brain</Text>
          <ActivityIndicator className="mt-8" color="#7C5CFF" />
        </MotiView>
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/welcome" />;
}
