'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Skill } from '@/types/skills';

export type EpisodeType = 'audio' | 'video';

export interface Episode {
  skillId: string;
  skillName: string;
  script: string;
  mediaUrl: string | null;
  videoId?: string; // For video polling
  status: 'pending' | 'generating' | 'ready' | 'error';
  error?: string;
}

export interface EpisodePlayerState {
  episodes: Episode[];
  currentIndex: number;
  isGenerating: boolean;
  error: string | null;
}

const initialState: EpisodePlayerState = {
  episodes: [],
  currentIndex: 0,
  isGenerating: false,
  error: null,
};

const VIDEO_POLL_INTERVAL = 5000;
const MAX_VIDEO_POLL_ATTEMPTS = 60;

export function useEpisodePlayer(type: EpisodeType) {
  const [state, setState] = useState<EpisodePlayerState>(initialState);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollAttemptRef.current = 0;
  }, []);

  const pollVideoStatus = useCallback(async (videoId: string, episodeIndex: number) => {
    if (!mountedRef.current) return;

    try {
      const res = await fetch(`/api/heygen/status?videoId=${videoId}`);
      const data = await res.json();

      if (!mountedRef.current) return;

      if (data.status === 'completed' && data.url) {
        stopPolling();
        setState(prev => {
          const episodes = [...prev.episodes];
          episodes[episodeIndex] = {
            ...episodes[episodeIndex],
            mediaUrl: data.url,
            status: 'ready',
          };
          return { ...prev, episodes, isGenerating: false };
        });
      } else if (data.status === 'failed' || pollAttemptRef.current >= MAX_VIDEO_POLL_ATTEMPTS) {
        stopPolling();
        setState(prev => {
          const episodes = [...prev.episodes];
          episodes[episodeIndex] = {
            ...episodes[episodeIndex],
            status: 'error',
            error: 'Не удалось сгенерировать видео',
          };
          return { ...prev, episodes, isGenerating: false };
        });
      }
      pollAttemptRef.current++;
    } catch (error) {
      if (!mountedRef.current) return;
      stopPolling();
      setState(prev => {
        const episodes = [...prev.episodes];
        episodes[episodeIndex] = {
          ...episodes[episodeIndex],
          status: 'error',
          error: 'Ошибка проверки статуса',
        };
        return { ...prev, episodes, isGenerating: false };
      });
    }
  }, [stopPolling]);

  const generateEpisode = useCallback(async (
    skill: Skill,
    index: number,
    model?: string
  ) => {
    if (!mountedRef.current) return;

    stopPolling();
    
    setState(prev => {
      const episodes = [...prev.episodes];
      episodes[index] = {
        skillId: skill.id,
        skillName: skill.name,
        script: '',
        mediaUrl: null,
        status: 'generating',
      };
      return { ...prev, episodes, currentIndex: index, isGenerating: true, error: null };
    });

    try {
      const res = await fetch('/api/episode/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: skill.name,
          summary: skill.summary,
          details: skill.details,
          type,
          model,
        }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate episode');
      }

      if (type === 'audio') {
        // Audio is ready immediately
        setState(prev => {
          const episodes = [...prev.episodes];
          episodes[index] = {
            skillId: skill.id,
            skillName: skill.name,
            script: data.script,
            mediaUrl: data.audioUrl,
            status: 'ready',
          };
          return { ...prev, episodes, isGenerating: false };
        });
      } else {
        // Video needs polling
        setState(prev => {
          const episodes = [...prev.episodes];
          episodes[index] = {
            skillId: skill.id,
            skillName: skill.name,
            script: data.script,
            mediaUrl: null,
            videoId: data.videoId,
            status: 'generating',
          };
          return { ...prev, episodes };
        });

        // Start polling
        pollRef.current = setInterval(
          () => pollVideoStatus(data.videoId, index),
          VIDEO_POLL_INTERVAL
        );
        pollVideoStatus(data.videoId, index);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => {
        const episodes = [...prev.episodes];
        episodes[index] = {
          skillId: skill.id,
          skillName: skill.name,
          script: '',
          mediaUrl: null,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return { ...prev, episodes, isGenerating: false, error: episodes[index].error || null };
      });
    }
  }, [type, pollVideoStatus, stopPolling]);

  const initializeWithSkills = useCallback((skills: Skill[]) => {
    const episodes: Episode[] = skills.map(skill => ({
      skillId: skill.id,
      skillName: skill.name,
      script: '',
      mediaUrl: null,
      status: 'pending',
    }));
    setState({
      episodes,
      currentIndex: 0,
      isGenerating: false,
      error: null,
    });
  }, []);

  const goToEpisode = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentIndex: index }));
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setState(initialState);
  }, [stopPolling]);

  const currentEpisode = state.episodes[state.currentIndex] || null;

  return {
    state,
    currentEpisode,
    generateEpisode,
    initializeWithSkills,
    goToEpisode,
    reset,
  };
}
