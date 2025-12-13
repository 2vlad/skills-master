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
import { CoursePlayer } from '@/components/course-player';
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

  const handleReset = () => {
    setFile(null);
    reset();
  };

  const canGenerate = file && profileName.trim() && state.status === 'idle';
  const skills = state.result?.skills || state.skills;

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
            <div className="apple-card p-6 space-y-6 sticky top-24">
              
              {/* Mode Selection - Always visible */}
              <ModeSelector
                value={mode}
                onChange={setMode}
                disabled={state.status === 'generating'}
              />

              {/* Upload Section */}
              <div>
                <h2 className="apple-section-title">Загрузка CSV</h2>
                <FileUpload 
                  onFileSelect={setFile} 
                  selectedFile={file}
                  disabled={state.status === 'generating'}
                />
              </div>

              {/* Settings Section */}
              <div>
                <h2 className="apple-section-title">Настройки</h2>
                <div className="space-y-4">
                  <ModelSelector 
                    value={model} 
                    onChange={setModel}
                    disabled={state.status === 'generating'}
                  />
                  
                  {/* Profile name only for curriculum mode */}
                  {mode === 'curriculum' && (
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

              {/* Progress - only for curriculum */}
              {mode === 'curriculum' && state.status === 'generating' && (
                <ProgressIndicator 
                  current={state.progress.current}
                  total={state.progress.total}
                  currentSkill={state.progress.currentSkill}
                />
              )}

              {/* Error */}
              {state.error && mode === 'curriculum' && (
                <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[rgba(0,0,0,0.06)]">
                  <p className="text-[#1d1d1f] text-sm leading-relaxed">{state.error}</p>
                  <button 
                    onClick={reset}
                    className="mt-3 text-sm text-[#1d1d1f] font-medium hover:underline"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}

              {/* Info for media modes */}
              {mode !== 'curriculum' && file && (
                <div className="p-4 bg-[#f5f5f7] rounded-xl">
                  <p className="text-sm text-[#1d1d1f]">
                    {mode === 'audio' 
                      ? '🎙️ Аудио генерируется голосом Lebedev'
                      : '🎬 Видео с AI-аватаром'
                    }
                  </p>
                  <p className="text-xs text-[#86868b] mt-2">
                    Уроки генерируются последовательно при переключении
                  </p>
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
                      <p className="text-sm text-[#86868b] mt-2">
                        Или выберите Аудио/Видео формат для быстрого старта
                      </p>
                    </div>
                  </div>
                )}

                {(state.status === 'completed' || state.status === 'generating') && (state.result || state.skills.length > 0) && (
                  <div className="space-y-6">
                    {state.status === 'completed' && state.result && (
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold text-[#1d1d1f]">Curriculum</h2>
                          <p className="text-[#86868b] mt-1">{state.result.skills.length} скиллов</p>
                        </div>
                        <DownloadButton data={state.result} />
                      </div>
                    )}

                    {state.status === 'generating' && (
                      <h2 className="text-2xl font-semibold text-[#1d1d1f]">Генерация...</h2>
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
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                    <Mic className="w-5 h-5 text-[#1d1d1f]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Аудио-курс</h2>
                    <p className="text-[#86868b]">Подкаст-уроки</p>
                  </div>
                </div>

                <CoursePlayer
                  file={file}
                  type="audio"
                  model={model}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Video Mode */}
            {mode === 'video' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                    <Video className="w-5 h-5 text-[#1d1d1f]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Видео-курс</h2>
                    <p className="text-[#86868b]">Уроки с AI-аватаром</p>
                  </div>
                </div>

                <CoursePlayer
                  file={file}
                  type="video"
                  model={model}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
