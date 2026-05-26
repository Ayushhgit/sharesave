import axios from 'axios';

import { CATEGORIES } from '@/constants/categories';
import { ENV } from '@/constants/env';
import type { IntentCategoryId, SavePayload } from '@/types';
import type { UrlMeta } from './oembed';

type GroqImageContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | GroqImageContent[];
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type GroqSaveAnalysis = {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  actions?: string[];
  category?: string;
  tags?: string[];
  confidence?: number;
};

const CATEGORY_IDS = Object.keys(CATEGORIES) as IntentCategoryId[];

function hasGroqKey(): boolean {
  const key = ENV.GROQ.API_KEY.trim();
  return Boolean(key && key !== 'REPLACE_ME');
}

function client() {
  if (!hasGroqKey()) {
    throw new Error('Groq API key is not configured');
  }

  return axios.create({
    baseURL: ENV.GROQ.BASE_URL,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.GROQ.API_KEY}`,
    },
  });
}

function parseJson<T>(content?: string | null): T {
  if (!content) throw new Error('Groq returned an empty response');
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Groq returned non-JSON content');
    return JSON.parse(match[0]) as T;
  }
}

async function chatJson<T>({
  messages,
  model = ENV.GROQ.MODEL,
  maxCompletionTokens = 800,
}: {
  messages: GroqMessage[];
  model?: string;
  maxCompletionTokens?: number;
}): Promise<T> {
  const { data } = await client().post<GroqChatResponse>('/chat/completions', {
    model,
    messages,
    temperature: 0.2,
    max_completion_tokens: maxCompletionTokens,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' },
  });

  return parseJson<T>(data.choices?.[0]?.message?.content);
}

function cleanString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function cleanStringList(value: unknown, fallback: string[], limit: number): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned.slice(0, limit) : fallback;
}

function normalizeCategory(value: unknown): IntentCategoryId {
  return CATEGORY_IDS.includes(value as IntentCategoryId)
    ? (value as IntentCategoryId)
    : 'learn';
}

function normalizeConfidence(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0.75;
  return Math.max(0, Math.min(1, value));
}

function fallbackTitle(payload: SavePayload): string {
  const noteTitle = payload.note?.split('\n')[0]?.trim();
  if (noteTitle) return noteTitle.slice(0, 64);

  if (payload.url) {
    try {
      return new URL(payload.url).hostname.replace('www.', '');
    } catch {
      return payload.url.slice(0, 64);
    }
  }

  return payload.imageUri ? 'Screenshot save' : 'New save';
}

function categoryGuide(): string {
  return CATEGORY_IDS.map((id) => `${id}: ${CATEGORIES[id].description}`).join('\n');
}

async function imageUriToGroqUrl(uri: string): Promise<string> {
  if (/^https?:\/\//i.test(uri) || uri.startsWith('data:')) return uri;

  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read image for Groq OCR');
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not encode image for Groq OCR'));
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

async function extractImageText(imageUri: string): Promise<string> {
  const imageUrl = await imageUriToGroqUrl(imageUri);
  const result = await chatJson<{ text?: string }>({
    model: ENV.GROQ.VISION_MODEL,
    maxCompletionTokens: 900,
    messages: [
      {
        role: 'system',
        content:
          'Extract visible text from images and add a short factual description. Return JSON only.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Return {"text":"..."} with all visible text and any useful visual context for saving this item.',
          },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return cleanString(result.text);
}

function saveContext(payload: SavePayload, imageContext?: string, meta?: UrlMeta | null): string {
  const metaParts = meta
    ? [
        meta.title ? `Source title: ${meta.title}` : '',
        meta.author ? `Author: ${meta.author}` : '',
        meta.provider ? `Provider: ${meta.provider}` : '',
        meta.description ? `Source description: ${meta.description}` : '',
      ].filter(Boolean)
    : [];

  const parts = [
    payload.url ? `URL: ${payload.url}` : '',
    metaParts.length ? `Verified source metadata (use this — do not invent):\n${metaParts.join('\n')}` : '',
    payload.note ? `User note:\n${payload.note}` : '',
    imageContext ? `Screenshot OCR and visual context:\n${imageContext}` : '',
  ].filter(Boolean);

  return parts.join('\n\n') || 'No content was provided.';
}

export const groqService = {
  isConfigured: hasGroqKey,

  async analyzeSave(
    payload: SavePayload,
    meta?: UrlMeta | null
  ): Promise<{
    title: string;
    summary: string;
    keyPoints: string[];
    actions: string[];
    category: IntentCategoryId;
    tags: string[];
    confidence: number;
    ocrText?: string;
  }> {
    const ocrText = payload.imageUri ? await extractImageText(payload.imageUri) : undefined;
    const result = await chatJson<GroqSaveAnalysis>({
      maxCompletionTokens: 900,
      messages: [
        {
          role: 'system',
          content:
            'You analyze saved links, notes, and screenshots for a second-brain app. You CANNOT open URLs. When verified source metadata is provided, treat it as ground truth and base title/summary on it. When only a URL is provided with no metadata, do not invent specifics — say it is a saved link and ask the user to add a note. Return JSON only.',
        },
        {
          role: 'user',
          content: `Categories:\n${categoryGuide()}\n\nSaved item:\n${saveContext(
            payload,
            ocrText,
            meta
          )}\n\nReturn JSON with keys: title, summary, keyPoints, actions, category, tags, confidence. Use the verified source title verbatim (or close) for the title field when present. summary must be one factual sentence grounded only in supplied metadata, note, or OCR — never invent content. keyPoints must have 3 concise strings drawn only from supplied content. actions must have 2 concise strings. tags must have 1 to 5 lowercase strings. confidence is 0 to 1. category must be one of: ${CATEGORY_IDS.join(
            ', '
          )}.`,
        },
      ],
    });

    const category = normalizeCategory(result.category);

    return {
      title: cleanString(result.title, fallbackTitle(payload)).slice(0, 80),
      summary: cleanString(
        result.summary,
        'Saved and categorized by Groq. Add notes or set a reminder when you are ready to act.'
      ),
      keyPoints: cleanStringList(result.keyPoints, ['Review the original save'], 4),
      actions: cleanStringList(
        result.actions,
        ['Decide if this still matters in 7 days', 'Add to weekend queue'],
        3
      ),
      category,
      tags: Array.from(new Set([category, ...cleanStringList(result.tags, [], 5)])),
      confidence: normalizeConfidence(result.confidence),
      ocrText,
    };
  },

  async categorize(text: string): Promise<IntentCategoryId> {
    const result = await chatJson<{ category?: string }>({
      maxCompletionTokens: 120,
      messages: [
        {
          role: 'system',
          content: 'Classify saved content into exactly one Intent category. Return JSON only.',
        },
        {
          role: 'user',
          content: `Categories:\n${categoryGuide()}\n\nContent:\n${text}\n\nReturn {"category":"one_of_the_category_ids"}.`,
        },
      ],
    });

    return normalizeCategory(result.category);
  },

  async summarize(text: string): Promise<{ summary: string; keyPoints: string[] }> {
    const result = await chatJson<{ summary?: string; keyPoints?: string[] }>({
      maxCompletionTokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'Summarize saved content for a second-brain app. Return compact, useful JSON only.',
        },
        {
          role: 'user',
          content:
            `Content:\n${text}\n\nReturn {"summary":"one sentence","keyPoints":["point 1","point 2","point 3"]}.`,
        },
      ],
    });

    return {
      summary: cleanString(result.summary, 'Saved for later review.'),
      keyPoints: cleanStringList(result.keyPoints, ['Review the original save'], 4),
    };
  },

  async ocr(imageUri: string): Promise<string> {
    return extractImageText(imageUri);
  },
};
