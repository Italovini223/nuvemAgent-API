import type { FastifyInstance } from "fastify";

import { ChatController } from "../controllers/chatController";

export async function registerChatRoutes(app: FastifyInstance) {
  const controller = new ChatController();

  app.post("/chat", (request, reply) =>
    controller.create(request, reply)
  );
}
