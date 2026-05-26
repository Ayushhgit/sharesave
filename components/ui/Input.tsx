import { useState, forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { cn } from '@/utils/format';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, hint, error, leading, trailing, containerClassName, className, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      <View
        className={cn(
          'flex-row items-center rounded-2xl px-4 h-14 border bg-white dark:bg-ink-800',
          focused
            ? 'border-accent'
            : error
            ? 'border-rose'
            : 'border-ink-100 dark:border-ink-700'
        )}
      >
        {leading && <View className="mr-3">{leading}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor="#85858F"
          className={cn(
            'flex-1 text-ink-900 dark:text-white text-base',
            className
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing && <View className="ml-3">{trailing}</View>}
      </View>
      {(hint || error) && (
        <Text variant="caption" className={cn('mt-1.5', error && 'text-rose')}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
});
