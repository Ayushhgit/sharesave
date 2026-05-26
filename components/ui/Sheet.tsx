import {
  Modal,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export function Sheet({ open, onClose, children, height = 'auto' }: Props) {
  const { isDark } = useTheme();
  const heightClass =
    height === 'full' ? 'h-[88%]' : height === 'half' ? 'h-[60%]' : '';

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <AnimatePresence>
        {open && (
          <MotiView
            key="backdrop"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 220 }}
            style={StyleSheet.absoluteFill}
          >
            <BlurView
              intensity={isDark ? 40 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            >
              <Pressable style={{ flex: 1 }} onPress={onClose} />
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
        pointerEvents="box-none"
      >
        <AnimatePresence>
          {open && (
            <MotiView
              key="sheet"
              from={{ translateY: 480, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              exit={{ translateY: 480, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
              className={`bg-white dark:bg-ink-900 rounded-t-[28px] ${heightClass}`}
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: -10 },
                elevation: 16,
              }}
            >
              <View className="items-center pt-2.5 pb-1">
                <View className="w-10 h-1.5 rounded-full bg-ink-200 dark:bg-ink-700" />
              </View>
              {children}
            </MotiView>
          )}
        </AnimatePresence>
      </KeyboardAvoidingView>
    </Modal>
  );
}
