export type IntentCategoryId =
  | 'learn'
  | 'buy'
  | 'watch'
  | 'recipe'
  | 'fitness'
  | 'career'
  | 'business'
  | 'travel'
  | 'inspiration';

export type CollectionId =
  | 'learn'
  | 'build'
  | 'buy'
  | 'eat'
  | 'travel'
  | 'improve'
  | 'dream';

export type SourcePlatform =
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'web'
  | 'pinterest'
  | 'amazon'
  | 'screenshot'
  | 'note'
  | 'unknown';

export type ReminderPreset = 'tonight' | 'weekend' | 'next-month' | 'payday' | 'someday';

export interface Reminder {
  id: string;
  itemId: string;
  scheduledFor: string; // ISO
  preset?: ReminderPreset;
  notificationId?: string;
  fired?: boolean;
}

export interface ActionItem {
  id: string;
  label: string;
  done: boolean;
}

export interface SavedItem {
  id: string;
  url?: string;
  title: string;
  source: SourcePlatform;
  thumbnail?: string;
  summary: string;
  keyPoints: string[];
  actions: ActionItem[];
  category: IntentCategoryId;
  collection?: CollectionId;
  tags: string[];
  notes?: string;
  reminder?: Reminder;
  createdAt: string;
  updatedAt: string;
  resurfacedAt?: string;
  archived?: boolean;
  ocrText?: string;
}

export interface IntentCategory {
  id: IntentCategoryId;
  label: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

export interface Collection {
  id: CollectionId;
  label: string;
  emoji: string;
  description: string;
  accent: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface ResurfaceSuggestion {
  id: string;
  type: 'memory' | 'intent-check' | 'related' | 'weekend';
  title: string;
  body: string;
  itemIds: string[];
  cta: string;
}

export interface SavePayload {
  url?: string;
  note?: string;
  imageUri?: string;
  source?: SourcePlatform;
}

export interface ProcessedSave {
  item: SavedItem;
  detectedCategory: IntentCategoryId;
  confidence: number;
}
