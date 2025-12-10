export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (бесплатно)',
    description: 'Быстрая бесплатная модель Google',
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT-OSS 20B (бесплатно)',
    description: 'Бесплатная модель OpenAI',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (бесплатно)',
    description: 'Мощная бесплатная модель Meta',
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B (бесплатно)',
    description: 'Большая бесплатная модель Alibaba',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
