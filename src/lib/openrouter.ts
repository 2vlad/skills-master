export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generate(request: GenerateRequest, retries = 3): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Retrying in ${delay/1000}s... (attempt ${attempt + 1}/${retries})`);
        await this.sleep(delay);
      }

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://skills-master.vercel.app',
            'X-Title': 'Skills-Master',
          },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.max_tokens ?? 4096,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 401) {
            throw new OpenRouterError(
              'Неверный API ключ OpenRouter',
              response.status,
              errorText
            );
          }
          
          if (response.status === 429) {
            // Rate limited - continue to retry
            lastError = new OpenRouterError(
              'Превышен лимит запросов. Подождите немного и попробуйте снова.',
              response.status,
              errorText
            );
            continue;
          }
          
          throw new OpenRouterError(
            `Ошибка OpenRouter: ${response.status}`,
            response.status,
            errorText
          );
        }

        const data: OpenRouterResponse = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
          throw new OpenRouterError('Модель не вернула ответ');
        }

        return data.choices[0].message.content;
      } catch (error) {
        if (error instanceof OpenRouterError && error.statusCode === 429) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }
    
    // All retries exhausted
    throw lastError || new OpenRouterError('Превышен лимит запросов после всех попыток');
  }
}
