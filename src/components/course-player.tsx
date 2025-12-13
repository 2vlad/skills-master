'use client';

import { useEffect } from 'react';
import { 
  SkipBack, 
  SkipForward, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Mic,
  Video,
  Upload
} from 'lucide-react';
import { useCoursePlayer, type MediaType } from '@/hooks/useCoursePlayer';

interface CoursePlayerProps {
  file: File | null;
  type: MediaType;
  model: string;
  onReset?: () => void;
}

export function CoursePlayer({ file, type, model, onReset }: CoursePlayerProps) {
  const {
    state,
    currentEpisode,
    loadCourse,
    nextLesson,
    prevLesson,
    retryCurrentEpisode,
    reset,
  } = useCoursePlayer(type, model);

  const { lessons, currentIndex, isLoading, isGenerating, error } = state;

  // Load course when file changes
  useEffect(() => {
    if (file) {
      loadCourse(file);
    }
  }, [file, loadCourse]);

  const handleReset = () => {
    reset();
    onReset?.();
  };

  // No file state
  if (!file) {
    return (
      <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
            <Upload className="w-8 h-8 text-[#86868b]" />
          </div>
          <p className="text-[#86868b] text-lg">Загрузите CSV файл</p>
        </div>
      </div>
    );
  }

  // Loading CSV
  if (isLoading) {
    return (
      <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#1d1d1f] mx-auto mb-4" />
          <p className="text-[#86868b] text-lg">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  // Error loading
  if (error && lessons.length === 0) {
    return (
      <div className="apple-card p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
          <p className="text-[#1d1d1f] font-medium mb-2">Ошибка загрузки</p>
          <p className="text-sm text-[#86868b] mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#f5f5f7] rounded-lg text-sm hover:bg-[#e8e8ed]"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // No lessons
  if (lessons.length === 0) {
    return (
      <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
          <p className="text-[#1d1d1f] font-medium mb-2">Нет уроков</p>
          <p className="text-sm text-[#86868b]">CSV не содержит отмеченных навыков</p>
        </div>
      </div>
    );
  }

  const isFirstLesson = currentIndex === 0;
  const isLastLesson = currentIndex === lessons.length - 1;

  return (
    <div className="space-y-4">
      {/* Main Player Card */}
      <div className="apple-card overflow-hidden">
        {/* Episode Header */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Урок {currentIndex + 1} из {lessons.length}
              </p>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mt-1 truncate">
                {lessons[currentIndex]?.name || 'Загрузка...'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f5f5f7]">
              {type === 'audio' ? (
                <Mic className="w-6 h-6 text-[#1d1d1f]" />
              ) : (
                <Video className="w-6 h-6 text-[#1d1d1f]" />
              )}
            </div>
          </div>
        </div>

        {/* Media Content */}
        <div className="p-5">
          {/* Generating State */}
          {currentEpisode?.status === 'generating' && (
            <div className="bg-[#f5f5f7] rounded-xl p-8 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#1d1d1f] mx-auto mb-4" />
              <p className="text-[#1d1d1f] font-medium">
                {type === 'audio' ? 'Генерация аудио...' : 'Рендеринг видео...'}
              </p>
              <p className="text-sm text-[#86868b] mt-1">
                {type === 'audio' ? '~5-10 секунд' : '~1-2 минуты'}
              </p>
              
              {/* Show script while generating */}
              {currentEpisode.script && (
                <div className="mt-6 text-left bg-white rounded-xl p-4 max-h-[200px] overflow-y-auto">
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                    Сценарий
                  </p>
                  <p className="text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                    {currentEpisode.script}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {currentEpisode?.status === 'error' && (
            <div className="bg-[#f5f5f7] rounded-xl p-6 text-center">
              <AlertCircle className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
              <p className="text-[#1d1d1f] font-medium">
                {currentEpisode.error || 'Ошибка генерации'}
              </p>
              <button
                onClick={retryCurrentEpisode}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#e8e8ed] text-[#1d1d1f] rounded-lg hover:bg-[#d8d8dc] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </div>
          )}

          {/* Ready State - Audio */}
          {currentEpisode?.status === 'ready' && type === 'audio' && currentEpisode.mediaUrl && (
            <div className="space-y-4">
              <div className="bg-[#f5f5f7] rounded-xl p-6">
                <audio
                  src={currentEpisode.mediaUrl}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
              
              {currentEpisode.script && (
                <details className="bg-[#f5f5f7] rounded-xl">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]">
                    📝 Показать сценарий
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                      {currentEpisode.script}
                    </p>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Ready State - Video */}
          {currentEpisode?.status === 'ready' && type === 'video' && currentEpisode.mediaUrl && (
            <div className="space-y-4">
              <video
                src={currentEpisode.mediaUrl}
                controls
                autoPlay
                className="w-full rounded-xl"
              />
              
              {currentEpisode.script && (
                <details className="bg-[#f5f5f7] rounded-xl">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]">
                    📝 Показать сценарий
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                      {currentEpisode.script}
                    </p>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Idle State (shouldn't happen normally) */}
          {(!currentEpisode || currentEpisode.status === 'idle') && !isGenerating && (
            <div className="bg-[#f5f5f7] rounded-xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#86868b] mx-auto mb-4" />
              <p className="text-[#86868b]">Подготовка...</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-5 pb-5 pt-2 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            {/* Previous */}
            <button
              onClick={prevLesson}
              disabled={isFirstLesson || isGenerating}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${isFirstLesson || isGenerating
                  ? 'text-[#c7c7c7] cursor-not-allowed'
                  : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }
              `}
            >
              <SkipBack className="w-5 h-5" />
              <span className="text-sm font-medium">Назад</span>
            </button>

            {/* Lesson indicator */}
            <div className="flex items-center gap-1">
              {lessons.slice(Math.max(0, currentIndex - 2), Math.min(lessons.length, currentIndex + 3)).map((_, i) => {
                const actualIndex = Math.max(0, currentIndex - 2) + i;
                return (
                  <div
                    key={actualIndex}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${actualIndex === currentIndex 
                        ? 'w-6 bg-[#1d1d1f]' 
                        : state.episodes.has(actualIndex) 
                          ? 'bg-[#86868b]' 
                          : 'bg-[#e8e8ed]'
                      }
                    `}
                  />
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={nextLesson}
              disabled={isLastLesson || isGenerating}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${isLastLesson || isGenerating
                  ? 'bg-[#e8e8ed] text-[#c7c7c7] cursor-not-allowed'
                  : 'bg-[#1d1d1f] text-white hover:bg-[#333]'
                }
              `}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-sm font-medium">Следующий урок</span>
                  <SkipForward className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="apple-card p-4">
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Все уроки ({lessons.length})
        </p>
        <div className="space-y-1 max-h-[250px] overflow-y-auto">
          {lessons.map((lesson, index) => {
            const episode = state.episodes.get(index);
            const isCurrent = index === currentIndex;
            
            return (
              <button
                key={lesson.id}
                onClick={() => !isGenerating && state.episodes.has(index) && (state.currentIndex !== index) ? null : null}
                disabled={isGenerating}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                  ${isCurrent 
                    ? 'bg-[#1d1d1f] text-white' 
                    : 'hover:bg-[#f5f5f7]'
                  }
                  ${isGenerating ? 'cursor-not-allowed' : ''}
                `}
              >
                <span className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                  ${isCurrent 
                    ? 'bg-white text-[#1d1d1f]' 
                    : 'bg-[#f5f5f7] text-[#86868b]'
                  }
                `}>
                  {index + 1}
                </span>
                
                <span className={`
                  flex-1 text-sm truncate
                  ${isCurrent ? 'text-white' : 'text-[#1d1d1f]'}
                `}>
                  {lesson.name}
                </span>
                
                {/* Status indicator */}
                <span className="flex-shrink-0">
                  {episode?.status === 'ready' && (
                    <span className="w-2 h-2 rounded-full bg-[#1d1d1f] block" />
                  )}
                  {episode?.status === 'generating' && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#86868b]" />
                  )}
                  {episode?.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-[#86868b]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
