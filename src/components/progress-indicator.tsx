'use client';

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
        <span className="text-[#86868b]">
          {current} из {total}
        </span>
        <span className="font-medium text-[#1d1d1f]">{percentage}%</span>
      </div>

      <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1d1d1f] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {currentSkill && (
        <p className="text-xs text-[#86868b] truncate">
          {currentSkill}
        </p>
      )}
    </div>
  );
}
