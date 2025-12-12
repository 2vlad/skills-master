'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { ModelSelector } from '@/components/model-selector';
import { ProfileNameInput } from '@/components/profile-name-input';
import { ModeSelector, type GenerationMode } from '@/components/mode-selector';
import { GenerateButton } from '@/components/generate-button';
import { ProgressIndicator } from '@/components/progress-indicator';
import { SkillsList } from '@/components/skills-list';
import { DownloadButton } from '@/components/download-button';
import { EpisodePlayer } from '@/components/episode-player';
import { useGeneration } from '@/hooks/useGeneration';
import { BookOpen, Mic, Video } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<string>('google/gemini-2.0-flash-001');
  const [profileName, setProfileName] = useState<string>('');
  const [mode, setMode] = useState<GenerationMode>('curriculum');
  
  const { state, startGeneration, reset } = useGeneration();

  const handleGenerate = async () => {
    if (!file || !profileName.trim()) return;
    await startGeneration(file, model, profileName);
  };

  const canGenerate = file && profileName.trim() && state.status === 'idle';
  const hasSkills = state.skills.length > 0 || (state.result?.skills?.length || 0) > 0;
  const skills = state.result?.skills || state.skills;

  // For audio/video modes, we need curriculum first
  const needsCurriculumFirst = (mode === 'audio' || mode === 'video') && !hasSkills;

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-[#1d1d1f]">Skills-Master</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:w-[360px] flex-shrink-0">
            <div className="apple-card p-6 space-y-8 sticky top-24">
              {/* Mode Selection */}
              <div>
                <h2 className="apple-section-title">Формат</h2>
                <ModeSelector
                  value={mode}
                  onChange={setMode}
                  disabled={state.status === 'generating'}
                />
              </div>

              {/* Upload Section - only for curriculum mode or when no skills */}
              {(mode === 'curriculum' || !hasSkills) && (
                <div>
                  <h2 className="apple-section-title">Загрузка</h2>
                  <FileUpload 
                    onFileSelect={setFile} 
                    selectedFile={file}
                    disabled={state.status === 'generating'}
                  />
                </div>
              )}

              {/* Settings Section */}
              <div>
                <h2 className="apple-section-title">Настройки</h2>
                <div className="space-y-4">
                  <ModelSelector 
                    value={model} 
                    onChange={setModel}
                    disabled={state.status === 'generating'}
                  />
                  {(mode === 'curriculum' || !hasSkills) && (
                    <ProfileNameInput 
                      value={profileName} 
                      onChange={setProfileName}
                      disabled={state.status === 'generating'}
                    />
                  )}
                </div>
              </div>

              {/* Generate Button - only for curriculum mode */}
              {mode === 'curriculum' && (
                <GenerateButton 
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  loading={state.status === 'generating'}
                />
              )}

              {/* Info for audio/video modes */}
              {needsCurriculumFirst && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Шаг 1:</strong> Сначала сгенерируйте Curriculum, затем переключитесь на {mode === 'audio' ? 'Аудио' : 'Видео'} режим.
                  </p>
                </div>
              )}

              {/* Progress */}
              {state.status === 'generating' && (
                <ProgressIndicator 
                  current={state.progress.current}
                  total={state.progress.total}
                  currentSkill={state.progress.currentSkill}
                />
              )}

              {/* Error */}
              {state.error && (
                <div className="p-4 bg-[#fff5f5] rounded-xl">
                  <p className="text-[#1d1d1f] text-sm leading-relaxed">{state.error}</p>
                  <button 
                    onClick={reset}
                    className="mt-3 text-sm text-[#0071e3] font-medium hover:underline"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}

              {/* Skills count for media modes */}
              {hasSkills && mode !== 'curriculum' && (
                <div className="p-4 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-3">
                    {mode === 'audio' ? (
                      <Mic className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Video className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#1d1d1f]">
                        {skills.length} эпизодов готово к генерации
                      </p>
                      <p className="text-xs text-[#86868b]">
                        Эпизоды генерируются последовательно
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 min-w-0">
            {/* Curriculum Mode */}
            {mode === 'curriculum' && (
              <>
                {state.status === 'idle' && !state.result && (
                  <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#86868b]" />
                      </div>
                      <p className="text-[#86868b] text-lg">Загрузите CSV и запустите генерацию</p>
                    </div>
                  </div>
                )}

                {(state.status === 'completed' || state.status === 'generating') && (state.result || state.skills.length > 0) && (
                  <div className="space-y-6">
                    {state.status === 'completed' && state.result && (
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold text-[#1d1d1f]">Curriculum</h2>
                          <p className="text-[#86868b] mt-1">{state.result.skills.length} скиллов сгенерировано</p>
                        </div>
                        <DownloadButton data={state.result} />
                      </div>
                    )}

                    {state.status === 'generating' && (
                      <h2 className="text-2xl font-semibold text-[#1d1d1f]">Обработанные скиллы</h2>
                    )}

                    <SkillsList 
                      skills={skills} 
                      profile={state.result?.specialistProfile || null}
                      model={model}
                    />
                  </div>
                )}
              </>
            )}

            {/* Audio Mode */}
            {mode === 'audio' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Аудио-курс</h2>
                    <p className="text-[#86868b]">Подкаст-эпизоды для каждого навыка</p>
                  </div>
                </div>

                <EpisodePlayer
                  skills={skills}
                  type="audio"
                  model={model}
                />
              </div>
            )}

            {/* Video Mode */}
            {mode === 'video' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Видео-курс</h2>
                    <p className="text-[#86868b]">Видео-уроки с AI-аватаром</p>
                  </div>
                </div>

                <EpisodePlayer
                  skills={skills}
                  type="video"
                  model={model}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
