'use client';

import { AVAILABLE_MODELS } from '@/lib/models';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div>
      <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
        Модель OpenRouter
      </label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
            {model.description ? ` — ${model.description}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
