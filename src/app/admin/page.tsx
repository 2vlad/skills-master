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
  const [model, setModel] = useState<string>('anthropic/claude-3.5-sonnet');
  const [profileName, setProfileName] = useState<string>('');
  
  const { state, startGeneration, reset } = useGeneration();

  const handleGenerate = async () => {
    if (!file || !profileName.trim()) return;
    await startGeneration(file, model, profileName);
  };

  const canGenerate = file && profileName.trim() && state.status === 'idle';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Skills-Master Admin</h1>
        <p className="text-gray-500 text-sm">Загрузка CSV → генерация skills.json</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Загрузка CSV</h2>
              <FileUpload 
                onFileSelect={setFile} 
                selectedFile={file}
                disabled={state.status === 'generating'}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Настройки генерации</h2>
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

            <GenerateButton 
              onClick={handleGenerate}
              disabled={!canGenerate}
              loading={state.status === 'generating'}
            />

            {state.status === 'generating' && (
              <ProgressIndicator 
                current={state.progress.current}
                total={state.progress.total}
                currentSkill={state.progress.currentSkill}
              />
            )}

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{state.error}</p>
                <button 
                  onClick={reset}
                  className="mt-2 text-red-600 text-sm underline hover:no-underline"
                >
                  Попробовать снова
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
            {state.status === 'idle' && !state.result && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Загрузите CSV и запустите генерацию</p>
              </div>
            )}

            {state.status === 'completed' && state.result && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Результаты генерации</h2>
                  <DownloadButton data={state.result} />
                </div>
                <SkillsList 
                  skills={state.result.skills} 
                  profile={state.result.specialistProfile}
                />
              </div>
            )}

            {state.status === 'generating' && state.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Обработанные скиллы</h2>
                <SkillsList 
                  skills={state.skills} 
                  profile={null}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
