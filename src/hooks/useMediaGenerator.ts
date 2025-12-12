'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VideoStatus, VideoData } from '@/types/heygen';

export type MediaStatus = 
  | 'idle' 
  | 'generating_script' 
  | 'generating_audio' 
  | 'audio_ready' 
  | 'generating_video' 
  | 'video_ready' 
  | 'failed';

export interface MediaState {
  status: MediaStatus;
  script: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  error: string | null;
}

const initialState: MediaState = {
  status: 'idle',
  script: null,
  audioUrl: null,
  videoUrl: null,
  error: null,
};

const VIDEO_POLL_INTERVAL = 5000; // 5 seconds
const MAX_VIDEO_POLL_ATTEMPTS = 60; // 5 min max wait

export function useMediaGenerator() {
  const [state, setState] = useState<MediaState>(initialState);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      // Revoke blob URL to prevent memory leak
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
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

  const pollVideoStatus = useCallback(async (videoId: string) => {
    if (!mountedRef.current) return;

    try {
      const res = await fetch(`/api/heygen/status?videoId=${videoId}`);
      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Video status check failed');
      }

      if (data.status === 'completed' && data.url) {
        stopPolling();
        setState(prev => ({
          ...prev,
          status: 'video_ready',
          videoUrl: data.url,
        }));
      } else if (data.status === 'failed') {
        stopPolling();
        // Don't fail completely - audio is still available
        setState(prev => ({
          ...prev,
          status: prev.audioUrl ? 'audio_ready' : 'failed',
          error: 'Video generation failed, but audio is available',
        }));
      } else if (attemptRef.current >= MAX_VIDEO_POLL_ATTEMPTS) {
        stopPolling();
        setState(prev => ({
          ...prev,
          status: prev.audioUrl ? 'audio_ready' : 'failed',
          error: 'Video generation timed out, but audio is available',
        }));
      }
      attemptRef.current++;
    } catch (error) {
      if (!mountedRef.current) return;
      
      stopPolling();
      setState(prev => ({
        ...prev,
        status: prev.audioUrl ? 'audio_ready' : 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [stopPolling]);

  const generateAudio = useCallback(async (script: string) => {
    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      status: 'generating_audio',
    }));

    try {
      const res = await fetch('/api/audio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        console.error('Audio generation failed:', data.error);
        // Don't fail - continue to video generation
        return null;
      }

      // Convert base64 to blob URL for audio element
      const audioBlob = await fetch(data.audioBase64).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Store for cleanup
      audioUrlRef.current = audioUrl;

      setState(prev => ({
        ...prev,
        status: 'audio_ready',
        audioUrl,
      }));

      return audioUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      // Don't fail - continue to video generation
      return null;
    }
  }, []);

  const startVideoGeneration = useCallback(async (videoId: string) => {
    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      status: 'generating_video',
    }));

    // Start polling for video status
    pollRef.current = setInterval(() => pollVideoStatus(videoId), VIDEO_POLL_INTERVAL);
    pollVideoStatus(videoId);
  }, [pollVideoStatus]);

  const startGeneration = useCallback(async (
    skillName: string,
    summary: string,
    model?: string,
    options: { skipVideo?: boolean } = {}
  ) => {
    stopPolling();
    
    // Revoke previous audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setState({
      status: 'generating_script',
      script: null,
      audioUrl: null,
      videoUrl: null,
      error: null,
    });

    try {
      // Step 1: Generate script and start video (HeyGen)
      const res = await fetch('/api/heygen/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName, summary, model }),
      });

      const data = await res.json();

      if (!mountedRef.current) return;

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setState(prev => ({
        ...prev,
        script: data.script,
      }));

      // Step 2: Generate audio immediately (fast, ~3-5 sec)
      await generateAudio(data.script);

      if (!mountedRef.current) return;

      // Step 3: Start polling for video (slow, ~60-120 sec)
      if (!options.skipVideo && data.videoId) {
        startVideoGeneration(data.videoId);
      }

    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [generateAudio, startVideoGeneration, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    
    // Revoke audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setState(initialState);
  }, [stopPolling]);

  return { state, startGeneration, reset };
}
