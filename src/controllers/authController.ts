import type { FastifyReply, FastifyRequest } from "fastify";

import { AuthServices } from "../services/authServices";

export class AuthController {
  async install(_request: FastifyRequest, reply: FastifyReply) {
    const authServices = new AuthServices();
    return reply.code(200).send(authServices.getInstallInfo());
  }
}
