import type { SavedItem, ResurfaceSuggestion } from '@/types';

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const MOCK_ITEMS: SavedItem[] = [
  {
    id: 'itm_1',
    url: 'https://www.instagram.com/reel/abc',
    title: 'One-pan miso butter pasta',
    source: 'instagram',
    thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
    summary:
      'A 12-minute weeknight pasta with miso, butter, and garlic. Toasted breadcrumbs on top for crunch.',
    keyPoints: [
      'Toast panko in olive oil before plating',
      'Reserve a cup of starchy pasta water',
      'Whisk miso into butter off heat',
    ],
    actions: [
      { id: 'a1', label: 'Buy white miso paste', done: false },
      { id: 'a2', label: 'Try this Thursday', done: false },
    ],
    category: 'recipe',
    collection: 'eat',
    tags: ['quick', 'pasta', 'weeknight'],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'itm_2',
    url: 'https://youtube.com/watch?v=xyz',
    title: 'How great products get their soul',
    source: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    summary:
      'Talk by a former Arc designer on taste, restraint, and why the boring 90% matters more than the magic 10%.',
    keyPoints: [
      'Taste is a stack of micro-decisions',
      'Defaults are the product',
      'Cut features that dilute the core verb',
    ],
    actions: [
      { id: 'a1', label: 'Write a one-pager on Intent’s core verb', done: false },
      { id: 'a2', label: 'Share with cofounder', done: true },
    ],
    category: 'learn',
    collection: 'learn',
    tags: ['design', 'product', 'talk'],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: 'itm_3',
    url: 'https://www.amazon.com/dp/B0xxx',
    title: 'Aer Travel Pack 3',
    source: 'amazon',
    thumbnail: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800',
    summary:
      'Carry-on backpack. 35L, structured, separate shoe compartment. Often compared to Peak Design but stiffer.',
    keyPoints: ['$249 currently', 'Fits under most seat backs', 'Lifetime warranty'],
    actions: [
      { id: 'a1', label: 'Check if it fits 16" MBP', done: false },
      { id: 'a2', label: 'Wait for sale below $199', done: false },
    ],
    category: 'buy',
    collection: 'buy',
    tags: ['travel', 'edc', 'wishlist'],
    reminder: {
      id: 'rem_1',
      itemId: 'itm_3',
      scheduledFor: new Date(now + 14 * 86_400_000).toISOString(),
      preset: 'payday',
    },
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 'itm_4',
    title: 'Cold morning, Lisbon',
    source: 'screenshot',
    thumbnail: 'https://images.unsplash.com/photo-1513735492246-483525079686?w=800',
    summary:
      'Mood board screenshot. Pastel buildings, soft fog, tile detail. Saved while planning a Q3 trip.',
    keyPoints: ['Alfama neighborhood', 'October weather', 'Pastel de nata at Manteigaria'],
    actions: [
      { id: 'a1', label: 'Block 5 days in October', done: false },
      { id: 'a2', label: 'Find airbnb in Alfama', done: false },
    ],
    category: 'travel',
    collection: 'travel',
    tags: ['lisbon', 'autumn', 'moodboard'],
    ocrText: 'Alfama, Lisbon — Oct. golden hour.',
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
  },
  {
    id: 'itm_5',
    url: 'https://twitter.com/naval/status/1',
    title: 'Compounding skills > compounding capital, early',
    source: 'twitter',
    thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800',
    summary:
      'Short thread arguing that in your 20s, depth in a rare skill returns more than aggressive investing.',
    keyPoints: [
      'Pick a skill at the intersection of rare + valuable',
      'Compound by working in public',
      'Trade optionality for depth',
    ],
    actions: [{ id: 'a1', label: 'Pick one rare skill for this quarter', done: false }],
    category: 'career',
    collection: 'improve',
    tags: ['career', 'compounding', 'naval'],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  {
    id: 'itm_6',
    url: 'https://www.youtube.com/watch?v=mobility',
    title: '8-minute mobility flow before sitting',
    source: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    summary:
      'Hip openers, thoracic rotations, ankle drills. Designed for desk workers, no equipment.',
    keyPoints: ['90/90 hip switch', 'Wall angels x 10', 'Couch stretch 2 min/side'],
    actions: [{ id: 'a1', label: 'Try tomorrow morning', done: false }],
    category: 'fitness',
    collection: 'improve',
    tags: ['mobility', 'morning', 'desk'],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
];

export const MOCK_RESURFACE: ResurfaceSuggestion[] = [
  {
    id: 'res_1',
    type: 'memory',
    title: 'You saved this 2 weeks ago',
    body: 'Aer Travel Pack 3 — still want this, or skip?',
    itemIds: ['itm_3'],
    cta: 'Decide now',
  },
  {
    id: 'res_2',
    type: 'weekend',
    title: 'Weekend learning',
    body: '3 talks and an article you saved but never opened.',
    itemIds: ['itm_2', 'itm_5'],
    cta: 'Open queue',
  },
  {
    id: 'res_3',
    type: 'related',
    title: '3 related items detected',
    body: 'You’ve saved 3 things about travel to Lisbon. Want a collection?',
    itemIds: ['itm_4'],
    cta: 'Group them',
  },
  {
    id: 'res_4',
    type: 'intent-check',
    title: 'Still want to cook this?',
    body: 'Miso butter pasta from 2 days ago. Add miso to grocery?',
    itemIds: ['itm_1'],
    cta: 'Add to list',
  },
];
