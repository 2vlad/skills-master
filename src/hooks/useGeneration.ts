'use client';

import { useState, useCallback } from 'react';
import type { Skill, SpecialistProfile, SkillsJson } from '@/types/skills';

export interface GenerationProgress {
  current: number;
  total: number;
  currentSkill?: string;
}

export interface GenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: GenerationProgress;
  skills: Skill[];
  profile: SpecialistProfile | null;
  result: SkillsJson | null;
  error: string | null;
}

const initialState: GenerationState = {
  status: 'idle',
  progress: { current: 0, total: 0 },
  skills: [],
  profile: null,
  result: null,
  error: null,
};

interface SSEEvent {
  type: 'progress' | 'skill' | 'profile' | 'complete' | 'error';
  data?: unknown;
  current?: number;
  total?: number;
  skillName?: string;
  message?: string;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const startGeneration = useCallback(
    async (file: File, model: string, profileName: string) => {
      setState({
        ...initialState,
        status: 'generating',
      });

      try {
        const formData = new FormData();
        formData.append('csv', file);
        formData.append('model', model);
        formData.append('profileName', profileName);

        const response = await fetch('/api/generate', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка генерации');
        }

        if (!response.body) {
          throw new Error('Ответ сервера пустой');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const skills: Skill[] = [];

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));
              
              switch (event.type) {
                case 'progress':
                  setState((prev) => ({
                    ...prev,
                    progress: {
                      current: event.current || 0,
                      total: event.total || 0,
                      currentSkill: event.skillName,
                    },
                  }));
                  break;

                case 'skill':
                  if (event.data) {
                    skills.push(event.data as Skill);
                    setState((prev) => ({
                      ...prev,
                      skills: [...skills],
                    }));
                  }
                  break;

                case 'profile':
                  if (event.data) {
                    setState((prev) => ({
                      ...prev,
                      profile: event.data as SpecialistProfile,
                    }));
                  }
                  break;

                case 'complete':
                  if (event.data) {
                    setState({
                      status: 'completed',
                      progress: { current: 0, total: 0 },
                      skills: (event.data as SkillsJson).skills,
                      profile: (event.data as SkillsJson).specialistProfile,
                      result: event.data as SkillsJson,
                      error: null,
                    });
                  }
                  break;

                case 'error':
                  setState((prev) => ({
                    ...prev,
                    status: 'error',
                    error: event.message || 'Неизвестная ошибка',
                  }));
                  break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Ошибка генерации',
        }));
      }
    },
    []
  );

  return { state, startGeneration, reset };
}
