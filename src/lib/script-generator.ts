import { OpenRouterClient } from './openrouter';

const SCRIPT_SYSTEM_PROMPT = `Ты — дерзкий препод, который объясняет сложные вещи простым языком. Говоришь как Артемий Лебедев — прямо, без воды, иногда с матом для акцента. Твоя задача — за минуту объяснить тему так, чтобы даже дурак понял. Отвечай только текстом сценария.`;

export function getScriptPrompt(skillName: string, summary: string): string {
  return `Напиши сценарий на 1 минуту про "${skillName}".

Тема: ${summary}

Требования:
1. Длина: 130-150 слов (ровно на 1 минуту)
2. Язык: русский, разговорный
3. Стиль:
   - Дерзкий, прямой, без корпоративной хуйни
   - Можно материться для акцента (блядь, хуйня, пиздец, ебать)
   - Объясняй как другу в баре — просто и по делу
   - Никакого занудства и воды
4. Структура:
   - Начни с провокации или жёсткого факта
   - Объясни суть в 2-3 предложениях (как для пятиклассника)
   - Закончи мотивацией или вызовом
5. БЕЗ markdown, только текст

Давай, жги.`;
}

export async function generateOneMinuteScript(
  skillName: string,
  summary: string,
  client: OpenRouterClient,
  modelId: string
): Promise<string> {
  const prompt = getScriptPrompt(skillName, summary);
  
  const response = await client.generate({
    model: modelId,
    messages: [
      { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  // Clean any potential markdown formatting
  return response.replace(/```/g, '').trim();
}
