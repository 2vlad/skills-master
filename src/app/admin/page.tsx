'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { ModelSelector } from '@/components/model-selector';
import { ProfileNameInput } from '@/components/profile-name-input';
import { GenerateButton } from '@/components/generate-button';
import { ProgressIndicator } from '@/components/progress-indicator';
import { SkillsList } from '@/components/skills-list';
import { DownloadButton } from '@/components/download-button';
import { useGeneration } from '@/hooks/useGeneration';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<string>('google/gemini-2.0-flash-001');
  const [profileName, setProfileName] = useState<string>('');
  
  const { state, startGeneration, reset } = useGeneration();

  const handleGenerate = async () => {
    if (!file || !profileName.trim()) return;
    await startGeneration(file, model, profileName);
  };

  const canGenerate = file && profileName.trim() && state.status === 'idle';

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
              {/* Upload Section */}
              <div>
                <h2 className="apple-section-title">Загрузка</h2>
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
                  <ProfileNameInput 
                    value={profileName} 
                    onChange={setProfileName}
                    disabled={state.status === 'generating'}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <GenerateButton 
                onClick={handleGenerate}
                disabled={!canGenerate}
                loading={state.status === 'generating'}
              />

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
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 min-w-0">
            {state.status === 'idle' && !state.result && (
              <div className="apple-card p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
                      <h2 className="text-2xl font-semibold text-[#1d1d1f]">Результаты</h2>
                      <p className="text-[#86868b] mt-1">{state.result.skills.length} скиллов сгенерировано</p>
                    </div>
                    <DownloadButton data={state.result} />
                  </div>
                )}

                {state.status === 'generating' && (
                  <h2 className="text-2xl font-semibold text-[#1d1d1f]">Обработанные скиллы</h2>
                )}

                <SkillsList 
                  skills={state.result?.skills || state.skills} 
                  profile={state.result?.specialistProfile || null}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
