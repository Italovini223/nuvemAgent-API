import type { FastifyInstance } from "fastify";

import { PromptController } from "../controllers/promptController";

export async function registerPromptRoutes(app: FastifyInstance) {
  const controller = new PromptController();

  app.get(
    "/prompts",
    {
      schema: {
        tags: ["prompts"],
        summary: "List available prompts",
        response: {
          200: {
            type: "object",
            properties: {
              prompts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    arguments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          required: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    (request, reply) => controller.list(request, reply)
  );

  app.get(
    "/prompts/:name",
    {
      schema: {
        tags: ["prompts"],
        summary: "Get prompt by name",
        params: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              prompt: { type: "object" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    (request, reply) => controller.getByName(request, reply)
  );

  app.post(
    "/prompts/:name/execute",
    {
      schema: {
        tags: ["prompts"],
        summary: "Execute prompt by name",
        params: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            args: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              name: { type: "string" },
              text: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    (request, reply) => controller.execute(request, reply)
  );
}
