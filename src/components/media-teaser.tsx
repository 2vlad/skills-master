'use client';

import { useMediaGenerator } from '@/hooks/useMediaGenerator';
import { Loader2, Video, Mic, AlertCircle, RefreshCw, Play } from 'lucide-react';

interface MediaTeaserProps {
  skillName: string;
  summary: string;
  model?: string;
}

function getErrorMessage(error: string): string {
  if (error.includes('AUTH') || error.includes('401')) return 'Ошибка авторизации API';
  if (error.includes('RATE_LIMIT') || error.includes('429')) return 'Превышен лимит запросов';
  if (error.includes('timed out')) return 'Превышено время ожидания';
  if (error.includes('not configured')) return 'API ключ не настроен';
  return error || 'Произошла ошибка. Попробуйте позже.';
}

export function MediaTeaser({ skillName, summary, model }: MediaTeaserProps) {
  const { state, startGeneration, reset } = useMediaGenerator();
  const { status, script, audioUrl, videoUrl, error } = state;

  const handleGenerate = () => {
    startGeneration(skillName, summary, model);
  };

  const handleRetry = () => {
    reset();
    handleGenerate();
  };

  // Idle state - show generate button
  if (status === 'idle') {
    return (
      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-xl transition-colors"
      >
        <Play className="w-4 h-4" />
        Сгенерировать 1-мин тизер
      </button>
    );
  }

  // Failed state with no audio fallback
  if (status === 'failed' && !audioUrl) {
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

  // Any state with content (script, audio, or video)
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-4 space-y-4">
      {/* Script Section */}
      {script && (
        <div>
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
            Сценарий
          </p>
          <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
            {script}
          </p>
        </div>
      )}

      {/* Script Loading */}
      {status === 'generating_script' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#86868b]" />
          <span className="text-sm text-[#86868b]">Пишу сценарий...</span>
        </div>
      )}

      {/* Audio Section */}
      {(status === 'generating_audio' || audioUrl) && (
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-3.5 h-3.5 text-[#86868b]" />
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Аудио-подкаст
            </p>
          </div>
          
          {status === 'generating_audio' && !audioUrl && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
              <span className="text-sm text-[#86868b]">Генерация аудио (~3 сек)...</span>
            </div>
          )}
          
          {audioUrl && (
            <audio
              src={audioUrl}
              controls
              className="w-full h-10"
              preload="metadata"
            />
          )}
        </div>
      )}

      {/* Video Section */}
      {(status === 'generating_video' || status === 'audio_ready' || videoUrl) && (
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-3.5 h-3.5 text-[#86868b]" />
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Видео-тизер
            </p>
          </div>
          
          {status === 'generating_video' && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
              <span className="text-sm text-[#86868b]">Рендеринг аватара (~1 мин)...</span>
            </div>
          )}
          
          {status === 'audio_ready' && !videoUrl && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
              <span className="text-sm text-[#86868b]">Рендеринг аватара (~1 мин)...</span>
            </div>
          )}

          {videoUrl && (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              autoPlay={false}
            />
          )}
        </div>
      )}

      {/* Video Ready State */}
      {status === 'video_ready' && videoUrl && (
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-3.5 h-3.5 text-[#86868b]" />
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Видео-тизер
            </p>
          </div>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            autoPlay={false}
          />
        </div>
      )}

      {/* Error with audio fallback */}
      {error && audioUrl && (
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{getErrorMessage(error)}</span>
          </div>
        </div>
      )}

      {/* Reset button when content is ready */}
      {(audioUrl || videoUrl) && (
        <button
          onClick={reset}
          className="text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          Сгенерировать новый
        </button>
      )}
    </div>
  );
}
