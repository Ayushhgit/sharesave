import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns';

export function relativeDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

export function shortDate(iso: string): string {
  return format(new Date(iso), 'MMM d');
}

export function fullDateTime(iso: string): string {
  return format(new Date(iso), "EEE, MMM d 'at' h:mma");
}

export function domainFrom(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}
