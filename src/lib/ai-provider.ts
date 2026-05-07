import { createOllama } from "ai-sdk-ollama";

export const ollamaProvider = createOllama({
  baseURL: "https://ollama.com",
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY ?? ""}`,
  },
});
