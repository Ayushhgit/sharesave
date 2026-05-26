import { api } from './api';
import { groqService } from './groq';
import { fetchUrlMeta, type UrlMeta } from './oembed';
import { ENV } from '@/constants/env';
import { MOCK_ITEMS } from '@/utils/mockData';
import { uid } from '@/utils/id';
import { detectSource, defaultTitleForUrl, thumbnailForUrl } from '@/utils/source';
import type {
  SavedItem,
  SavePayload,
  IntentCategoryId,
  ProcessedSave,
  ActionItem,
} from '@/types';
import { CATEGORY_TO_COLLECTION } from '@/constants/categories';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function inferCategory(payload: SavePayload, meta?: UrlMeta | null): IntentCategoryId {
  const s = `${payload.url ?? ''} ${payload.note ?? ''} ${meta?.title ?? ''} ${meta?.description ?? ''}`.toLowerCase();
  if (/recipe|cook|miso|pasta|dinner|food|baking/.test(s)) return 'recipe';
  if (/amazon|buy|shop|product|wishlist/.test(s)) return 'buy';
  if (/youtube|video|reel|watch|short/.test(s)) return 'watch';
  if (/lisbon|travel|flight|hotel|trip|destination/.test(s)) return 'travel';
  if (/career|salary|interview|role/.test(s)) return 'career';
  if (/idea|startup|build|saas|founder/.test(s)) return 'business';
  if (/gym|run|stretch|mobility|fitness|workout|yoga/.test(s)) return 'fitness';
  if (/aesthetic|moodboard|color|design/.test(s)) return 'inspiration';
  return 'learn';
}

function fakeActions(): ActionItem[] {
  return [
    { id: uid('a'), label: 'Decide if this still matters in 7 days', done: false },
    { id: uid('a'), label: 'Add to weekend queue', done: false },
  ];
}

export const itemsService = {
  async list(): Promise<SavedItem[]> {
    if (ENV.USE_MOCKS) {
      await sleep(280);
      return MOCK_ITEMS;
    }
    const { data } = await api.get<SavedItem[]>('/items');
    return data;
  },

  async get(id: string): Promise<SavedItem> {
    if (ENV.USE_MOCKS) {
      await sleep(180);
      const found = MOCK_ITEMS.find((i) => i.id === id);
      if (!found) throw new Error('Not found');
      return found;
    }
    const { data } = await api.get<SavedItem>(`/items/${id}`);
    return data;
  },

  async save(payload: SavePayload): Promise<ProcessedSave> {
    const source = payload.source ?? detectSource(payload.url);

    // 1. Fetch real metadata first (oembed → noembed). Source of truth for title/thumb/author.
    const meta: UrlMeta | null = payload.url ? await fetchUrlMeta(payload.url) : null;

    const hasContent = Boolean(
      meta?.title || meta?.description || payload.note?.trim() || payload.imageUri
    );

    // 2. If groq is configured AND we have real content, let it analyze.
    if (groqService.isConfigured() && hasContent) {
      const analysis = await groqService.analyzeSave(payload, meta);
      const item: SavedItem = {
        id: uid('itm'),
        url: payload.url,
        title: analysis.title,
        source,
        thumbnail:
          payload.imageUri ??
          meta?.thumbnail ??
          (payload.url ? thumbnailForUrl(payload.url) ?? undefined : undefined),
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        actions: analysis.actions.map((label) => ({ id: uid('a'), label, done: false })),
        category: analysis.category,
        collection: CATEGORY_TO_COLLECTION[analysis.category],
        tags: analysis.tags,
        notes: payload.note,
        ocrText: analysis.ocrText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        item,
        detectedCategory: analysis.category,
        confidence: analysis.confidence,
      };
    }

    // 3. Groq not configured but we got meta — use meta directly (no hallucination).
    if (meta?.title) {
      const category = inferCategory(payload, meta);
      const item: SavedItem = {
        id: uid('itm'),
        url: payload.url,
        title: meta.title,
        source,
        thumbnail:
          payload.imageUri ??
          meta.thumbnail ??
          (payload.url ? thumbnailForUrl(payload.url) ?? undefined : undefined),
        summary:
          meta.description ??
          `${meta.title}${meta.author ? ` — by ${meta.author}` : ''}`,
        keyPoints: [
          meta.author ? `By ${meta.author}` : 'Saved from the web',
          'Open the original to view in full',
          'Set a reminder to revisit',
        ],
        actions: fakeActions(),
        category,
        collection: CATEGORY_TO_COLLECTION[category],
        tags: [category, source].filter(Boolean) as string[],
        notes: payload.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { item, detectedCategory: category, confidence: 0.92 };
    }

    // 4. URL-only opaque save where metadata fetch also failed (rare — IG with bad noembed).
    if (
      payload.url &&
      !payload.note?.trim() &&
      !payload.imageUri &&
      (source === 'youtube' || source === 'instagram')
    ) {
      const category = inferCategory(payload);
      const title = defaultTitleForUrl(payload.url);
      const thumb = thumbnailForUrl(payload.url);
      const item: SavedItem = {
        id: uid('itm'),
        url: payload.url,
        title,
        source,
        thumbnail: thumb ?? undefined,
        summary:
          source === 'youtube'
            ? 'YouTube video saved. Couldn\'t fetch details — tap "Open original" to watch.'
            : 'Instagram reel saved. Couldn\'t fetch details — tap "Open original" to view.',
        keyPoints: [
          'Tap "Open original" to view in the source app',
          'Add a note so future you remembers why you saved this',
          'Set a reminder to revisit',
        ],
        actions: fakeActions(),
        category,
        collection: CATEGORY_TO_COLLECTION[category],
        tags: [category, source],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { item, detectedCategory: category, confidence: 0.7 };
    }

    // 5. Mock or real API path.
    if (ENV.USE_MOCKS) {
      await sleep(1400);
      const category = inferCategory(payload, meta);
      const item: SavedItem = {
        id: uid('itm'),
        url: payload.url,
        title:
          payload.note?.split('\n')[0]?.slice(0, 64) ||
          (payload.url ? defaultTitleForUrl(payload.url) : 'New save'),
        source,
        thumbnail:
          payload.imageUri ??
          (payload.url ? thumbnailForUrl(payload.url) ?? undefined : undefined),
        summary:
          'AI summary will appear here once the backend finishes processing your save.',
        keyPoints: [
          'Three key takeaways extracted on the server',
          'Tap to view the original source',
          'Set a reminder so this doesn’t get forgotten',
        ],
        actions: fakeActions(),
        category,
        collection: CATEGORY_TO_COLLECTION[category],
        tags: [category],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { item, detectedCategory: category, confidence: 0.86 };
    }
    const { data } = await api.post<ProcessedSave>('/save', payload);
    return data;
  },

  async categorize(text: string): Promise<IntentCategoryId> {
    if (groqService.isConfigured()) {
      return groqService.categorize(text);
    }

    if (ENV.USE_MOCKS) {
      await sleep(500);
      return inferCategory({ note: text });
    }
    const { data } = await api.post<{ category: IntentCategoryId }>('/categorize', { text });
    return data.category;
  },

  async summarize(text: string): Promise<{ summary: string; keyPoints: string[] }> {
    if (groqService.isConfigured()) {
      return groqService.summarize(text);
    }

    if (ENV.USE_MOCKS) {
      await sleep(700);
      return {
        summary: 'AI-generated summary appears here.',
        keyPoints: ['Point one', 'Point two', 'Point three'],
      };
    }
    const { data } = await api.post('/summarize', { text });
    return data as { summary: string; keyPoints: string[] };
  },

  async ocr(imageUri: string): Promise<string> {
    if (groqService.isConfigured()) {
      return groqService.ocr(imageUri);
    }

    if (ENV.USE_MOCKS) {
      await sleep(900);
      return 'Extracted text from screenshot would appear here. Alfama, Lisbon — golden hour.';
    }
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      name: 'screenshot.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    const { data } = await api.post<{ text: string }>('/ocr', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.text;
  },

  async setReminder(itemId: string, scheduledFor: string, preset?: string) {
    if (ENV.USE_MOCKS) {
      await sleep(200);
      return { id: uid('rem'), itemId, scheduledFor, preset };
    }
    const { data } = await api.post('/reminder', { itemId, scheduledFor, preset });
    return data;
  },
};
