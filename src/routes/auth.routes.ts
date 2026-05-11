import type { FastifyInstance } from "fastify";

import { AuthController } from "../controllers/authController";

export async function registerAuthRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.get("/install", (request, reply) =>
    controller.install(request, reply)
  );
}
