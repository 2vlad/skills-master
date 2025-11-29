'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GenerateButton({ onClick, disabled, loading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-medium text-[15px] transition-all duration-200
        ${disabled || loading
          ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed'
          : 'bg-[#1d1d1f] text-white hover:bg-[#424245] active:scale-[0.98]'
        }
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Генерация...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          Сгенерировать
        </>
      )}
    </button>
  );
}
