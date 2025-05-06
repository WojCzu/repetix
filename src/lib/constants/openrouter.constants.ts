export const OPENROUTER_DEFAULTS = {
  API_URL: "https://openrouter.ai/api/v1/chat/completions",
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 0,
  RETRY_DELAY: 1000, // 1 second
} as const;
