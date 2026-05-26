import { View, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Bell,
  Sparkles,
  Download,
  Link2,
  ChevronRight,
  LogOut,
  Sun,
  Smartphone,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import type { ThemeMode } from '@/constants/theme';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { isDark } = useTheme();
  const h = useHaptics();
  const [reminders, setReminders] = useState(true);
  const [aiSummaries, setAiSummaries] = useState(true);
  const [aiResurface, setAiResurface] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-paper-50 dark:bg-ink-900" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-leaf" />
            <Text variant="eyebrow">Volume IV · Settings</Text>
          </View>
          <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] font-semibold mt-3">
            You
          </Text>
          <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[44px] leading-[46px] italic">
            &amp; yours<Text style={serif} className="text-leaf italic">.</Text>
          </Text>
        </View>

        <View className="px-5 mt-7">
          <View
            className="rounded-[22px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/50 overflow-hidden"
            style={{
              shadowColor: '#0A0A0B',
              shadowOpacity: 0.05,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 2,
            }}
          >
            <View className="flex-row items-center p-4">
              <Avatar name={user?.displayName ?? user?.email ?? 'You'} uri={user?.photoURL ?? undefined} size={52} />
              <View className="flex-1 ml-3.5">
                <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[18px] font-semibold">
                  {user?.displayName ?? 'You'}
                </Text>
                <Text variant="caption" className="mt-0.5">
                  {user?.email}
                </Text>
              </View>
              <Pressable className="px-3.5 py-1.5 rounded-full border border-ink-200 dark:border-ink-700">
                <Text className="text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wider">
                  Edit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Section title="Appearance" eyebrow="Mode">
          <View className="flex-row gap-2">
            {(
              [
                { id: 'light', label: 'Light', Icon: Sun },
                { id: 'system', label: 'System', Icon: Smartphone },
                { id: 'dark', label: 'Dark', Icon: Moon },
              ] as { id: ThemeMode; label: string; Icon: typeof Sun }[]
            ).map(({ id, label, Icon }) => {
              const active = mode === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    h.select();
                    setMode(id);
                  }}
                  className={`flex-1 py-4 rounded-2xl items-center border ${
                    active
                      ? 'bg-ink-900 dark:bg-paper-50 border-transparent'
                      : 'bg-white dark:bg-ink-800 border-paper-200/70 dark:border-ink-700/60'
                  }`}
                  style={
                    active
                      ? {
                          shadowColor: '#0A0A0B',
                          shadowOpacity: 0.12,
                          shadowRadius: 14,
                          shadowOffset: { width: 0, height: 6 },
                          elevation: 3,
                        }
                      : undefined
                  }
                >
                  <Icon
                    size={18}
                    color={active ? (isDark ? '#0A0A0B' : '#FBF8F3') : '#7A7468'}
                  />
                  <Text
                    className={`mt-2 text-[11px] uppercase tracking-wider font-semibold ${
                      active ? 'text-paper-50 dark:text-ink-900' : 'text-ink-500'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Intelligence" eyebrow="AI">
          <View
            className="rounded-[22px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/50 overflow-hidden"
          >
            <ToggleRow
              icon={<Sparkles size={15} color="#6D4BFF" />}
              label="AI summaries"
              hint="Every save gets a 1-sentence summary."
              value={aiSummaries}
              onChange={setAiSummaries}
            />
            <Divider />
            <ToggleRow
              icon={<Bell size={15} color="#6D4BFF" />}
              label="Smart reminders"
              hint="Resurface items when you're likely to act."
              value={reminders}
              onChange={setReminders}
            />
            <Divider />
            <ToggleRow
              icon={<Sparkles size={15} color="#6D4BFF" />}
              label="Resurfacing"
              hint="Memory cards on your home feed."
              value={aiResurface}
              onChange={setAiResurface}
            />
          </View>
        </Section>

        <Section title="Connections" eyebrow="Sync">
          <View className="rounded-[22px] bg-white dark:bg-ink-800 border border-paper-200/70 dark:border-ink-700/50 overflow-hidden">
            <NavRow icon={<Link2 size={15} color="#7A7468" />} label="Connected platforms" hint="Instagram, X, YouTube" />
            <Divider />
            <NavRow icon={<Download size={15} color="#7A7468" />} label="Export saved items" hint="JSON or Notion" />
          </View>
        </Section>

        <View className="px-5 mt-8">
          <Pressable
            onPress={() =>
              Alert.alert('Sign out?', 'Your saves stay safe in the cloud.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign out',
                  style: 'destructive',
                  onPress: () => signOut(),
                },
              ])
            }
            className="flex-row items-center justify-center py-4 rounded-full bg-rose/10 border border-rose/20"
          >
            <LogOut size={15} color="#FF6B8A" />
            <Text className="ml-2 font-semibold text-rose uppercase tracking-wider text-xs">Sign out</Text>
          </Pressable>
          <View className="mt-7 items-center">
            <Text style={serif} className="text-ink-400 italic text-base">
              Intent
            </Text>
            <Text variant="eyebrow" className="mt-1.5">
              v1.0.0 · made with care
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-5 mt-8">
      <View className="flex-row items-baseline justify-between mb-3">
        <Text style={serif} className="text-ink-900 dark:text-paper-50 text-[20px] italic">
          {title}
        </Text>
        {eyebrow && <Text variant="eyebrow">{eyebrow}</Text>}
      </View>
      {children}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <View className="w-9 h-9 rounded-xl bg-accent/10 dark:bg-accent/20 items-center justify-center border border-accent/15">
        {icon}
      </View>
      <View className="flex-1 ml-3.5">
        <Text className="font-semibold text-ink-900 dark:text-paper-50">{label}</Text>
        <Text variant="caption" className="mt-0.5">
          {hint}
        </Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#6D4BFF' }} />
    </View>
  );
}

function NavRow({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Pressable className="flex-row items-center px-4 py-4">
      <View className="w-9 h-9 rounded-xl bg-paper-100 dark:bg-ink-700 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1 ml-3.5">
        <Text className="font-semibold text-ink-900 dark:text-paper-50">{label}</Text>
        <Text variant="caption" className="mt-0.5">
          {hint}
        </Text>
      </View>
      <ChevronRight size={16} color="#A8A296" />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-paper-200/70 dark:bg-ink-700/50 ml-16" />;
}
