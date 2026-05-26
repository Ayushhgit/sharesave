import { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './ui/Text';

const STEPS = [
  'Reading the source',
  'Understanding intent',
  'Summarizing key points',
  'Choosing a category',
];

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export function AIProcessingModal() {
  const visible = useUIStore((s) => s.aiProcessing);
  const { isDark } = useTheme();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStep(0);
      return;
    }
    const t = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 1100);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <AnimatePresence>
        {visible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 280 }}
            style={{ flex: 1 }}
          >
            <BlurView
              intensity={isDark ? 70 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            >
              <View style={{ flex: 1 }} className="items-center justify-center px-8">
                <View className="relative w-32 h-32 items-center justify-center mb-8">
                  {[0, 1, 2].map((i) => (
                    <MotiView
                      key={i}
                      from={{ scale: 0.6, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{
                        type: 'timing',
                        duration: 1800,
                        loop: true,
                        delay: i * 500,
                      }}
                      className="absolute w-28 h-28 rounded-full"
                      style={{ backgroundColor: 'rgba(109,75,255,0.32)' }}
                    />
                  ))}
                  <LinearGradient
                    colors={['#8B6BFF', '#6D4BFF', '#3A22A8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#6D4BFF',
                      shadowOpacity: 0.5,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 8 },
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        right: 6,
                        height: 28,
                        borderRadius: 16,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }}
                    />
                    <Sparkles size={28} color="#fff" />
                  </LinearGradient>
                </View>

                <Text variant="eyebrow" className="mb-3">
                  Intent · processing
                </Text>
                <Text
                  style={serif}
                  className="text-ink-900 dark:text-paper-50 text-[32px] italic text-center leading-[36px] mb-5"
                >
                  thinking{'.'}{'.'}{'.'}
                </Text>
                <AnimatePresence exitBeforeEnter>
                  <MotiView
                    key={step}
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -8 }}
                    transition={{ type: 'timing', duration: 280 }}
                  >
                    <Text variant="bodyMuted" className="text-center">
                      {STEPS[step]}…
                    </Text>
                  </MotiView>
                </AnimatePresence>

                <View className="flex-row gap-1.5 mt-6">
                  {STEPS.map((_, i) => (
                    <View
                      key={i}
                      className="h-1 rounded-full"
                      style={{
                        width: i === step ? 24 : 8,
                        backgroundColor: i === step ? '#6D4BFF' : isDark ? '#3B3833' : '#D4CFC4',
                      }}
                    />
                  ))}
                </View>
              </View>
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}
