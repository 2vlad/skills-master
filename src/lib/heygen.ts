import type { HeyGenGenerateResponse, HeyGenStatusResponse, HeyGenVideoPayload } from '@/types/heygen';

const HEYGEN_BASE_URL = 'https://api.heygen.com';
const DEFAULT_AVATAR_ID = 'Eric_public_pro2_20230608';
const DEFAULT_VOICE_ID = '2d5b0e6cf361460aa96d87d995c80882'; // Russian male

export type HeyGenErrorCode = 'AUTH_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'NETWORK_ERROR';

export class HeyGenError extends Error {
  constructor(
    message: string,
    public code: HeyGenErrorCode = 'SERVER_ERROR',
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'HeyGenError';
  }
}

function mapErrorCode(status: number): HeyGenErrorCode {
  if (status === 401) return 'AUTH_ERROR';
  if (status === 429) return 'RATE_LIMIT';
  if (status >= 400 && status < 500) return 'INVALID_REQUEST';
  return 'SERVER_ERROR';
}

export async function generateVideo(
  script: string,
  apiKey: string
): Promise<string> {
  const payload: HeyGenVideoPayload = {
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: DEFAULT_AVATAR_ID,
      },
      voice: {
        type: 'text',
        input_text: script,
        voice_id: DEFAULT_VOICE_ID,
      },
    }],
  };

  try {
    const response = await fetch(`${HEYGEN_BASE_URL}/v2/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new HeyGenError(
        `HeyGen API error: ${response.status}`,
        mapErrorCode(response.status),
        response.status,
        errorText
      );
    }

    const data: HeyGenGenerateResponse = await response.json();
    
    if (data.error) {
      throw new HeyGenError(
        data.error.message || 'Unknown HeyGen error',
        'SERVER_ERROR'
      );
    }

    return data.data.video_id;
  } catch (error) {
    if (error instanceof HeyGenError) {
      throw error;
    }
    throw new HeyGenError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR'
    );
  }
}

export async function checkVideoStatus(
  videoId: string,
  apiKey: string
): Promise<{ status: string; url: string | null }> {
  try {
    const response = await fetch(
      `${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`,
      {
        headers: { 'X-Api-Key': apiKey },
      }
    );

    if (!response.ok) {
      throw new HeyGenError(
        `Status check failed: ${response.status}`,
        mapErrorCode(response.status),
        response.status
      );
    }

    const data: HeyGenStatusResponse = await response.json();
    
    return {
      status: data.data.status,
      url: data.data.video_url || null,
    };
  } catch (error) {
    if (error instanceof HeyGenError) {
      throw error;
    }
    throw new HeyGenError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR'
    );
  }
}
