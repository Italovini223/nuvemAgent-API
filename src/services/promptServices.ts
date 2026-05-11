import { createMcpPromptClient } from "../lib/mcp-prompts";

export class PromptServices {
  async listPrompts() {
    let mcpClient: Awaited<ReturnType<typeof createMcpPromptClient>> | undefined;

    try {
      mcpClient = await createMcpPromptClient();
      const result = await mcpClient.client.listPrompts();
      return { prompts: result.prompts };
    } finally {
      if (mcpClient) {
        await mcpClient.close();
      }
    }
  }

  async getPromptByName(name: string) {
    let mcpClient: Awaited<ReturnType<typeof createMcpPromptClient>> | undefined;

    try {
      mcpClient = await createMcpPromptClient();
      const result = await mcpClient.client.getPrompt({ name });
      return { prompt: result };
    } finally {
      if (mcpClient) {
        await mcpClient.close();
      }
    }
  }
}
