import { useRef, useState } from 'react';
import { View, TextInput, Pressable, Platform } from 'react-native';
import { Search, X, Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useItemsStore } from '@/store/itemsStore';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './ui/Text';

interface Props {
  placeholder?: string;
  showSemantic?: boolean;
}

export function SearchBar({
  placeholder = 'Search your second brain',
  showSemantic = true,
}: Props) {
  const query = useItemsStore((s) => s.query);
  const setQuery = useItemsStore((s) => s.setQuery);
  const [focused, setFocused] = useState(false);
  const ref = useRef<TextInput>(null);
  const { isDark } = useTheme();

  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <MotiView
        animate={{ scale: focused ? 1.005 : 1 }}
        transition={{ type: 'timing', duration: 160 }}
        className="relative"
      >
        <View
          className="flex-row items-center bg-white dark:bg-ink-800 rounded-full h-14 px-5 border border-paper-200/70 dark:border-ink-700/60"
          style={{
            shadowColor: focused ? '#6D4BFF' : '#0A0A0B',
            shadowOpacity: focused ? 0.18 : 0.04,
            shadowRadius: focused ? 22 : 14,
            shadowOffset: { width: 0, height: focused ? 8 : 6 },
            elevation: focused ? 6 : 2,
          }}
        >
          <Search size={17} color={focused ? '#6D4BFF' : isDark ? '#A8A296' : '#7A7468'} />
          <TextInput
            ref={ref}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#7A7468' : '#A8A296'}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
              fontStyle: 'italic',
            }}
            className="flex-1 mx-3 text-[17px] text-ink-900 dark:text-paper-50"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              className="w-7 h-7 rounded-full bg-paper-100 dark:bg-ink-700 items-center justify-center"
            >
              <X size={13} color={isDark ? '#A8A296' : '#544F46'} />
            </Pressable>
          ) : showSemantic ? (
            <View className="flex-row items-center bg-accent/10 dark:bg-accent/20 px-2.5 py-1 rounded-full border border-accent/15">
              <Sparkles size={10} color="#6D4BFF" />
              <Text className="ml-1 text-2xs font-semibold tracking-wider text-accent uppercase">
                AI
              </Text>
            </View>
          ) : null}
        </View>
        {focused && (
          <MotiView
            from={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ type: 'timing', duration: 240 }}
            className="absolute -bottom-1 left-6 right-6 h-[2px] bg-accent rounded-full"
          />
        )}
      </MotiView>
    </Pressable>
  );
}
