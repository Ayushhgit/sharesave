import { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, User, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';

export default function Signup() {
  const { signUp } = useAuth();
  const h = useHaptics();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const submit = async () => {
    setError(undefined);
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      h.success();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign up');
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

        <View className="flex-1 px-6 mt-8">
          <Text className="text-ink-900 dark:text-white text-4xl font-semibold tracking-tight">Make space.</Text>
          <Text variant="bodyMuted" className="mt-2">
            Two minutes to a calmer feed.
          </Text>

          <View className="mt-8 gap-4">
            <Input
              label="Name"
              placeholder="Your name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              leading={<User size={16} color="#85858F" />}
            />
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
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leading={<Lock size={16} color="#85858F" />}
              error={error}
              hint="Strong passwords keep your saves yours."
            />
          </View>

          <View className="mt-7">
            <Button
              label="Create account"
              full
              size="lg"
              loading={loading}
              onPress={submit}
              disabled={password.length < 6 || !email.includes('@')}
            />
          </View>
        </View>

        <View className="px-6 pb-6 items-center">
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text variant="bodyMuted">
              Already have an account?{' '}
              <Text className="text-accent font-semibold">Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
