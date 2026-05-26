import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/utils/format';

type Variant =
  | 'display'
  | 'displaySerif'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyMuted'
  | 'caption'
  | 'label'
  | 'eyebrow'
  | 'mono';

const variants: Record<Variant, string> = {
  display: 'text-4xl text-ink-900 dark:text-paper-50 tracking-tight font-semibold',
  displaySerif:
    'text-ink-900 dark:text-paper-50 font-serif italic tracking-tight',
  title: 'font-semibold text-xl text-ink-900 dark:text-paper-50',
  subtitle: 'font-medium text-base text-ink-700 dark:text-ink-200',
  body: 'text-base text-ink-800 dark:text-ink-100',
  bodyMuted: 'text-base text-ink-500 dark:text-ink-300',
  caption: 'text-xs text-ink-500 dark:text-ink-300',
  label: 'text-2xs uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300 font-medium font-mono',
  eyebrow: 'text-2xs uppercase tracking-[0.32em] text-ink-400 dark:text-ink-300 font-mono',
  mono: 'text-sm text-ink-700 dark:text-ink-200 font-mono',
};

interface Props extends TextProps {
  variant?: Variant;
}

export function Text({ variant = 'body', className, ...rest }: Props) {
  return <RNText className={cn(variants[variant], className)} {...rest} />;
}
