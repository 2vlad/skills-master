export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Быстрая и дешёвая модель',
  },
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    description: 'Качественная модель OpenAI',
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
