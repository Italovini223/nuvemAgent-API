import { createMcpClient } from "../lib/mcp.js";

export class PromptServices {
  async listPrompts() {
    let mcpClient;

    try {
      mcpClient = await createMcpClient();
      const promptsList = await mcpClient.prompts();
      return { prompts: promptsList };
    } finally {
      if (mcpClient) {
        await mcpClient.close();
      }
    }
  }

  async getPromptByName(name: string) {
    let mcpClient;

    try {
      mcpClient = await createMcpClient();
      const promptData = await mcpClient.getPrompt(name);
      return { prompt: promptData };
    } finally {
      if (mcpClient) {
        await mcpClient.close();
      }
    }
  }
}
