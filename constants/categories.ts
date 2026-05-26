import type { IntentCategory, IntentCategoryId, Collection, CollectionId } from '@/types';

export const CATEGORIES: Record<IntentCategoryId, IntentCategory> = {
  learn: {
    id: 'learn',
    label: 'Learn',
    icon: 'GraduationCap',
    color: '#7C5CFF',
    bg: 'rgba(124,92,255,0.12)',
    description: 'Articles, lessons, and ideas to absorb',
  },
  buy: {
    id: 'buy',
    label: 'Buy Later',
    icon: 'ShoppingBag',
    color: '#FF8A5C',
    bg: 'rgba(255,138,92,0.12)',
    description: 'Products you might want to own',
  },
  watch: {
    id: 'watch',
    label: 'Watch Later',
    icon: 'PlayCircle',
    color: '#FF6B8A',
    bg: 'rgba(255,107,138,0.12)',
    description: 'Videos and reels to revisit',
  },
  recipe: {
    id: 'recipe',
    label: 'Recipe',
    icon: 'UtensilsCrossed',
    color: '#3DD68C',
    bg: 'rgba(61,214,140,0.12)',
    description: 'Food and drinks to make',
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    icon: 'Dumbbell',
    color: '#4FB6FF',
    bg: 'rgba(79,182,255,0.12)',
    description: 'Movement and training',
  },
  career: {
    id: 'career',
    label: 'Career',
    icon: 'Briefcase',
    color: '#F5B544',
    bg: 'rgba(245,181,68,0.12)',
    description: 'Skill, role, and growth ideas',
  },
  business: {
    id: 'business',
    label: 'Business Idea',
    icon: 'Lightbulb',
    color: '#A98EFF',
    bg: 'rgba(169,142,255,0.14)',
    description: 'Seeds for things to build',
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    icon: 'Plane',
    color: '#4FB6FF',
    bg: 'rgba(79,182,255,0.12)',
    description: 'Places, stays, and itineraries',
  },
  inspiration: {
    id: 'inspiration',
    label: 'Inspiration',
    icon: 'Sparkles',
    color: '#FF8A5C',
    bg: 'rgba(255,138,92,0.12)',
    description: 'Mood, aesthetic, and ideas',
  },
};

export const CATEGORY_LIST: IntentCategory[] = Object.values(CATEGORIES);

export const COLLECTIONS: Record<CollectionId, Collection> = {
  learn: { id: 'learn', label: 'Learn', emoji: '📚', accent: '#7C5CFF', description: 'Things to understand' },
  build: { id: 'build', label: 'Build', emoji: '🛠', accent: '#A98EFF', description: 'Projects and ideas' },
  buy: { id: 'buy', label: 'Buy', emoji: '🛍', accent: '#FF8A5C', description: 'Wishlist and gifts' },
  eat: { id: 'eat', label: 'Eat', emoji: '🍝', accent: '#3DD68C', description: 'Recipes and restaurants' },
  travel: { id: 'travel', label: 'Travel', emoji: '✈️', accent: '#4FB6FF', description: 'Future trips' },
  improve: { id: 'improve', label: 'Improve', emoji: '🏋️', accent: '#F5B544', description: 'Habits and skills' },
  dream: { id: 'dream', label: 'Dream', emoji: '🌙', accent: '#FF6B8A', description: 'Long-term wants' },
};

export const COLLECTION_LIST: Collection[] = Object.values(COLLECTIONS);

export const CATEGORY_TO_COLLECTION: Record<IntentCategoryId, CollectionId> = {
  learn: 'learn',
  business: 'build',
  buy: 'buy',
  recipe: 'eat',
  travel: 'travel',
  fitness: 'improve',
  career: 'improve',
  watch: 'learn',
  inspiration: 'dream',
};
