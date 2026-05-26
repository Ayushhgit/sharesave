import { Tabs, useSegments, router } from 'expo-router';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Home, Layers, Sparkles, Settings as SettingsIcon, type LucideIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { FAB } from '@/components/FAB';
import { Text } from '@/components/ui/Text';

const TABS: { name: 'index' | 'collections' | 'resurface' | 'settings'; label: string; Icon: LucideIcon }[] = [
  { name: 'index', label: 'Feed', Icon: Home },
  { name: 'collections', label: 'Stacks', Icon: Layers },
  { name: 'resurface', label: 'Resurface', Icon: Sparkles },
  { name: 'settings', label: 'You', Icon: SettingsIcon },
];

export default function TabsLayout() {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 8);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Feed' }} />
        <Tabs.Screen name="collections" options={{ title: 'Stacks' }} />
        <Tabs.Screen name="resurface" options={{ title: 'Resurface' }} />
        <Tabs.Screen name="settings" options={{ title: 'You' }} />
      </Tabs>

      <CustomTabBar bottomInset={bottomInset} isDark={isDark} borderColor={colors.border} />
      <FAB />
    </View>
  );
}

function CustomTabBar({
  bottomInset,
  isDark,
  borderColor,
}: {
  bottomInset: number;
  isDark: boolean;
  borderColor: string;
}) {
  const segments = useSegments() as string[];
  const last = segments[segments.length - 1] ?? '';
  const activeName =
    last === 'collections'
      ? 'collections'
      : last === 'resurface'
      ? 'resurface'
      : last === 'settings'
      ? 'settings'
      : 'index';
  const h = useHaptics();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: bottomInset,
        height: 64,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 32,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor,
          shadowColor: '#0A0A0B',
          shadowOpacity: isDark ? 0.5 : 0.18,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        }}
      >
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: isDark ? 'rgba(20,19,18,0.6)' : 'rgba(251,248,243,0.7)' },
          ]}
        />
        <View className="flex-1 flex-row items-center justify-around px-2">
          {TABS.map(({ name, label, Icon }) => {
            const active = activeName === name;
            return (
              <Pressable
                key={name}
                onPress={() => {
                  h.select();
                  if (name === 'index') router.replace('/(tabs)');
                  else router.replace(`/(tabs)/${name}` as `/(tabs)/${typeof name}`);
                }}
                className="items-center justify-center px-3 py-2"
                style={{ minWidth: 64 }}
              >
                {active && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 220 }}
                    style={{
                      position: 'absolute',
                      top: 2,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#6D4BFF',
                    }}
                  />
                )}
                <Icon
                  size={20}
                  color={active ? (isDark ? '#FBF8F3' : '#0A0A0B') : '#A8A296'}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <Text
                  className="mt-0.5"
                  style={{
                    fontSize: 10,
                    fontWeight: active ? '600' : '500',
                    letterSpacing: 0.4,
                    color: active ? (isDark ? '#FBF8F3' : '#0A0A0B') : '#A8A296',
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
