import type { FastifyInstance } from "fastify";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get("/auth/install", async (_request, reply) => {
    return reply.code(200).send({ ok: true });
  });
}
