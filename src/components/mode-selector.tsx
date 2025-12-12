'use client';

import { Mic, Video } from 'lucide-react';

export type GenerationMode = 'curriculum' | 'audio' | 'video';

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (value: GenerationMode) => void;
  disabled?: boolean;
  skillsCount: number;
}

const mediaModes = [
  { 
    id: 'audio' as const, 
    name: 'Аудио-курс', 
    description: 'Подкаст-эпизоды (~5 сек на эпизод)',
    icon: Mic,
    color: 'purple'
  },
  { 
    id: 'video' as const, 
    name: 'Видео-курс', 
    description: 'Видео с AI-аватаром (~1-2 мин)',
    icon: Video,
    color: 'blue'
  },
];

export function ModeSelector({ value, onChange, disabled, skillsCount }: ModeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
        Создать медиа-курс
      </label>
      <p className="text-xs text-[#86868b] mb-3">
        {skillsCount} эпизодов будут сгенерированы последовательно
      </p>
      <div className="space-y-2">
        {mediaModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;
          
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                ${isSelected 
                  ? 'bg-[#1d1d1f] text-white' 
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected 
                  ? 'bg-white/20' 
                  : mode.color === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
                }
              `}>
                <Icon className={`w-5 h-5 ${
                  isSelected 
                    ? 'text-white' 
                    : mode.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  {mode.name}
                </p>
                <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-[#86868b]'}`}>
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Back to curriculum button */}
      {value !== 'curriculum' && (
        <button
          type="button"
          onClick={() => onChange('curriculum')}
          disabled={disabled}
          className="w-full mt-3 text-sm text-[#0071e3] hover:underline disabled:opacity-50"
        >
          ← Назад к Curriculum
        </button>
      )}
    </div>
  );
}
