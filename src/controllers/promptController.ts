import type { FastifyReply, FastifyRequest } from "fastify";

import { PromptServices } from "../services/promptServices";

type PromptParams = {
  name: string;
};

export class PromptController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const promptServices = new PromptServices();
      const result = await promptServices.listPrompts();
      return reply.send(result);
    } catch (error) {
      request.server.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch prompts" });
    }
  }

  async getByName(request: FastifyRequest, reply: FastifyReply) {
    const { name } = request.params as PromptParams;

    try {
      const promptServices = new PromptServices();
      const result = await promptServices.getPromptByName(name);
      return reply.send(result);
    } catch (error) {
      request.server.log.error(error);
      return reply
        .code(500)
        .send({ error: `Failed to fetch prompt: ${name}` });
    }
  }
}
