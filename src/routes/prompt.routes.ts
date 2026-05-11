import type { FastifyInstance } from "fastify";

import { PromptController } from "../controllers/promptController.js";

export async function registerPromptRoutes(app: FastifyInstance) {
  const controller = new PromptController();

  app.get("/prompts", (request, reply) =>
    controller.list(request, reply)
  );

  app.get("/prompts/:name", (request, reply) =>
    controller.getByName(request, reply)
  );
}
