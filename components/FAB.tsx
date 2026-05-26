import { Pressable, View } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/store/uiStore';
import { useHaptics } from '@/hooks/useHaptics';

export function FAB() {
  const open = useUIStore((s) => s.openSave);
  const h = useHaptics();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 22,
        bottom: 74 + insets.bottom,
      }}
    >
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: 36,
            borderWidth: 1,
            borderColor: 'rgba(109, 75, 255, 0.25)',
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick save"
          onPress={() => {
            h.medium();
            open();
          }}
          style={{
            shadowColor: '#6D4BFF',
            shadowOpacity: 0.5,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={['#8B6BFF', '#6D4BFF', '#3A22A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                right: 4,
                height: 24,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            />
            <Plus size={26} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </MotiView>
    </View>
  );
}
