'use client';

import { BookOpen, Mic, Video } from 'lucide-react';

export type GenerationMode = 'curriculum' | 'audio' | 'video';

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (value: GenerationMode) => void;
  disabled?: boolean;
}

const modes = [
  { 
    id: 'curriculum' as const, 
    name: 'Curriculum', 
    description: 'Подробный учебный план',
    icon: BookOpen,
  },
  { 
    id: 'audio' as const, 
    name: 'Аудио-курс', 
    description: 'Подкаст (~5 сек на урок)',
    icon: Mic,
  },
  { 
    id: 'video' as const, 
    name: 'Видео-курс', 
    description: 'AI-аватар (~1-2 мин)',
    icon: Video,
  },
];

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
        Формат контента
      </label>
      <div className="space-y-2">
        {modes.map((mode) => {
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
                  ? 'bg-[#1d1d1f]' 
                  : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-white/20' : 'bg-white'}
              `}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#1d1d1f]'}`} />
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
    </div>
  );
}
