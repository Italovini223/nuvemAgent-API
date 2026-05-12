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

  async executePrompt(name: string, args?: Record<string, string>) {
    let mcpClient: Awaited<ReturnType<typeof createMcpPromptClient>> | undefined;

    try {
      mcpClient = await createMcpPromptClient();
      
      const result = await mcpClient.client.getPrompt({ 
        name, 
        arguments: args 
      });
      
      const promptText = result.messages.map(msg => 
        msg.content.type === 'text' ? msg.content.text : ''
      ).join('\n');

      return { 
        success: true,
        name: result.name,
        text: promptText 
      };
    } catch (error) {
      console.error(`Erro ao executar o prompt ${name}:`, error);
      throw error;
    } finally {
      if (mcpClient) {
        await mcpClient.close();
      }
    }
  }
}