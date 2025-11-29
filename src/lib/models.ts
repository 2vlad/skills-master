export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'x-ai/grok-4.1-fast:free',
    name: 'Grok 4.1 Fast (бесплатно)',
    description: 'Быстрая бесплатная модель xAI',
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT-OSS 20B (бесплатно)',
    description: 'Бесплатная модель OpenAI',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Быстрая модель (платно)',
  },
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    description: 'Качественная модель (платно)',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
