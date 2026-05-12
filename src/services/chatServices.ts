import { generateText } from "ai-sdk-ollama";
import { stepCountIs } from "ai";
import type { ToolSet } from "ai";
import type { FastifyBaseLogger } from "fastify";

import { createMcpClient } from "../lib/mcp";
import { ollamaProvider } from "../lib/ai-provider";

export type ChatInput = {
  message: string;
  toolsToLoad?: string[];
};

function buildToolList(message: string): string[] {
  const normalized = message.toLowerCase();
  const tools = new Set<string>();

// Produtos, Estoque e Performance
    if (
      normalized.includes("produto") || normalized.includes("estoque") || 
      normalized.includes("product") || normalized.includes("stock") ||
      normalized.includes("inventory") || normalized.includes("performance")
    ) {
      tools.add("list_products");
      tools.add("get_product");
      tools.add("update_product");
      tools.add("update_product_stock_price");
      tools.add("list_product_variants");
    }

    // Pedidos, Vendas e Faturamento (CRUCIAL PARA ANÁLISES)
    if (
      normalized.includes("pedido") || normalized.includes("order") || 
      normalized.includes("venda") || normalized.includes("sales") || 
      normalized.includes("revenue") || normalized.includes("performance")
    ) {
      tools.add("list_orders");
      tools.add("get_order");
    }

    // Categorias
    if (normalized.includes("categoria") || normalized.includes("category")) {
      tools.add("list_categories");
      tools.add("create_category");
      tools.add("update_category");
    }

    // Cupons
    if (normalized.includes("cupom") || normalized.includes("coupon")) {
      tools.add("list_coupons");
      tools.add("create_coupon");
    }

    // Carrinhos Abandonados
    if (normalized.includes("abandoned") || normalized.includes("carrinho")) {
      tools.add("list_abandoned_checkouts");
      tools.add("get_abandoned_checkout");
      tools.add("add_coupon_to_abandoned_checkout");
    }

    // Blog
    if (normalized.includes("blog") || normalized.includes("post")) {
      tools.add("get_blog");
      tools.add("list_blog_posts");
      tools.add("get_blog_post");
      tools.add("create_blog_post");
      tools.add("update_blog_post");
    }

    // Fallback garantido
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
        system:`Você é um Consultor de Negócios e Agente Administrativo da Nuvemshop. 
          REGRAS CRÍTICAS E INQUEBRÁVEIS:
          1. VOCÊ TEM ACESSO ÀS FERRAMENTAS (TOOLS) DA LOJA. VOCÊ DEVE EXECUTÁ-LAS!
          2. NUNCA escreva exemplos de código, endpoints HTTP ou tutoriais.
          3. REGRA ANTI-ALUCINAÇÃO: Se a ferramenta retornar uma lista vazia ([]), erro, ou nenhum dado, NUNCA invente nomes de produtos, clientes, valores ou pedidos. 
          4. Se não houver dados, aborte a formatação da tabela e responda APENAS: "Não há dados registrados ou suficientes na loja para esta análise no momento."
          5. Fale diretamente com o lojista de forma clara e executiva.`,
        
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
