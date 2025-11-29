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
        w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
        ${disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
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
          Сгенерировать skills.json
        </>
      )}
    </button>
  );
}
