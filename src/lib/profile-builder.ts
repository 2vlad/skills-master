import { OpenRouterClient } from './openrouter';
import { getProfileGenerationPrompt, PROFILE_SYSTEM_PROMPT } from './prompts/profile-prompt';
import { SpecialistProfileSchema } from './schemas';
import type { Skill, SpecialistProfile } from '@/types/skills';

export class ProfileBuildError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'ProfileBuildError';
  }
}

export class SpecialistProfileBuilder {
  private client: OpenRouterClient;
  private maxRetries: number;

  constructor(client: OpenRouterClient, maxRetries = 3) {
    this.client = client;
    this.maxRetries = maxRetries;
  }

  async buildProfile(
    profileName: string,
    skills: Skill[],
    modelId: string
  ): Promise<SpecialistProfile> {
    const skillsSummary = skills.map((s) => ({
      name: s.name,
      summary: s.summary,
    }));

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = getProfileGenerationPrompt(profileName, skillsSummary);
        
        const response = await this.client.generate({
          model: modelId,
          messages: [
            { role: 'system', content: PROFILE_SYSTEM_PROMPT },
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
        const validated = SpecialistProfileSchema.parse(parsed);

        return validated;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new ProfileBuildError(
      `Не удалось сгенерировать профиль специалиста после ${this.maxRetries} попыток`,
      lastError?.message
    );
  }
}
