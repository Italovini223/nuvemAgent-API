import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { appRoutes } from "./routes";

const app = Fastify({ logger: true });

await app.register(swagger, {
	openapi: {
		info: {
			title: "nuvemAgentAPI",
			version: "1.0.0",
		},
	},
});

await app.register(swaggerUi, {
	routePrefix: "/docs",
});

await app.register(cors, {
	origin: [
		"https://admin.nuvemshop.com.br",
		"https://admin.tiendanube.com",
		"http://localhost:5173",
	],
	credentials: true,
	allowedHeaders: ["Authorization", "Content-Type"],
	methods: ["GET", "POST", "OPTIONS"],
});

// app.addHook(
// 	"preHandler",
// 	createSessionTokenHook({ skipPaths: [/^\/auth\/install/] })
// );


await app.register(appRoutes);
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

try {
	await app.listen({ port, host });
} catch (error) {
	app.log.error(error);
	process.exit(1);
}
