const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
// Adam - deep professional male voice, supports multilingual
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
const MODEL_ID = 'eleven_multilingual_v2'; // Required for high-quality Russian

export type ElevenLabsErrorCode = 'AUTH_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'NETWORK_ERROR';

export class ElevenLabsError extends Error {
  constructor(
    message: string,
    public code: ElevenLabsErrorCode = 'SERVER_ERROR',
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ElevenLabsError';
  }
}

function mapErrorCode(status: number): ElevenLabsErrorCode {
  if (status === 401) return 'AUTH_ERROR';
  if (status === 429) return 'RATE_LIMIT';
  if (status >= 400 && status < 500) return 'INVALID_REQUEST';
  return 'SERVER_ERROR';
}

export interface GenerateAudioOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function generateAudio(
  text: string,
  apiKey: string,
  options: GenerateAudioOptions = {}
): Promise<ArrayBuffer> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  try {
    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ElevenLabsError(
        `ElevenLabs API error: ${response.status}`,
        mapErrorCode(response.status),
        response.status,
        errorText
      );
    }

    return response.arrayBuffer();
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }
    throw new ElevenLabsError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR'
    );
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
