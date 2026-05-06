import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateText, stepCountIs } from "ai";

import { createMcpClient } from "../lib/mcp.js";
import { getOpenRouterModel } from "../lib/openrouter.js";

const ChatBodySchema = z.object({
  message: z.string().min(1),
});

export async function registerChatRoutes(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    const parsedBody = ChatBodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "Invalid body",
        details: parsedBody.error.flatten(),
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return reply.code(500).send({
        error: "Missing OPENROUTER_API_KEY",
        detail: "Set OPENROUTER_API_KEY in .env before starting the server.",
      });
    }

    let mcpClient;

    try {
      mcpClient = await createMcpClient();
      const allTools = await mcpClient.tools();
      const tools = { list_products: allTools.list_products };
      const modelId = "google/gemini-2.5-flash";
      app.log.info({ modelId }, "Using OpenRouter model");
      const result = await generateText({
        model: getOpenRouterModel(modelId),
        tools,
        prompt: parsedBody.data.message,
        maxOutputTokens: 400,
        stopWhen: stepCountIs(5),
        system:
          "Retorne os dados brutos que encontrar na ferramenta.",
      });

      return reply.send({ text: result.text });
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
