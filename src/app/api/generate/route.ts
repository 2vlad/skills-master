import { NextRequest } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';
import { OpenRouterClient, OpenRouterError } from '@/lib/openrouter';
import { SkillGenerator, SkillGenerationError } from '@/lib/skill-generator';
import { SpecialistProfileBuilder, ProfileBuildError } from '@/lib/profile-builder';
import type { SkillsJson, Skill } from '@/types/skills';

interface SSEEvent {
  type: 'progress' | 'skill' | 'profile' | 'complete' | 'error';
  data?: unknown;
  current?: number;
  total?: number;
  skillName?: string;
  message?: string;
}

function createSSEMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  // Check API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[generate] OPENROUTER_API_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'OPENROUTER_API_KEY не настроен на сервере. Добавьте его в Vercel Environment Variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await request.formData();
    const csvFile = formData.get('csv') as File | null;
    const modelId = formData.get('model') as string | null;
    const profileName = formData.get('profileName') as string | null;

    // Validate inputs
    if (!csvFile) {
      return new Response(
        JSON.stringify({ error: 'CSV файл не загружен' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!modelId) {
      return new Response(
        JSON.stringify({ error: 'Модель не выбрана' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!profileName?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Название профиля не указано' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read CSV content
    const csvContent = await csvFile.text();
    
    // Parse CSV
    const parseResult = parseCSV(csvContent, csvFile.name);
    
    if (parseResult.errors.length > 0) {
      return new Response(
        JSON.stringify({ error: parseResult.errors.join('. ') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (parseResult.skills.length === 0) {
      return new Response(
        JSON.stringify({ error: 'В CSV не найдено скиллов с отметкой X' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const client = new OpenRouterClient({ apiKey });
          const skillGenerator = new SkillGenerator(client);
          const profileBuilder = new SpecialistProfileBuilder(client);

          const skills: Skill[] = [];
          const total = parseResult.skills.length;

          // Generate skills one by one
          for (let i = 0; i < parseResult.skills.length; i++) {
            const parsedSkill = parseResult.skills[i];
            
            // Send progress
            controller.enqueue(
              encoder.encode(
                createSSEMessage({
                  type: 'progress',
                  current: i + 1,
                  total,
                  skillName: parsedSkill.text.slice(0, 50),
                })
              )
            );

            try {
              const skill = await skillGenerator.generateSkill(
                parsedSkill,
                profileName,
                modelId
              );
              skills.push(skill);

              // Send generated skill
              controller.enqueue(
                encoder.encode(
                  createSSEMessage({
                    type: 'skill',
                    data: skill,
                  })
                )
              );
            } catch (error) {
              if (error instanceof SkillGenerationError) {
                controller.enqueue(
                  encoder.encode(
                    createSSEMessage({
                      type: 'error',
                      message: `Ошибка при обработке скилла: ${error.skillText.slice(0, 50)}... - ${error.message}`,
                    })
                  )
                );
                controller.close();
                return;
              }
              throw error;
            }
          }

          // Generate specialist profile
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'progress',
                current: total,
                total,
                skillName: 'Генерация профиля специалиста...',
              })
            )
          );

          const profile = await profileBuilder.buildProfile(
            profileName,
            skills,
            modelId
          );

          // Build final SkillsJson
          const result: SkillsJson = {
            meta: {
              profileId: 'A',
              profileName,
              sourceFile: csvFile.name,
              generatedAt: new Date().toISOString(),
              model: modelId,
            },
            skills,
            specialistProfile: profile,
          };

          // Send profile
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'profile',
                data: profile,
              })
            )
          );

          // Send complete
          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'complete',
                data: result,
              })
            )
          );

          controller.close();
        } catch (error) {
          let message = 'Неизвестная ошибка';
          
          if (error instanceof OpenRouterError) {
            message = error.message;
          } else if (error instanceof ProfileBuildError) {
            message = error.message;
          } else if (error instanceof Error) {
            message = error.message;
          }

          controller.enqueue(
            encoder.encode(
              createSSEMessage({
                type: 'error',
                message,
              })
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
