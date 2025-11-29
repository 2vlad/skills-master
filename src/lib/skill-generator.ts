import { OpenRouterClient } from './openrouter';
import { getSkillGenerationPrompt, SKILL_SYSTEM_PROMPT } from './prompts/skill-prompt';
import { LLMSkillResponseSchema, type LLMSkillResponse } from './schemas';
import type { Skill } from '@/types/skills';
import type { ParsedSkill } from '@/types/csv';

export class SkillGenerationError extends Error {
  constructor(
    message: string,
    public skillText: string,
    public details?: string
  ) {
    super(message);
    this.name = 'SkillGenerationError';
  }
}

export class SkillGenerator {
  private client: OpenRouterClient;
  private maxRetries: number;

  constructor(client: OpenRouterClient, maxRetries = 3) {
    this.client = client;
    this.maxRetries = maxRetries;
  }

  async generateSkill(
    parsedSkill: ParsedSkill,
    profileName: string,
    modelId: string
  ): Promise<Skill> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = getSkillGenerationPrompt(parsedSkill.text, profileName);
        
        const response = await this.client.generate({
          model: modelId,
          messages: [
            { role: 'system', content: SKILL_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        });

        // Clean response from potential markdown formatting
        const cleanedResponse = response
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(cleanedResponse);
        } catch {
          throw new Error(`Невалидный JSON в ответе модели: ${cleanedResponse.slice(0, 100)}...`);
        }

        // Validate with Zod
        const validated = LLMSkillResponseSchema.parse(parsed);

        // Build full Skill object
        const skill: Skill = {
          id: parsedSkill.id,
          source: {
            text: parsedSkill.text,
            profileColumn: parsedSkill.profileColumn,
          },
          name: validated.name,
          summary: validated.summary,
          details: validated.details,
          coreTechnologies: validated.coreTechnologies,
          checkQuestions: validated.checkQuestions,
          project: validated.project,
        };

        return skill;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new SkillGenerationError(
      `Не удалось сгенерировать скилл после ${this.maxRetries} попыток`,
      parsedSkill.text,
      lastError?.message
    );
  }
}
