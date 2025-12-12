'use client';

import { useHeyGen } from '@/hooks/useHeyGen';
import { Loader2, Video, AlertCircle, RefreshCw } from 'lucide-react';

interface VideoTeaserProps {
  skillName: string;
  summary: string;
  model?: string;
}

function getErrorMessage(error: string): string {
  if (error.includes('AUTH') || error.includes('401')) return 'Ошибка авторизации API';
  if (error.includes('RATE_LIMIT') || error.includes('429')) return 'Превышен лимит запросов';
  if (error.includes('timed out')) return 'Превышено время ожидания';
  if (error.includes('not configured')) return 'API ключ не настроен';
  return 'Произошла ошибка. Попробуйте позже.';
}

export function VideoTeaser({ skillName, summary, model }: VideoTeaserProps) {
  const { state, startGeneration, reset } = useHeyGen();
  const { loading, script, videoData, error } = state;

  const handleGenerate = () => {
    startGeneration(skillName, summary, model);
  };

  const handleRetry = () => {
    reset();
    handleGenerate();
  };

  // Idle state
  if (videoData.status === 'idle') {
    return (
      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-xl transition-colors"
      >
        <Video className="w-4 h-4" />
        Сгенерировать 1-мин тизер
      </button>
    );
  }

  // Error state
  if (videoData.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{getErrorMessage(error || '')}</span>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <RefreshCw className="w-3 h-3" />
          Попробовать снова
        </button>
      </div>
    );
  }

  // Generating script state
  if (videoData.status === 'generating_script') {
    return (
      <div className="bg-[#f5f5f7] rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-[#86868b]" />
        <span className="text-sm text-[#86868b]">Пишу сценарий...</span>
      </div>
    );
  }

  // Processing state (script ready, video rendering)
  if (videoData.status === 'processing') {
    return (
      <div className="bg-[#f5f5f7] rounded-xl p-4 space-y-4">
        {script && (
          <div>
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Сценарий</p>
            <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">{script}</p>
          </div>
        )}
        <div className="flex items-center gap-3 pt-2 border-t border-[rgba(0,0,0,0.06)]">
          <Loader2 className="w-4 h-4 animate-spin text-[#86868b]" />
          <span className="text-sm text-[#86868b]">Рендеринг аватара (~1 мин)...</span>
        </div>
      </div>
    );
  }

  // Completed state
  if (videoData.status === 'completed' && videoData.url) {
    return (
      <div className="space-y-3">
        <video
          src={videoData.url}
          controls
          className="w-full rounded-xl"
          autoPlay={false}
        />
        <button
          onClick={reset}
          className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          Сгенерировать новый
        </button>
      </div>
    );
  }

  return null;
}
