import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';
import { generateOneMinuteScript } from '@/lib/script-generator';
import { generateAudio, arrayBufferToBase64, ElevenLabsError } from '@/lib/elevenlabs';
import { generateVideo, HeyGenError } from '@/lib/heygen';

export type EpisodeType = 'audio' | 'video';

interface EpisodeRequest {
  skillName: string;
  summary: string;
  details?: string[];
  type: EpisodeType;
  model?: string;
}

export async function POST(request: NextRequest) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  const heygenKey = process.env.HEYGEN_API_KEY;

  if (!openRouterKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const body: EpisodeRequest = await request.json();
    const { skillName, summary, details, type, model } = body;

    if (!skillName || !summary) {
      return NextResponse.json(
        { error: 'skillName and summary are required' },
        { status: 400 }
      );
    }

    if (!type || !['audio', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "audio" or "video"' },
        { status: 400 }
      );
    }

    const modelId = model || 'google/gemini-2.0-flash-001';

    // Step 1: Generate script via OpenRouter
    const client = new OpenRouterClient({ apiKey: openRouterKey });
    
    // Include details in summary for richer script
    const fullSummary = details && details.length > 0
      ? `${summary}\n\nКлючевые темы:\n${details.slice(0, 5).map(d => `- ${d}`).join('\n')}`
      : summary;
    
    const script = await generateOneMinuteScript(skillName, fullSummary, client, modelId);

    // Step 2: Generate media based on type
    if (type === 'audio') {
      if (!elevenLabsKey) {
        return NextResponse.json(
          { error: 'ELEVENLABS_API_KEY not configured' },
          { status: 500 }
        );
      }

      const audioBuffer = await generateAudio(script, elevenLabsKey);
      const base64 = arrayBufferToBase64(audioBuffer);
      const audioBase64 = `data:audio/mpeg;base64,${base64}`;

      return NextResponse.json({
        type: 'audio',
        script,
        audioUrl: audioBase64,
        ready: true,
      });
    } else {
      // Video type
      if (!heygenKey) {
        return NextResponse.json(
          { error: 'HEYGEN_API_KEY not configured' },
          { status: 500 }
        );
      }

      const videoId = await generateVideo(script, heygenKey);

      return NextResponse.json({
        type: 'video',
        script,
        videoId,
        ready: false, // Need to poll for completion
      });
    }
  } catch (error) {
    console.error('Episode create error:', error);
    
    if (error instanceof ElevenLabsError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    
    if (error instanceof HeyGenError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
