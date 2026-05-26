import type { SourcePlatform } from '@/types';

export function detectSource(url?: string): SourcePlatform {
  if (!url) return 'note';
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('pinterest.com')) return 'pinterest';
  if (u.includes('amazon.')) return 'amazon';
  return 'web';
}

export const SOURCE_LABEL: Record<SourcePlatform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X',
  pinterest: 'Pinterest',
  amazon: 'Amazon',
  web: 'Web',
  screenshot: 'Screenshot',
  note: 'Note',
  unknown: 'Saved',
};

export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') {
        return parts[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnail(url: string): string | null {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function thumbnailForUrl(url?: string): string | null {
  if (!url) return null;
  const yt = youtubeThumbnail(url);
  if (yt) return yt;
  return null;
}

type IgKind = 'reel' | 'post' | 'story' | 'tv' | null;
function instagramKind(url: string): IgKind {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'reel' || parts[0] === 'reels') return 'reel';
    if (parts[0] === 'p') return 'post';
    if (parts[0] === 'stories') return 'story';
    if (parts[0] === 'tv') return 'tv';
  } catch {
    return null;
  }
  return null;
}

function instagramHandle(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 3 && (parts[1] === 'reel' || parts[1] === 'p')) {
      return parts[0] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function prettySlug(raw: string): string {
  const decoded = decodeURIComponent(raw).replace(/[-_]+/g, ' ').trim();
  return decoded
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function defaultTitleForUrl(url: string): string {
  const src = detectSource(url);

  if (src === 'youtube') {
    const id = youtubeVideoId(url);
    return id ? `YouTube · ${id}` : 'YouTube video';
  }

  if (src === 'instagram') {
    const kind = instagramKind(url);
    const handle = instagramHandle(url);
    const base =
      kind === 'reel'
        ? 'Instagram reel'
        : kind === 'post'
        ? 'Instagram post'
        : kind === 'story'
        ? 'Instagram story'
        : kind === 'tv'
        ? 'Instagram TV'
        : 'Instagram save';
    return handle ? `${base} · @${handle}` : base;
  }

  if (src === 'twitter') {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const handle = parts[0];
      return handle ? `Post · @${handle}` : 'X post';
    } catch {
      return 'X post';
    }
  }

  if (src === 'pinterest') return 'Pinterest pin';

  if (src === 'amazon') {
    try {
      const u = new URL(url);
      const slugPart = u.pathname.split('/').find((p) => /[a-z]{4,}-[a-z]/i.test(p));
      if (slugPart) return prettySlug(slugPart).slice(0, 80);
    } catch {
      /* noop */
    }
    return 'Amazon product';
  }

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const last = u.pathname.split('/').filter(Boolean).pop();
    if (last && last.length > 2 && !/^[A-Za-z0-9_-]{6,15}$/.test(last)) {
      const slug = prettySlug(last.replace(/\.(html?|php|aspx?)$/i, ''));
      if (slug.length > 2) return slug.slice(0, 80);
    }
    return host;
  } catch {
    return 'Saved link';
  }
}
