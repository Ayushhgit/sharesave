import { useMemo, useState } from 'react';
import { View, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Link2, Type, Camera, ClipboardPaste, CheckCircle2 } from 'lucide-react-native';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SourceTag } from '@/components/SourceTag';
import { SourcePlaceholder } from '@/components/SourcePlaceholder';
import { useUIStore } from '@/store/uiStore';
import { useSaveMutation } from '@/hooks/useItems';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { detectSource, thumbnailForUrl, defaultTitleForUrl } from '@/utils/source';
import { router } from 'expo-router';

type Mode = 'url' | 'note' | 'screenshot';

const serif = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export function SaveSheet() {
  const open = useUIStore((s) => s.saveModalOpen);
  const close = useUIStore((s) => s.closeSave);
  const { mutateAsync, isPending } = useSaveMutation();
  const h = useHaptics();
  const { isDark } = useTheme();

  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const reset = () => {
    setUrl('');
    setNote('');
    setImageUri(undefined);
    setMode('url');
  };

  const onPaste = async () => {
    const raw = (await Clipboard.getStringAsync())?.trim();
    if (!raw) return;
    const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(raw) || /\.[a-z]{2,}\//i.test(raw);
    if (looksLikeUrl) {
      const normalized = raw.startsWith('http') ? raw : `https://${raw.replace(/^www\./, '')}`;
      setMode('url');
      setUrl(normalized);
    } else {
      setMode('note');
      setNote(raw);
    }
    h.light();
  };

  const onPick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow Intent to read your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setMode('screenshot');
      setImageUri(result.assets[0].uri);
    }
  };

  const trimmedUrl = url.trim();
  const isValidUrl = /^https?:\/\/\S+/i.test(trimmedUrl);
  const canSave =
    (mode === 'url' && isValidUrl) ||
    (mode === 'note' && note.trim().length > 0) ||
    (mode === 'screenshot' && Boolean(imageUri));

  const preview = useMemo(() => {
    if (mode !== 'url' || !isValidUrl) return null;
    const src = detectSource(trimmedUrl);
    return {
      source: src,
      thumb: thumbnailForUrl(trimmedUrl),
      title: defaultTitleForUrl(trimmedUrl),
    };
  }, [mode, trimmedUrl, isValidUrl]);

  const onSubmit = async () => {
    if (!canSave) return;
    h.medium();
    const payload = {
      url: mode === 'url' ? trimmedUrl : undefined,
      note: mode === 'note' ? note.trim() : undefined,
      imageUri: mode === 'screenshot' ? imageUri : undefined,
      source:
        mode === 'screenshot'
          ? ('screenshot' as const)
          : mode === 'note'
          ? ('note' as const)
          : undefined,
    };
    close();
    const result = await mutateAsync(payload);
    reset();
    router.push(`/item/${result.item.id}`);
  };

  const activeIcon = isDark ? '#FBF8F3' : '#0A0A0B';

  return (
    <Sheet open={open} onClose={close} height="auto">
      <View className="px-6 pt-3 pb-8">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-accent" />
          <Text variant="eyebrow">Quick save</Text>
        </View>
        <Text
          style={serif}
          className="text-ink-900 dark:text-paper-50 text-[28px] leading-[32px] italic mt-2"
        >
          What's worth
          <Text style={serif} className="text-accent italic"> keeping</Text>?
        </Text>
        <Text variant="bodyMuted" className="mt-2">
          Drop a link, note, or screenshot. Intent figures out the rest.
        </Text>

        <View className="flex-row mt-5 bg-paper-100 dark:bg-ink-800 rounded-full p-1 border border-paper-200/60 dark:border-ink-700/60">
          {([
            { id: 'url', label: 'Link', Icon: Link2 },
            { id: 'note', label: 'Note', Icon: Type },
            { id: 'screenshot', label: 'Image', Icon: Camera },
          ] as const).map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  h.select();
                  setMode(id);
                }}
                className={`flex-1 flex-row items-center justify-center py-2.5 rounded-full ${
                  active ? 'bg-white dark:bg-ink-700' : ''
                }`}
                style={
                  active
                    ? {
                        shadowColor: '#0A0A0B',
                        shadowOpacity: 0.08,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <Icon size={14} color={active ? activeIcon : '#A8A296'} strokeWidth={2.2} />
                <Text
                  className={`ml-2 font-semibold text-[13px] ${
                    active ? 'text-ink-900 dark:text-paper-50' : 'text-ink-400'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView className="mt-5" keyboardShouldPersistTaps="handled">
          {mode === 'url' && (
            <View>
              <View
                className={`flex-row items-center bg-white dark:bg-ink-800 rounded-2xl h-14 px-4 border ${
                  trimmedUrl.length > 0 && !isValidUrl
                    ? 'border-rose/50'
                    : 'border-paper-200/70 dark:border-ink-700/60'
                }`}
              >
                <Link2 size={17} color="#A8A296" />
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  placeholder="Paste a URL · youtube.com / instagram.com / …"
                  placeholderTextColor={isDark ? '#7A7468' : '#A8A296'}
                  className="flex-1 mx-3 text-ink-900 dark:text-paper-50 text-base"
                />
                <Pressable
                  onPress={onPaste}
                  hitSlop={10}
                  className="flex-row items-center bg-accent/12 dark:bg-accent/20 rounded-full px-3 py-1.5"
                >
                  <ClipboardPaste size={13} color="#6D4BFF" />
                  <Text className="ml-1 text-2xs uppercase tracking-wider font-semibold text-accent">
                    Paste
                  </Text>
                </Pressable>
              </View>

              {preview && (
                <View
                  className="mt-3 flex-row items-center bg-white dark:bg-ink-800 rounded-2xl p-3 border border-paper-200/70 dark:border-ink-700/60"
                  style={{
                    shadowColor: '#6D4BFF',
                    shadowOpacity: 0.08,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 2,
                  }}
                >
                  {preview.thumb ? (
                    <Image
                      source={{ uri: preview.thumb }}
                      style={{ width: 56, height: 72, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{ width: 56, height: 72 }}>
                      <SourcePlaceholder
                        source={preview.source}
                        width={56}
                        height={72}
                        rounded={12}
                        size="sm"
                      />
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <SourceTag source={preview.source} />
                    <Text
                      style={serif}
                      className="text-ink-900 dark:text-paper-50 text-[15px] mt-1 font-semibold"
                      numberOfLines={2}
                    >
                      {preview.title}
                    </Text>
                  </View>
                  <CheckCircle2 size={18} color="#3DD68C" />
                </View>
              )}

              {trimmedUrl.length > 0 && !isValidUrl && (
                <Text variant="caption" className="mt-2 text-rose">
                  Needs a full URL (https://…)
                </Text>
              )}

              <Text variant="caption" className="mt-2">
                Works with YouTube, Instagram, X, Amazon, articles — anything.
              </Text>
            </View>
          )}

          {mode === 'note' && (
            <View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Write a thought, a bookmark, or paste something to remember…"
                placeholderTextColor={isDark ? '#7A7468' : '#A8A296'}
                multiline
                className="bg-white dark:bg-ink-800 rounded-2xl px-4 py-3.5 text-ink-900 dark:text-paper-50 text-base min-h-[160px] border border-paper-200/70 dark:border-ink-700/60"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          )}

          {mode === 'screenshot' && (
            <View>
              {imageUri ? (
                <Pressable
                  onPress={onPick}
                  className="rounded-2xl overflow-hidden border border-paper-200/70 dark:border-ink-700/60"
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: 220 }}
                    contentFit="cover"
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={onPick}
                  className="bg-white dark:bg-ink-800 rounded-2xl h-[200px] items-center justify-center border border-dashed border-paper-200 dark:border-ink-700"
                >
                  <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center mb-2">
                    <Camera size={20} color="#6D4BFF" />
                  </View>
                  <Text style={serif} className="text-ink-900 dark:text-paper-50 italic text-base">
                    Pick a screenshot
                  </Text>
                  <Text variant="caption" className="mt-1">
                    We'll OCR + categorize on submit
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        <View className="mt-6">
          <Button
            label={isPending ? 'Saving…' : 'Save with Intent'}
            full
            size="lg"
            loading={isPending}
            disabled={!canSave}
            onPress={onSubmit}
          />
        </View>
      </View>
    </Sheet>
  );
}
