'use client';

import { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  List,
  Mic,
  Video
} from 'lucide-react';
import type { Skill } from '@/types/skills';
import { useEpisodePlayer, type EpisodeType } from '@/hooks/useEpisodePlayer';

interface EpisodePlayerProps {
  skills: Skill[];
  type: EpisodeType;
  model?: string;
}

export function EpisodePlayer({ skills, type, model }: EpisodePlayerProps) {
  const {
    state,
    currentEpisode,
    generateEpisode,
    initializeWithSkills,
    goToEpisode,
  } = useEpisodePlayer(type);

  const { episodes, currentIndex, isGenerating } = state;

  // Initialize episodes when skills change
  useEffect(() => {
    if (skills.length > 0) {
      initializeWithSkills(skills);
    }
  }, [skills, initializeWithSkills]);

  // Auto-generate first episode
  useEffect(() => {
    if (
      episodes.length > 0 && 
      episodes[0]?.status === 'pending' && 
      !isGenerating
    ) {
      generateEpisode(skills[0], 0, model);
    }
  }, [episodes, skills, generateEpisode, model, isGenerating]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      goToEpisode(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      const nextIndex = currentIndex + 1;
      goToEpisode(nextIndex);
      
      // Generate next episode if not already generated
      if (episodes[nextIndex]?.status === 'pending') {
        generateEpisode(skills[nextIndex], nextIndex, model);
      }
    }
  };

  const handleRetry = () => {
    if (currentEpisode) {
      const skill = skills.find(s => s.id === currentEpisode.skillId);
      if (skill) {
        generateEpisode(skill, currentIndex, model);
      }
    }
  };

  const handleEpisodeSelect = (index: number) => {
    goToEpisode(index);
    if (episodes[index]?.status === 'pending') {
      generateEpisode(skills[index], index, model);
    }
  };

  if (skills.length === 0) {
    return (
      <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
            {type === 'audio' ? (
              <Mic className="w-8 h-8 text-[#86868b]" />
            ) : (
              <Video className="w-8 h-8 text-[#86868b]" />
            )}
          </div>
          <p className="text-[#86868b] text-lg">
            Сначала сгенерируйте curriculum
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Player Card */}
      <div className="apple-card overflow-hidden">
        {/* Episode Header */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Эпизод {currentIndex + 1} из {episodes.length}
              </p>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mt-1">
                {currentEpisode?.skillName || 'Загрузка...'}
              </h3>
            </div>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${type === 'audio' ? 'bg-purple-100' : 'bg-blue-100'}
            `}>
              {type === 'audio' ? (
                <Mic className="w-5 h-5 text-purple-600" />
              ) : (
                <Video className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Media Player */}
        <div className="p-5">
          {/* Loading State */}
          {currentEpisode?.status === 'generating' && (
            <div className="bg-[#f5f5f7] rounded-xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
              <p className="text-[#1d1d1f] font-medium">
                {type === 'audio' ? 'Генерация аудио...' : 'Рендеринг видео...'}
              </p>
              <p className="text-sm text-[#86868b] mt-1">
                {type === 'audio' ? '~5-10 секунд' : '~1-2 минуты'}
              </p>
              
              {/* Show script while generating */}
              {currentEpisode.script && (
                <div className="mt-6 text-left bg-white rounded-lg p-4">
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
            <div className="bg-red-50 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-medium">
                {currentEpisode.error || 'Ошибка генерации'}
              </p>
              <button
                onClick={handleRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </div>
          )}

          {/* Ready State - Audio */}
          {currentEpisode?.status === 'ready' && type === 'audio' && currentEpisode.mediaUrl && (
            <div className="space-y-4">
              <audio
                src={currentEpisode.mediaUrl}
                controls
                className="w-full"
                autoPlay
              />
              
              {currentEpisode.script && (
                <div className="bg-[#f5f5f7] rounded-xl p-4">
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

          {/* Ready State - Video */}
          {currentEpisode?.status === 'ready' && type === 'video' && currentEpisode.mediaUrl && (
            <div className="space-y-4">
              <video
                src={currentEpisode.mediaUrl}
                controls
                className="w-full rounded-xl"
                autoPlay
              />
              
              {currentEpisode.script && (
                <details className="bg-[#f5f5f7] rounded-xl">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]">
                    Показать сценарий
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

          {/* Pending State */}
          {currentEpisode?.status === 'pending' && (
            <div className="bg-[#f5f5f7] rounded-xl p-8 text-center">
              <Play className="w-8 h-8 text-[#86868b] mx-auto mb-4" />
              <p className="text-[#86868b]">Нажмите для генерации</p>
              <button
                onClick={() => generateEpisode(skills[currentIndex], currentIndex, model)}
                className="mt-4 px-6 py-2 bg-[#1d1d1f] text-white rounded-lg hover:bg-[#333] transition-colors"
              >
                Сгенерировать
              </button>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isGenerating}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${currentIndex === 0 || isGenerating
                  ? 'bg-[#f5f5f7] text-[#c7c7c7] cursor-not-allowed'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }
              `}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === episodes.length - 1 || isGenerating}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center transition-all
                ${currentIndex === episodes.length - 1 || isGenerating
                  ? 'bg-[#e8e8ed] text-[#c7c7c7] cursor-not-allowed'
                  : 'bg-[#1d1d1f] text-white hover:bg-[#333]'
                }
              `}
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <SkipForward className="w-6 h-6" />
              )}
            </button>
          </div>
          
          <p className="text-center text-sm text-[#86868b] mt-3">
            {currentIndex < episodes.length - 1 
              ? 'Следующий эпизод' 
              : 'Последний эпизод'
            }
          </p>
        </div>
      </div>

      {/* Episode List */}
      <div className="apple-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <List className="w-4 h-4 text-[#86868b]" />
          <p className="text-sm font-medium text-[#86868b]">Все эпизоды</p>
        </div>
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {episodes.map((episode, index) => (
            <button
              key={episode.skillId}
              onClick={() => handleEpisodeSelect(index)}
              disabled={isGenerating && index !== currentIndex}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                ${index === currentIndex 
                  ? 'bg-[#1d1d1f] text-white' 
                  : 'hover:bg-[#f5f5f7]'
                }
                ${isGenerating && index !== currentIndex ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                ${index === currentIndex 
                  ? 'bg-white text-[#1d1d1f]' 
                  : 'bg-[#f5f5f7] text-[#86868b]'
                }
              `}>
                {index + 1}
              </span>
              
              <span className={`
                flex-1 text-sm truncate
                ${index === currentIndex ? 'text-white' : 'text-[#1d1d1f]'}
              `}>
                {episode.skillName}
              </span>
              
              {/* Status indicator */}
              <span className="flex-shrink-0">
                {episode.status === 'ready' && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {episode.status === 'generating' && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
                )}
                {episode.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
