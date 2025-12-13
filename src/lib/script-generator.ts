import { OpenRouterClient } from './openrouter';

const SCRIPT_SYSTEM_PROMPT = `Ты — харизматичный препод, который объясняет сложное простым языком. Говоришь уверенно, с юмором, иногда дерзко — но не грубо. Твоя задача — за минуту объяснить тему так, чтобы захотелось узнать больше. Отвечай только текстом сценария.`;

export function getScriptPrompt(skillName: string, summary: string): string {
  return `Напиши сценарий на 1 минуту про "${skillName}".

Тема: ${summary}

Требования:
1. Длина: 130-150 слов (ровно на 1 минуту)
2. Язык: русский, живой разговорный
3. Стиль:
   - Уверенный, прямой, с иронией
   - Редкий мат для акцента (максимум 1-2 слова, типа "чёрт" или "блин")
   - Объясняй как умному другу — просто, но без снисхождения
   - Никакой воды и канцелярита
4. Структура:
   - Начни с интересного факта или неожиданного вопроса
   - Объясни суть понятным языком (аналогии приветствуются)
   - Закончи мыслью, которая зацепит
5. БЕЗ markdown, только текст

Погнали.`;
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
