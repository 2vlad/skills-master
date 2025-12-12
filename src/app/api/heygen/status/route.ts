import { NextRequest, NextResponse } from 'next/server';
import { checkVideoStatus, HeyGenError } from '@/lib/heygen';

export async function GET(request: NextRequest) {
  const heygenKey = process.env.HEYGEN_API_KEY;

  if (!heygenKey) {
    return NextResponse.json(
      { error: 'HEYGEN_API_KEY not configured' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'videoId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await checkVideoStatus(videoId, heygenKey);
    
    return NextResponse.json({
      status: result.status,
      url: result.url,
    });
  } catch (error) {
    console.error('HeyGen status error:', error);
    
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
