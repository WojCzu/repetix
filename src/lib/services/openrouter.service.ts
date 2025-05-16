import type { ChatOptions, Logger, ModelParams, OpenRouterResponse } from "../types/openrouter.types";
import { ApiError, InputValidationError, NetworkError, SchemaValidationError } from "../errors/api.errors";
import { OPENROUTER_DEFAULTS } from "../constants/openrouter.constants";
import { defaultResponseSchema } from "../schemas/openrouter.schema";

// Utility function to create a fetch with timeout capability
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  try {
    // For environments that support AbortController
    if (typeof AbortController !== "undefined") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };

      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } else {
      // Fallback for environments without AbortController
      return fetch(url, options);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timeout exceeded");
    }
    throw error;
  }
}

export class OpenRouterService {
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
    logger?: Logger
  ) {
    if (!apiKey) throw new Error("OpenRouter API key is required");

    this._apiUrl = apiUrl ?? OPENROUTER_DEFAULTS.API_URL;
    this._logger = logger;
  }

  async sendChatCompletion<T>(systemMessage: string, userMessage: string, options?: ChatOptions): Promise<T> {
    let retries = 0;
    let lastError: unknown = null;

    while (retries <= OPENROUTER_DEFAULTS.MAX_RETRIES) {
      try {
        const payload = this._buildPayload(systemMessage, userMessage, options);

        const fetchOptions: RequestInit = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://repetix.com",
            "X-Title": "Repetix - AI Flashcards",
          },
          body: JSON.stringify(payload),
        };

        // Log request attempt (useful for debugging in Cloudflare)
        this._logger?.info(`OpenRouter API request attempt #${retries + 1}`, {
          url: this._apiUrl,
          model: options?.model ?? this.defaultModel,
        });

        // Use our custom fetch wrapper instead of the built-in AbortController
        const response = await fetchWithTimeout(this._apiUrl, fetchOptions, OPENROUTER_DEFAULTS.REQUEST_TIMEOUT);

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
        lastError = error;

        // Log the error for debugging
        this._logger?.error(`OpenRouter API request failed (attempt #${retries + 1})`, {
          error: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : "Unknown",
          stack: error instanceof Error ? error.stack : undefined,
        });

        if (retries >= OPENROUTER_DEFAULTS.MAX_RETRIES) {
          break;
        }

        retries++;
        await new Promise((resolve) => setTimeout(resolve, OPENROUTER_DEFAULTS.RETRY_DELAY * retries));
      }
    }

    // If we've exhausted retries, handle the last error
    return this._handleError(lastError);
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

    // Check for common Cloudflare errors
    if (
      error instanceof Error &&
      (error.message?.includes("fetch failed") ||
        error.message?.includes("The URL is not specified") ||
        error.message?.includes("Failed to fetch"))
    ) {
      throw new NetworkError("Network error in Cloudflare environment while calling OpenRouter API", error);
    }

    if (error instanceof Error && error.name === "TypeError") {
      throw new NetworkError("Network error while calling OpenRouter API", error);
    }

    throw new Error(
      `Unexpected error while calling OpenRouter API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
