import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateText } from "ai-sdk-ollama";
import { stepCountIs } from "ai";
import type { ToolSet } from "ai";

import { createMcpClient } from "../lib/mcp.js";
import { ollamaProvider } from "../lib/ai-provider.js";

const ChatBodySchema = z.object({
  message: z.string().min(1),
  toolsToLoad: z.array(z.string()).optional(),
});

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

export async function registerChatRoutes(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    const parsedBody = ChatBodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "Invalid body",
        details: parsedBody.error.flatten(),
      });
    }

    if (!process.env.OLLAMA_API_KEY) {
      return reply.code(500).send({
        error: "Missing OLLAMA_API_KEY",
        detail: "Set OLLAMA_API_KEY in .env before starting the server.",
      });
    }

    let mcpClient;

    try {
      mcpClient = await createMcpClient();
      const allTools = await mcpClient.tools();
      const requestedTools = parsedBody.data.toolsToLoad;
      const toolNames = requestedTools?.length
        ? requestedTools
        : buildToolList(parsedBody.data.message);
      const tools = {} as ToolSet;
      for (const name of toolNames) {
        const tool = allTools[name as keyof typeof allTools];
        if (tool) tools[name] = tool;
      }

      tools.list_products = allTools.list_products;

      const modelId = "gpt-oss:20b-cloud";
      app.log.info({ modelId }, "Using Ollama model");
      const result = await generateText({
        model: ollamaProvider(modelId),
        tools,
        prompt: parsedBody.data.message, 
        stopWhen: stepCountIs(10),
        system:
          "Voce e um assistente administrativo da Nuvemshop. Regra critica: Apos executar qualquer ferramenta, voce DEVE analisar o resultado tecnico e responder ao lojista em portugues confirmando a acao ou resumindo os dados encontrados.",
      });

      const text = result.text?.trim() ?? "";
      const toolCalls = (result as { toolCalls?: unknown[] }).toolCalls ?? [];
      const toolResults = (result as { toolResults?: unknown[] }).toolResults ?? [];
      app.log.info(
        {
          finishReason: (result as { finishReason?: string }).finishReason,
          hasText: text.length > 0,
          toolCalls: toolCalls.length,
          toolResults: toolResults.length,
        },
        "LLM result summary"
      );
      if (text) {
        return reply.send({ text });
      }

      if (toolResults && toolResults.length > 0) {
        return reply.send({
          text: "Acao executada com sucesso na sua loja.",
        });
      }

      if (toolCalls && toolCalls.length > 0) {
        return reply.send({
          text: "Ferramenta executada, mas modelo nao gerou resumo.",
        });
      }

      return reply.send({ text: "" });
    } catch (error) {
      app.log.error(error);
      console.error("Chat generation error:", error);
      return reply.code(500).send({
        error: "Chat generation failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        
      });
    } finally {
      if (mcpClient) {
        try {
          await mcpClient.close();
        } catch (closeError) {
          app.log.error(closeError);
        }
      }
    }
  });
}
