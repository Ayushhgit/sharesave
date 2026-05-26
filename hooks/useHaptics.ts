import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const safe = (fn: () => Promise<unknown>) => () => {
    if (Platform.OS === 'web') return;
    fn().catch(() => undefined);
  };

  return {
    light: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    medium: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    heavy: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
    success: safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
    warning: safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
    select: safe(() => Haptics.selectionAsync()),
  };
}
