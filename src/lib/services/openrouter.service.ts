import type { ChatOptions, Logger, ModelParams, OpenRouterResponse } from "../types/openrouter.types";
import { ApiError, InputValidationError, NetworkError, SchemaValidationError } from "../errors/api.errors";
import { OPENROUTER_DEFAULTS } from "../constants/openrouter.constants";
import { defaultResponseSchema } from "../schemas/openrouter.schema";

export class OpenRouterService {
  private readonly _fetcher: typeof fetch;
  private readonly _logger?: Logger;
  private readonly _apiUrl: string;

  constructor(
    private readonly apiKey: string,
    public readonly defaultModel = "openai/gpt-4o-mini",
    public readonly defaultParams: ModelParams = {
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    },
    apiUrl?: string,
    logger?: Logger,
    fetcher: typeof fetch = fetch
  ) {
    if (!apiKey) throw new Error("OpenRouter API key is required");

    this._apiUrl = apiUrl ?? OPENROUTER_DEFAULTS.API_URL;
    this._fetcher = fetcher;
    this._logger = logger;
  }

  async sendChatCompletion<T>(systemMessage: string, userMessage: string, options?: ChatOptions): Promise<T> {
    let retries = 0;

    while (retries <= OPENROUTER_DEFAULTS.MAX_RETRIES) {
      try {
        const payload = this._buildPayload(systemMessage, userMessage, options);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_DEFAULTS.REQUEST_TIMEOUT);

        const response = await this._fetcher(this._apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://repetix.com",
            "X-Title": "Repetix - AI Flashcards",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 400 && response.status < 500) {
            throw response;
          }

          if (retries < OPENROUTER_DEFAULTS.MAX_RETRIES) {
            retries++;
            await new Promise((resolve) => setTimeout(resolve, OPENROUTER_DEFAULTS.RETRY_DELAY * retries));
            continue;
          }
          throw response;
        }

        const data = (await response.json()) as OpenRouterResponse<string>;

        // Validate OpenRouter API response structure
        if (!data?.choices?.[0]?.message?.content) {
          throw new SchemaValidationError("Invalid response structure from OpenRouter API", data);
        }

        const content = data.choices[0].message.content;

        // Parse JSON response if it's a string
        try {
          const parsedContent = typeof content === "string" ? JSON.parse(content) : content;
          return parsedContent as T;
        } catch (error) {
          throw new SchemaValidationError("Failed to parse response content as JSON", error);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new NetworkError("Request timeout exceeded", error);
        }

        if (retries === OPENROUTER_DEFAULTS.MAX_RETRIES) {
          return this._handleError(error);
        }

        retries++;
        await new Promise((resolve) => setTimeout(resolve, OPENROUTER_DEFAULTS.RETRY_DELAY * retries));
      }
    }

    throw new NetworkError("Max retries exceeded");
  }

  private _buildPayload(systemMessage: string, userMessage: string, options?: ChatOptions): Record<string, unknown> {
    if (!systemMessage?.trim()) {
      throw new InputValidationError("System message is required");
    }
    if (!userMessage?.trim()) {
      throw new InputValidationError("User message is required");
    }

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    return {
      model: options?.model ?? this.defaultModel,
      messages,
      ...this.defaultParams,
      ...options?.params,
      response_format: options?.responseFormat ?? {
        type: "json_schema",
        json_schema: {
          name: "chat_response",
          schema: defaultResponseSchema,
        },
      },
    };
  }

  private _handleError(error: unknown): never {
    this._logger?.error("OpenRouter API error", error);

    if (error instanceof InputValidationError) {
      throw error;
    }

    if (error instanceof SchemaValidationError) {
      throw error;
    }

    if (error instanceof Response) {
      throw new ApiError("OpenRouter API request failed", error.status, error);
    }

    if (error instanceof Error && error.name === "TypeError") {
      throw new NetworkError("Network error while calling OpenRouter API", error);
    }

    throw new Error(
      `Unexpected error while calling OpenRouter API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
