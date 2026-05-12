import type { FastifyInstance } from "fastify";

import { AuthController } from "../controllers/authController";

export async function registerAuthRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.get(
    "/install",
    {
      schema: {
        tags: ["auth"],
        summary: "OAuth install callback",
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
            },
          },
        },
      },
    },
    (request, reply) => controller.install(request, reply)
  );
}
