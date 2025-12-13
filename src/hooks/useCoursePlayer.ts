'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type MediaType = 'audio' | 'video';

export interface Lesson {
  id: string;
  name: string;
  index: number;
}

export interface GeneratedEpisode {
  lessonId: string;
  lessonName: string;
  script: string;
  mediaUrl: string | null;
  videoId?: string;
  status: 'idle' | 'generating' | 'ready' | 'error';
  error?: string;
}

export interface CourseState {
  lessons: Lesson[];
  currentIndex: number;
  episodes: Map<number, GeneratedEpisode>;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: CourseState = {
  lessons: [],
  currentIndex: 0,
  episodes: new Map(),
  isLoading: false,
  isGenerating: false,
  error: null,
};

const VIDEO_POLL_INTERVAL = 5000;
const MAX_VIDEO_POLL_ATTEMPTS = 60;

export function useCoursePlayer(mediaType: MediaType, model: string) {
  const [state, setState] = useState<CourseState>(initialState);
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

  // Poll video status
  const pollVideoStatus = useCallback(async (videoId: string, lessonIndex: number) => {
    if (!mountedRef.current) return;

    try {
      const res = await fetch(`/api/heygen/status?videoId=${videoId}`);
      const data = await res.json();

      if (!mountedRef.current) return;

      if (data.status === 'completed' && data.url) {
        stopPolling();
        setState(prev => {
          const episodes = new Map(prev.episodes);
          const episode = episodes.get(lessonIndex);
          if (episode) {
            episodes.set(lessonIndex, { ...episode, mediaUrl: data.url, status: 'ready' });
          }
          return { ...prev, episodes, isGenerating: false };
        });
      } else if (data.status === 'failed' || pollAttemptRef.current >= MAX_VIDEO_POLL_ATTEMPTS) {
        stopPolling();
        setState(prev => {
          const episodes = new Map(prev.episodes);
          const episode = episodes.get(lessonIndex);
          if (episode) {
            episodes.set(lessonIndex, { ...episode, status: 'error', error: 'Не удалось сгенерировать видео' });
          }
          return { ...prev, episodes, isGenerating: false };
        });
      }
      pollAttemptRef.current++;
    } catch (error) {
      if (!mountedRef.current) return;
      stopPolling();
      setState(prev => ({ ...prev, isGenerating: false, error: 'Ошибка проверки статуса' }));
    }
  }, [stopPolling]);

  // Generate episode for a lesson
  const generateEpisode = useCallback(async (lesson: Lesson, lessonIndex: number) => {
    if (!mountedRef.current) return;

    stopPolling();

    // Set generating state
    setState(prev => {
      const episodes = new Map(prev.episodes);
      episodes.set(lessonIndex, {
        lessonId: lesson.id,
        lessonName: lesson.name,
        script: '',
        mediaUrl: null,
        status: 'generating',
      });
      return { ...prev, episodes, currentIndex: lessonIndex, isGenerating: true, error: null };
    });

    try {
      const res = await fetch('/api/episode/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: lesson.name,
          summary: lesson.name, // For media, we use name as summary
          type: mediaType,
          model,
        }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      if (mediaType === 'audio') {
        // Audio ready immediately
        setState(prev => {
          const episodes = new Map(prev.episodes);
          episodes.set(lessonIndex, {
            lessonId: lesson.id,
            lessonName: lesson.name,
            script: data.script,
            mediaUrl: data.audioUrl,
            status: 'ready',
          });
          return { ...prev, episodes, isGenerating: false };
        });
      } else {
        // Video needs polling
        setState(prev => {
          const episodes = new Map(prev.episodes);
          episodes.set(lessonIndex, {
            lessonId: lesson.id,
            lessonName: lesson.name,
            script: data.script,
            mediaUrl: null,
            videoId: data.videoId,
            status: 'generating',
          });
          return { ...prev, episodes };
        });

        // Start polling
        pollRef.current = setInterval(
          () => pollVideoStatus(data.videoId, lessonIndex),
          VIDEO_POLL_INTERVAL
        );
        pollVideoStatus(data.videoId, lessonIndex);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => {
        const episodes = new Map(prev.episodes);
        episodes.set(lessonIndex, {
          lessonId: lesson.id,
          lessonName: lesson.name,
          script: '',
          mediaUrl: null,
          status: 'error',
          error: error instanceof Error ? error.message : 'Ошибка',
        });
        return { ...prev, episodes, isGenerating: false };
      });
    }
  }, [mediaType, model, pollVideoStatus, stopPolling]);

  // Load CSV and start first episode
  const loadCourse = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const res = await fetch('/api/parse-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка парсинга CSV');
      }

      if (!mountedRef.current) return;

      const lessons: Lesson[] = data.lessons;
      
      setState(prev => ({
        ...prev,
        lessons,
        currentIndex: 0,
        episodes: new Map(),
        isLoading: false,
      }));

      // Auto-generate first episode
      if (lessons.length > 0) {
        generateEpisode(lessons[0], 0);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки',
      }));
    }
  }, [generateEpisode]);

  // Go to specific lesson
  const goToLesson = useCallback((index: number) => {
    const lesson = state.lessons[index];
    if (!lesson) return;

    setState(prev => ({ ...prev, currentIndex: index }));

    // Generate if not already generated
    if (!state.episodes.has(index)) {
      generateEpisode(lesson, index);
    }
  }, [state.lessons, state.episodes, generateEpisode]);

  // Next lesson
  const nextLesson = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.lessons.length) {
      goToLesson(nextIndex);
    }
  }, [state.currentIndex, state.lessons.length, goToLesson]);

  // Previous lesson
  const prevLesson = useCallback(() => {
    const prevIndex = state.currentIndex - 1;
    if (prevIndex >= 0) {
      goToLesson(prevIndex);
    }
  }, [state.currentIndex, goToLesson]);

  // Retry current episode
  const retryCurrentEpisode = useCallback(() => {
    const lesson = state.lessons[state.currentIndex];
    if (lesson) {
      generateEpisode(lesson, state.currentIndex);
    }
  }, [state.lessons, state.currentIndex, generateEpisode]);

  // Reset
  const reset = useCallback(() => {
    stopPolling();
    setState(initialState);
  }, [stopPolling]);

  // Current episode
  const currentEpisode = state.episodes.get(state.currentIndex) || null;

  return {
    state,
    currentEpisode,
    loadCourse,
    goToLesson,
    nextLesson,
    prevLesson,
    retryCurrentEpisode,
    reset,
  };
}
