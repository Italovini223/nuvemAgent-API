import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { createSessionTokenHook } from "./middlewares/session-token.js";
import { registerChatRoutes } from "./routes/chat.js";
import { registerAuthRoutes } from "./routes/auth.js";

const app = Fastify({ logger: true });

await app.register(cors, {
	origin: ["https://admin.nuvemshop.com.br", "https://admin.tiendanube.com"],
	credentials: true,
	allowedHeaders: ["Authorization", "Content-Type"],
	methods: ["GET", "POST", "OPTIONS"],
});

// app.addHook(
// 	"preHandler",
// 	createSessionTokenHook({ skipPaths: [/^\/auth\/install/] })
// );

await app.register(registerChatRoutes, { prefix: "/api" });
await app.register(registerAuthRoutes);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

try {
	await app.listen({ port, host });
} catch (error) {
	app.log.error(error);
	process.exit(1);
}
