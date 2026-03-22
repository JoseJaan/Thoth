import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { config } from "./config.js";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";
import fs from "node:fs";

// Ensure data directories exist
fs.mkdirSync(config.pdfsDir, { recursive: true });

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

await app.register(fastifyStatic, {
  root: config.uploadsDir,
  prefix: "/uploads/",
});

await app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Thoth API running at http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
