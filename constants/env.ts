import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiUrl?: string;
  firebase?: Record<string, string>;
  groq?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    visionModel?: string;
  };
};

const groq = extra.groq ?? {};

export const ENV = {
  API_URL: extra.apiUrl ?? 'https://api.intent.app',
  FIREBASE: extra.firebase ?? {},
  GROQ: {
    API_KEY: groq.apiKey ?? '',
    BASE_URL: groq.baseUrl ?? 'https://api.groq.com/openai/v1',
    MODEL: groq.model ?? 'llama-3.1-8b-instant',
    VISION_MODEL: groq.visionModel ?? 'meta-llama/llama-4-scout-17b-16e-instruct',
  },
  USE_MOCKS: false,
};
