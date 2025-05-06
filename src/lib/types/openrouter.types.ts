export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatOptions {
  model?: string;
  params?: ModelParams;
  responseFormat?: {
    type: "json_schema";
    json_schema: {
      name: string;
      schema: Record<string, unknown>;
      required?: string[];
      additionalProperties?: boolean;
    };
  };
}

// Generic type for OpenRouter API response
export interface OpenRouterResponse<T> {
  choices: {
    message: {
      content: T;
    };
  }[];
}

// Default chat response type
export interface ChatResponse {
  reply: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface Logger {
  error: (message: string, error?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
}
