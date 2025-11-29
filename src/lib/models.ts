export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Лучший баланс качества и скорости',
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Максимальное качество',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Быстрый и качественный',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Google Gemini',
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Open Source модель',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
