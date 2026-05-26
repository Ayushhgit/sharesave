import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

export default function Welcome() {
  const { isDark } = useTheme();
  return (
    <View className="flex-1 bg-ink-900">
      <LinearGradient
        colors={['#4F36C9', '#0A0A0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className="flex-1 justify-between px-6 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700 }}
          className="mt-12"
        >
          <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
            <Text className="text-white text-2xl">✺</Text>
          </View>
          <Text className="text-white text-[44px] leading-[48px] mt-6 font-semibold">
            Save what{'\n'}you love.
          </Text>
          <Text className="text-white/60 text-[44px] leading-[48px] italic font-semibold">
            Act on it later.
          </Text>
          <Text className="text-white/70 mt-5 text-base leading-relaxed max-w-[300px]">
            Intent is an AI second brain for the reels, articles, products, and
            screenshots you save but never revisit.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 220 }}
        >
          <Button
            label="Create account"
            full
            size="lg"
            trailing={<ArrowRight size={18} color={isDark ? '#0A0A0B' : '#FFFFFF'} />}
            onPress={() => router.push('/(auth)/onboarding')}
          />
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="items-center mt-4"
          >
            <Text className="text-white/80">I already have an account</Text>
          </Pressable>
          <Text className="text-white/40 text-xs text-center mt-6">
            By continuing you agree to our Terms and Privacy.
          </Text>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}
