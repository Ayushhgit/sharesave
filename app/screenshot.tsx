import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Sparkles, Camera } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { itemsService } from '@/services/items';
import { useTheme } from '@/hooks/useTheme';
import type { IntentCategoryId } from '@/types';

export default function Screenshot() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const { isDark } = useTheme();
  const [imageUri, setImageUri] = useState<string | undefined>(uri);
  const [ocr, setOcr] = useState<string | null>(null);
  const [category, setCategory] = useState<IntentCategoryId | null>(null);
  const [stage, setStage] = useState<'idle' | 'ocr' | 'categorize' | 'done'>('idle');

  useEffect(() => {
    if (!imageUri) return;
    (async () => {
      setStage('ocr');
      const text = await itemsService.ocr(imageUri);
      setOcr(text);
      setStage('categorize');
      const cat = await itemsService.categorize(text);
      setCategory(cat);
      setStage('done');
    })().catch(() => setStage('done'));
  }, [imageUri]);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]) {
      setImageUri(r.assets[0].uri);
      setOcr(null);
      setCategory(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-ink-800 items-center justify-center"
        >
          <ChevronLeft size={20} color={isDark ? '#FFFFFF' : '#0A0A0B'} />
        </Pressable>
        <Text variant="label">Screenshot intelligence</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', aspectRatio: 9 / 16, borderRadius: 24 }}
            contentFit="cover"
          />
        ) : (
          <Pressable
            onPress={pick}
            className="aspect-[9/16] rounded-3xl bg-ink-100 dark:bg-ink-800 items-center justify-center border border-dashed border-ink-200 dark:border-ink-700"
          >
            <Camera size={24} color="#85858F" />
            <Text variant="bodyMuted" className="mt-2">
              Pick a screenshot
            </Text>
          </Pressable>
        )}

        {imageUri && (
          <View className="mt-5 gap-3">
            <Card padded>
              <View className="flex-row items-center mb-2">
                <Sparkles size={14} color="#7C5CFF" />
                <Text variant="label" className="ml-2 text-accent">
                  Extracted text
                </Text>
              </View>
              {stage === 'ocr' ? (
                <ProcessingShimmer label="Reading the image…" />
              ) : (
                <Text className="text-[15px] text-ink-800 dark:text-ink-100 leading-relaxed">
                  {ocr ?? '—'}
                </Text>
              )}
            </Card>

            <Card padded>
              <Text variant="label" className="mb-2">
                Suggested category
              </Text>
              {stage === 'categorize' ? (
                <ProcessingShimmer label="Choosing where this belongs…" />
              ) : category ? (
                <CategoryBadge id={category} />
              ) : (
                <Text variant="bodyMuted">Pending</Text>
              )}
            </Card>

            <Button
              label="Save this screenshot"
              full
              size="lg"
              onPress={() => router.back()}
              disabled={stage !== 'done'}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProcessingShimmer({ label }: { label: string }) {
  return (
    <View className="flex-row items-center">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 700, loop: true, repeatReverse: true }}
        className="w-2 h-2 rounded-full bg-accent mr-2"
      />
      <Text variant="bodyMuted">{label}</Text>
    </View>
  );
}
