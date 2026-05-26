import { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, ChevronLeft, Apple } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';

export default function Login() {
  const { signIn } = useAuth();
  const h = useHaptics();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const submit = async () => {
    setError(undefined);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      h.success();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center bg-white dark:bg-ink-800"
          >
            <ChevronLeft size={20} color={isDark ? '#FFFFFF' : '#0A0A0B'} />
          </Pressable>
        </View>

        <View className="flex-1 px-6 mt-10">
          <Text className="text-ink-900 dark:text-white text-4xl font-semibold tracking-tight">Welcome back.</Text>
          <Text variant="bodyMuted" className="mt-2">
            Sign in to your second brain.
          </Text>

          <View className="mt-10 gap-4">
            <Input
              label="Email"
              placeholder="you@intent.app"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leading={<Mail size={16} color="#85858F" />}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leading={<Lock size={16} color="#85858F" />}
              error={error}
            />
          </View>

          <View className="mt-7">
            <Button label="Sign in" full size="lg" loading={loading} onPress={submit} />
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
              <Text variant="caption" className="mx-3">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
            </View>
            <View className="flex-row gap-3">
              <Button label="Apple" variant="secondary" full icon={<Apple size={16} color={isDark ? '#FFFFFF' : '#0A0A0B'} />} />
              <Button label="Google" variant="secondary" full />
            </View>
          </View>
        </View>

        <View className="px-6 pb-6 items-center">
          <Pressable onPress={() => router.replace('/(auth)/signup')}>
            <Text variant="bodyMuted">
              New here?{' '}
              <Text className="text-accent font-semibold">Create an account</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
