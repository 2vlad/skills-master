'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VideoStatus, VideoData } from '@/types/heygen';

export interface HeyGenState {
  loading: boolean;
  script: string | null;
  videoData: VideoData;
  error: string | null;
}

const initialState: HeyGenState = {
  loading: false,
  script: null,
  videoData: { url: null, status: 'idle' },
  error: null,
};

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_ATTEMPTS = 60; // 5 min max wait

export function useHeyGen() {
  const [state, setState] = useState<HeyGenState>(initialState);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);

  // Cleanup on unmount
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
    attemptRef.current = 0;
  }, []);

  const pollStatus = useCallback(async (videoId: string) => {
    if (!mountedRef.current) return;

    try {
      const res = await fetch(`/api/heygen/status?videoId=${videoId}`);
      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Status check failed');
      }

      if (data.status === 'completed' && data.url) {
        stopPolling();
        setState(prev => ({
          ...prev,
          loading: false,
          videoData: { status: 'completed', url: data.url },
        }));
      } else if (data.status === 'failed') {
        stopPolling();
        setState(prev => ({
          ...prev,
          loading: false,
          videoData: { status: 'failed', url: null },
          error: 'Video generation failed',
        }));
      } else if (attemptRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setState(prev => ({
          ...prev,
          loading: false,
          videoData: { status: 'failed', url: null },
          error: 'Video generation timed out',
        }));
      }
      attemptRef.current++;
    } catch (error) {
      if (!mountedRef.current) return;
      
      stopPolling();
      setState(prev => ({
        ...prev,
        loading: false,
        videoData: { status: 'failed', url: null },
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [stopPolling]);

  const startGeneration = useCallback(async (
    skillName: string,
    summary: string,
    model?: string
  ) => {
    stopPolling();
    setState({
      loading: true,
      script: null,
      videoData: { status: 'generating_script', url: null },
      error: null,
    });

    try {
      const res = await fetch('/api/heygen/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName, summary, model }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create video');
      }

      setState(prev => ({
        ...prev,
        script: data.script,
        videoData: { status: 'processing', url: null },
      }));

      // Start polling
      pollRef.current = setInterval(() => pollStatus(data.videoId), POLL_INTERVAL);
      pollStatus(data.videoId); // Initial check

    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        loading: false,
        videoData: { status: 'failed', url: null },
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [pollStatus, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setState(initialState);
  }, [stopPolling]);

  return { state, startGeneration, reset };
}
