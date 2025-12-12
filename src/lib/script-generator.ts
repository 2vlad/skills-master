import { OpenRouterClient } from './openrouter';

const SCRIPT_SYSTEM_PROMPT = `Ты — продюсер образовательных видео. Генерируй короткие, энергичные сценарии для 1-минутных видео. Отвечай только текстом сценария, без форматирования.`;

export function getScriptPrompt(skillName: string, summary: string): string {
  return `Напиши сценарий для 1-минутного тизера навыка "${skillName}".

Краткое описание навыка:
${summary}

Требования к сценарию:
1. Длина: 130-150 слов (строго для 1 минуты видео)
2. Язык: русский
3. Структура:
   - Хук (первые 10 слов — цепляющий вопрос или утверждение)
   - Ценность (почему этот навык важен, 2-3 предложения)
   - Призыв к действию (мотивация начать изучение)
4. Стиль: разговорный, дружелюбный, без технического жаргона
5. БЕЗ markdown, только чистый текст

Выдай только текст сценария, без заголовков и пометок.`;
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
