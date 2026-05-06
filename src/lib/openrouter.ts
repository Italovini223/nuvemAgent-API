import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  name: "ollama",
});

export function getOpenRouterModel(modelId: string) {
  return openrouter.chat(modelId);
}
