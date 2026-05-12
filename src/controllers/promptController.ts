import type { FastifyReply, FastifyRequest } from "fastify";

import { PromptServices } from "../services/promptServices";
import { ChatServices } from "@/services/chatServices";

type PromptParams = {
  name: string;
};

type ExecutePromptBody = {
  args?: Record<string, string>;
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

  async execute(request: FastifyRequest, reply: FastifyReply) {
    const { name } = request.params as PromptParams;
    const { args } = (request.body ?? {}) as ExecutePromptBody;

    try {
      // 1. Busca o texto do prompt formatado no MCP (Service 1)
      const promptServices = new PromptServices();
      const promptData = await promptServices.executePrompt(name, args);

      // 2. Instancia o serviço de chat (Service 2)
      const chatServices = new ChatServices();

      // 3. Executa a IA enviando o texto do prompt como se fosse uma mensagem do usuário
      const llmResult = await chatServices.generateReply(
        {
          message: promptData.text,
          // Como o ChatServices usa a função buildToolList que varre as palavras 
          // do texto para injetar as tools automaticamente, não precisamos nos 
          // preocupar em passar o "toolsToLoad" aqui.
        },
        request.server.log
      );

      // 4. Retorna a resposta final gerada pela IA, e não mais apenas o texto do prompt
      return reply.send(llmResult);
      
    } catch (error) {
      request.server.log.error(error);
      return reply
        .code(500)
        .send({ error: `Failed to execute prompt and generate reply: ${name}` });
    }
  }

}
