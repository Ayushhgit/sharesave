export interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  body: string;
  accent: [string, string];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'why',
    emoji: '🧠',
    title: 'Your second brain, on purpose',
    body: 'Save reels, articles, products, and screenshots. Intent remembers why you saved them.',
    accent: ['#7C5CFF', '#4F36C9'],
  },
  {
    id: 'how',
    emoji: '✨',
    title: 'AI organizes the chaos',
    body: 'Each save gets a summary, a category, and the next action — automatically.',
    accent: ['#4FB6FF', '#7C5CFF'],
  },
  {
    id: 'when',
    emoji: '🔁',
    title: 'Resurfaced when it matters',
    body: 'Tonight, the weekend, payday, or someday. Intent nudges you at the right moment.',
    accent: ['#FF6B8A', '#FF8A5C'],
  },
];
