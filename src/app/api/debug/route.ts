import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';
import { AVAILABLE_MODELS } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  };

  // 1. Check environment variables
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;
  const apiKeyPreview = hasApiKey 
    ? `${process.env.OPENROUTER_API_KEY!.slice(0, 10)}...${process.env.OPENROUTER_API_KEY!.slice(-4)}`
    : null;
  
  results.checks = {
    ...results.checks as object,
    OPENROUTER_API_KEY: {
      exists: hasApiKey,
      preview: apiKeyPreview,
    },
  };

  if (!hasApiKey) {
    (results.errors as string[]).push('OPENROUTER_API_KEY не установлен');
    return NextResponse.json(results, { status: 500 });
  }

  // 2. Test OpenRouter connection
  try {
    const client = new OpenRouterClient({ 
      apiKey: process.env.OPENROUTER_API_KEY! 
    });
    
    const testModel = AVAILABLE_MODELS[0].id;
    
    const response = await client.generate({
      model: testModel,
      messages: [
        { role: 'user', content: 'Say "OK" in one word.' }
      ],
      temperature: 0,
      max_tokens: 10,
    });

    results.checks = {
      ...results.checks as object,
      openRouterConnection: {
        success: true,
        model: testModel,
        response: response.slice(0, 100),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.checks = {
      ...results.checks as object,
      openRouterConnection: {
        success: false,
        error: errorMessage,
      },
    };
    (results.errors as string[]).push(`OpenRouter: ${errorMessage}`);
  }

  // 3. Check available models
  results.checks = {
    ...results.checks as object,
    availableModels: AVAILABLE_MODELS.map(m => m.id),
  };

  const hasErrors = (results.errors as string[]).length > 0;
  
  return NextResponse.json(results, { 
    status: hasErrors ? 500 : 200 
  });
}

// POST endpoint for testing skill generation
export async function POST(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    test: 'skill_generation',
  };

  try {
    const body = await request.json();
    const { skillText, profileName, model } = body;

    if (!skillText) {
      return NextResponse.json({ error: 'skillText is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 });
    }

    const client = new OpenRouterClient({ apiKey });
    
    // Import dynamically to avoid circular deps
    const { SkillGenerator } = await import('@/lib/skill-generator');
    const generator = new SkillGenerator(client, 1); // 1 retry for faster testing

    const skill = await generator.generateSkill(
      {
        id: 'test-skill',
        text: skillText,
        profileColumn: 'A',
      },
      profileName || 'Test Profile',
      model || AVAILABLE_MODELS[0].id
    );

    results.success = true;
    results.skill = skill;

    return NextResponse.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    results.success = false;
    results.error = errorMessage;
    results.stack = errorStack;

    return NextResponse.json(results, { status: 500 });
  }
}
