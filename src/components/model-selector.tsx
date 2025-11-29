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
      <label htmlFor="model" className="block text-sm font-medium text-[#1d1d1f] mb-2">
        Модель
      </label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`apple-select ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
