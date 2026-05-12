import type { FastifyInstance } from "fastify";

import { ChatController } from "../controllers/chatController";

export async function registerChatRoutes(app: FastifyInstance) {
  const controller = new ChatController();

  app.post(
    "/chat",
    {
      schema: {
        tags: ["chat"],
        summary: "Generate assistant response",
        body: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
            toolsToLoad: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              text: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "object" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
              detail: { type: "string" },
            },
          },
        },
      },
    },
    (request, reply) => controller.create(request, reply)
  );
}
