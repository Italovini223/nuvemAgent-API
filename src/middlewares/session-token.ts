import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

type SessionTokenHookOptions = {
  skipPaths?: RegExp[];
};

function parseAuthorizationHeader(authorization?: string): {
  token?: string;
  error?: string;
} {
  if (!authorization) {
    return {
      error:
        "Missing Authorization header. Expected 'Bearer <session_token>' from Nuvemshop Nexo SDK.",
    };
  }

  const [scheme, token] = authorization.split(" ");
  if (!scheme || !token) {
    return {
      error: "Malformed Authorization header. Expected 'Bearer <session_token>'.",
    };
  }

  if (scheme !== "Bearer") {
    return {
      error: "Invalid Authorization scheme. Expected 'Bearer'.",
    };
  }

  return { token };
}

export function createSessionTokenHook(options: SessionTokenHookOptions = {}) {
  const secret = process.env.TIENDANUBE_CLIENT_SECRET;
  if (!secret) {
    throw new Error("Missing TIENDANUBE_CLIENT_SECRET");
  }

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const isSkipped = options.skipPaths?.some((pattern) => pattern.test(request.url));
    if (isSkipped) return;

    const { token, error } = parseAuthorizationHeader(
      request.headers.authorization
    );
    if (!token) {
      reply.code(401).send({ error: error ?? "Unauthorized" });
      return;
    }

    try {
      jwt.verify(token, secret);
    } catch (error) {
      let message = "Session token verification failed.";
      if (error instanceof jwt.TokenExpiredError) {
        message = "Session token expired.";
      } else if (error instanceof jwt.JsonWebTokenError) {
        message = "Invalid session token.";
      }

      reply.code(401).send({
        error: message,
        detail: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  };
}
