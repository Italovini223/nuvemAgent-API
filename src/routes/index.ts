import { FastifyInstance } from "fastify";

import { registerAuthRoutes } from "./auth.routes.js";
import { registerChatRoutes } from "./chat.routes.js";
import { registerPromptRoutes } from "./prompt.routes.js";

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(registerAuthRoutes, { prefix: "/auth" });
  fastify.register(registerChatRoutes, { prefix: "/api" });
  fastify.register(registerPromptRoutes, { prefix: "/api" });
}