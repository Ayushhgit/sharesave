import '@/global.css';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';

import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useColorScheme, View } from 'react-native';

import { queryClient, persister } from '@/services/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useItemsQuery } from '@/hooks/useItems';
import { useAuthSubscription } from '@/hooks/useAuth';
import { AIProcessingModal } from '@/components/AIProcessingModal';
import { SaveSheet } from '@/features/save/SaveSheet';
import { ReminderPicker } from '@/components/ReminderPicker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function SplashHider() {
  const hydrated = useAuthStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);
  return null;
}

function ItemsBootstrap(): null {
  useItemsQuery();
  useAuthSubscription();
  return null;
}

function NotificationListener(): null {
  const router = useRouter();
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data as
        | { itemId?: string }
        | undefined;
      if (data?.itemId) router.push(`/item/${data.itemId}`);
    });
    return () => sub.remove();
  }, [router]);
  return null;
}

export default function RootLayout() {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister,
              maxAge: 1000 * 60 * 60 * 24,
              dehydrateOptions: {
                shouldDehydrateQuery: (q) => q.state.status === 'success',
              },
            }}
          >
            <View
              className={isDark ? 'dark flex-1 bg-ink-900' : 'flex-1 bg-ink-50'}
            >
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <SplashHider />
              <ItemsBootstrap />
              <NotificationListener />
              <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                    animation: 'fade',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="item/[id]"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="collection/[slug]"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="screenshot"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                  />
                </Stack>
              <SaveSheet />
              <ReminderPicker />
              <AIProcessingModal />
            </View>
          </PersistQueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
