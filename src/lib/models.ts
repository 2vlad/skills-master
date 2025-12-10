export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    description: 'Быстрая модель Google ($0.10/M токенов)',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Быстрая модель Anthropic ($0.80/M токенов)',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Экономичная модель OpenAI ($0.15/M токенов)',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Мощная модель Meta ($0.40/M токенов)',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
