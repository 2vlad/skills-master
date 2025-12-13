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
    color: 'gray'
  },
  { 
    id: 'audio' as const, 
    name: 'Аудио-курс', 
    description: 'Подкаст (~5 сек на урок)',
    icon: Mic,
    color: 'purple'
  },
  { 
    id: 'video' as const, 
    name: 'Видео-курс', 
    description: 'AI-аватар (~1-2 мин)',
    icon: Video,
    color: 'blue'
  },
];

function getColorClasses(color: string, isSelected: boolean) {
  if (isSelected) {
    return {
      bg: 'bg-[#1d1d1f]',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/70',
    };
  }
  
  switch (color) {
    case 'purple':
      return {
        bg: 'bg-[#f5f5f7] hover:bg-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        textColor: 'text-[#1d1d1f]',
        descColor: 'text-[#86868b]',
      };
    case 'blue':
      return {
        bg: 'bg-[#f5f5f7] hover:bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-[#1d1d1f]',
        descColor: 'text-[#86868b]',
      };
    default:
      return {
        bg: 'bg-[#f5f5f7] hover:bg-[#e8e8ed]',
        iconBg: 'bg-white',
        iconColor: 'text-[#1d1d1f]',
        textColor: 'text-[#1d1d1f]',
        descColor: 'text-[#86868b]',
      };
  }
}

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
          const colors = getColorClasses(mode.color, isSelected);
          
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                ${colors.bg}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${colors.iconBg}
              `}>
                <Icon className={`w-5 h-5 ${colors.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${colors.textColor}`}>
                  {mode.name}
                </p>
                <p className={`text-xs truncate ${colors.descColor}`}>
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
