import { FastifyInstance } from "fastify";

import { registerAuthRoutes } from "./auth.routes";
import { registerChatRoutes } from "./chat.routes";
import { registerPromptRoutes } from "./prompt.routes";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(registerAuthRoutes, { prefix: "/auth" });
  fastify.register(registerChatRoutes, { prefix: "/api" });
  fastify.register(registerPromptRoutes, { prefix: "/api" });
}