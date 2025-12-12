import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';
import { generateOneMinuteScript } from '@/lib/script-generator';
import { generateVideo, HeyGenError } from '@/lib/heygen';

export async function POST(request: NextRequest) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const heygenKey = process.env.HEYGEN_API_KEY;

  if (!openRouterKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY not configured' },
      { status: 500 }
    );
  }

  if (!heygenKey) {
    return NextResponse.json(
      { error: 'HEYGEN_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { skillName, summary, model } = body;

    if (typeof skillName !== 'string' || skillName.length === 0) {
      return NextResponse.json(
        { error: 'skillName is required' },
        { status: 400 }
      );
    }

    if (typeof summary !== 'string' || summary.length === 0) {
      return NextResponse.json(
        { error: 'summary is required' },
        { status: 400 }
      );
    }

    const modelId = model || 'anthropic/claude-3-haiku';

    // Step 1: Generate script via OpenRouter
    const client = new OpenRouterClient({ apiKey: openRouterKey });
    const script = await generateOneMinuteScript(skillName, summary, client, modelId);

    // Step 2: Create video via HeyGen
    const videoId = await generateVideo(script, heygenKey);

    return NextResponse.json({ videoId, script });
  } catch (error) {
    console.error('HeyGen create error:', error);
    
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
