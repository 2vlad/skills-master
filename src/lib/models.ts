export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Лучший баланс качества и скорости',
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'Быстрая и компактная модель',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
