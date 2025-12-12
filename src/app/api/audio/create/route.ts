import { NextRequest, NextResponse } from 'next/server';
import { generateAudio, arrayBufferToBase64, ElevenLabsError } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  if (!elevenLabsKey) {
    return NextResponse.json(
      { error: 'ELEVENLABS_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text } = body;

    if (typeof text !== 'string' || text.length === 0) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (roughly 1 minute = ~150 words)
    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Generate audio via ElevenLabs
    const audioBuffer = await generateAudio(text, elevenLabsKey);
    
    // Convert to base64 data URL
    const base64 = arrayBufferToBase64(audioBuffer);
    const audioBase64 = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ audioBase64 });
  } catch (error) {
    console.error('Audio create error:', error);
    
    if (error instanceof ElevenLabsError) {
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
