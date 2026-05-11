import { generateText } from "ai-sdk-ollama";
import { stepCountIs } from "ai";
import type { ToolSet } from "ai";
import type { FastifyBaseLogger } from "fastify";

import { createMcpClient } from "../lib/mcp.js";
import { ollamaProvider } from "../lib/ai-provider.js";

export type ChatInput = {
  message: string;
  toolsToLoad?: string[];
};

function buildToolList(message: string): string[] {
  const normalized = message.toLowerCase();
  const tools = new Set<string>();

  if (normalized.includes("produto") || normalized.includes("estoque")) {
    tools.add("list_products");
    tools.add("get_product");
    tools.add("update_product");
    tools.add("update_product_stock_price");
  }

  if (normalized.includes("categoria")) {
    tools.add("list_categories");
    tools.add("create_category");
    tools.add("update_category");
  }

  if (normalized.includes("cupom")) {
    tools.add("list_coupons");
    tools.add("create_coupon");
  }

  if (tools.size === 0) {
    tools.add("list_products");
    tools.add("get_store");
  }

  return Array.from(tools);
}

export class ChatServices {
  async generateReply(
    { message, toolsToLoad }: ChatInput,
    logger?: FastifyBaseLogger
  ) {
    let mcpClient;

    try {
      mcpClient = await createMcpClient();
      const allTools = await mcpClient.tools();
      const toolNames = toolsToLoad?.length
        ? toolsToLoad
        : buildToolList(message);
      const tools = {} as ToolSet;

      for (const name of toolNames) {
        const tool = allTools[name as keyof typeof allTools];
        if (tool) tools[name] = tool;
      }

      tools.list_products = allTools.list_products;

      const modelId = "gpt-oss:20b-cloud";
      logger?.info({ modelId }, "Using Ollama model");
      const result = await generateText({
        model: ollamaProvider(modelId),
        tools,
        prompt: message,
        stopWhen: stepCountIs(10),
        system:
          "Voce e um assistente administrativo da Nuvemshop. Regra critica: Apos executar qualquer ferramenta, voce DEVE analisar o resultado tecnico e responder ao lojista em portugues confirmando a acao ou resumindo os dados encontrados.",
      });

      const text = result.text?.trim() ?? "";
      const toolCalls = (result as { toolCalls?: unknown[] }).toolCalls ?? [];
      const toolResults = (result as { toolResults?: unknown[] })
        .toolResults ?? [];
      logger?.info(
        {
          finishReason: (result as { finishReason?: string }).finishReason,
          hasText: text.length > 0,
          toolCalls: toolCalls.length,
          toolResults: toolResults.length,
        },
        "LLM result summary"
      );

      if (text) {
        return { text };
      }

      if (toolResults.length > 0) {
        return {
          text: "Acao executada com sucesso na sua loja.",
        };
      }

      if (toolCalls.length > 0) {
        return {
          text: "Ferramenta executada, mas modelo nao gerou resumo.",
        };
      }

      return { text: "" };
    } catch (error) {
      logger?.error(error);
      console.error("Chat generation error:", error);
      throw error;
    } finally {
      if (mcpClient) {
        try {
          await mcpClient.close();
        } catch (closeError) {
          logger?.error(closeError);
        }
      }
    }
  }
}
