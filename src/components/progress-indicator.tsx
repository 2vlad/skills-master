'use client';

import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  currentSkill?: string;
}

export function ProgressIndicator({ current, total, currentSkill }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Обработано {current} из {total} скиллов
        </span>
        <span className="font-medium text-black">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {currentSkill && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="truncate">{currentSkill}</span>
        </div>
      )}
    </div>
  );
}
