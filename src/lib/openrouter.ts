import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  name: "openrouter",
});

export function getOpenRouterModel(modelId: string) {
  return openrouter.chat(modelId);
}
