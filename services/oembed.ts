import axios from 'axios';
import { detectSource } from '@/utils/source';

export interface UrlMeta {
  title?: string;
  author?: string;
  thumbnail?: string;
  description?: string;
  provider?: string;
  html?: string;
}

const TIMEOUT = 8000;

async function safeGet<T = unknown>(url: string, params: Record<string, string>): Promise<T | null> {
  try {
    const { data } = await axios.get<T>(url, {
      params,
      timeout: TIMEOUT,
      headers: { Accept: 'application/json' },
    });
    return data;
  } catch {
    return null;
  }
}

function pick(d: Record<string, unknown> | null, key: string): string | undefined {
  if (!d) return undefined;
  const v = d[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export async function fetchUrlMeta(url: string): Promise<UrlMeta | null> {
  const src = detectSource(url);

  if (src === 'youtube') {
    const d = await safeGet<Record<string, unknown>>(
      'https://www.youtube.com/oembed',
      { url, format: 'json' }
    );
    if (d) {
      return {
        title: pick(d, 'title'),
        author: pick(d, 'author_name'),
        thumbnail: pick(d, 'thumbnail_url'),
        provider: 'YouTube',
      };
    }
  }

  const d = await safeGet<Record<string, unknown>>('https://noembed.com/embed', { url });
  if (d && !d.error) {
    return {
      title: pick(d, 'title'),
      author: pick(d, 'author_name'),
      thumbnail: pick(d, 'thumbnail_url'),
      description: pick(d, 'description'),
      provider: pick(d, 'provider_name'),
    };
  }

  return null;
}
