// Request payload for video generation (HeyGen API v2)
export interface HeyGenVideoPayload {
  video_inputs: {
    character: {
      type: 'avatar';
      avatar_id: string;
      avatar_style?: string;
    };
    voice: {
      type: 'text';
      input_text: string;
      voice_id: string;
      speed?: number;
    };
  }[];
  dimension?: { width: number; height: number };
}

// Response from POST /v2/video/generate
export interface HeyGenGenerateResponse {
  error?: { code?: string; message?: string };
  data: {
    video_id: string;
  };
}

// Response from GET /v1/video_status.get
export interface HeyGenStatusResponse {
  data: {
    status: 'processing' | 'completed' | 'failed' | 'pending';
    video_url?: string;
    thumbnail_url?: string;
    error?: { code?: string; message?: string };
  };
}

// Video generation states for frontend
export type VideoStatus = 'idle' | 'generating_script' | 'processing' | 'completed' | 'failed';

export interface VideoData {
  url: string | null;
  status: VideoStatus;
}
