import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ChatServices } from "../services/chatServices";

const ChatBodySchema = z.object({
  message: z.string().min(1),
  toolsToLoad: z.array(z.string()).optional(),
});

export class ChatController {
  async create(request: FastifyRequest, reply: FastifyReply) {
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

    try {
      const chatServices = new ChatServices();
      const result = await chatServices.generateReply(
        {
          message: parsedBody.data.message,
          toolsToLoad: parsedBody.data.toolsToLoad,
        },
        request.server.log
      );

      return reply.send(result);
    } catch (error) {
      return reply.code(500).send({
        error: "Chat generation failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
