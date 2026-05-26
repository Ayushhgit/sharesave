import { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import * as Lucide from 'lucide-react-native';
import { Sheet } from './ui/Sheet';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { REMINDER_PRESETS } from '@/constants/reminders';
import { useItemsStore } from '@/store/itemsStore';
import { useUIStore } from '@/store/uiStore';
import { notifications } from '@/services/notifications';
import { uid } from '@/utils/id';
import { fullDateTime } from '@/utils/format';
import { useHaptics } from '@/hooks/useHaptics';
import type { ReminderPreset } from '@/types';

export function ReminderPicker() {
  const targetId = useUIStore((s) => s.reminderTargetId);
  const close = useUIStore((s) => s.closeReminder);
  const items = useItemsStore((s) => s.items);
  const setReminder = useItemsStore((s) => s.setReminder);
  const [preset, setPreset] = useState<ReminderPreset>('weekend');
  const [saving, setSaving] = useState(false);
  const h = useHaptics();

  const item = items.find((i) => i.id === targetId);
  if (!targetId) return null;

  const presetDef = REMINDER_PRESETS.find((p) => p.id === preset)!;
  const scheduled = presetDef.resolve();

  const onSave = async () => {
    setSaving(true);
    try {
      await notifications.requestPermission();
      const notifId = await notifications.schedule({
        title: 'Time to revisit',
        body: item?.title ?? 'Open your saved item',
        date: scheduled,
        data: { itemId: targetId },
      });
      setReminder(targetId, {
        id: uid('rem'),
        itemId: targetId,
        scheduledFor: scheduled.toISOString(),
        preset,
        notificationId: notifId,
      });
      h.success();
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={Boolean(targetId)} onClose={close}>
      <View className="px-6 pt-3 pb-8">
        <Text variant="title" className="mb-1">
          Remind me
        </Text>
        <Text variant="bodyMuted" className="mb-5">
          When should Intent resurface this?
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
        >
          {REMINDER_PRESETS.map((p) => {
            const Icon =
              (Lucide as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[
                p.icon
              ] ?? Lucide.Bell;
            const active = preset === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  h.select();
                  setPreset(p.id);
                }}
                className={`px-4 py-3 rounded-2xl border min-w-[120px] ${
                  active
                    ? 'bg-accent border-transparent'
                    : 'bg-transparent border-ink-200 dark:border-ink-700'
                }`}
              >
                <Icon size={18} color={active ? '#fff' : '#7C5CFF'} />
                <Text
                  className={`mt-2 font-semibold ${
                    active ? 'text-white' : 'text-ink-900 dark:text-white'
                  }`}
                >
                  {p.label}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-ink-400'}`}
                >
                  {p.hint}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-5 p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60">
          <Text variant="label">Scheduled for</Text>
          <Text className="mt-1 font-semibold text-ink-900 dark:text-white">
            {fullDateTime(scheduled.toISOString())}
          </Text>
        </View>

        <View className="mt-6">
          <Button label="Set reminder" full loading={saving} onPress={onSave} />
        </View>
      </View>
    </Sheet>
  );
}
