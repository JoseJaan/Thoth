import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { config } from "./config.js";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure data directories exist
fs.mkdirSync(config.pdfsDir, { recursive: true });

// Auto-run migrations on startup
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./db/index.js";

const migrationsFolder = path.resolve(__dirname, "db/migrations");
if (fs.existsSync(migrationsFolder)) {
  migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");
}

const app = Fastify({ logger: true, bodyLimit: 104857600 }); // 100MB

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

// Serve frontend static files in production
const webDistPath = path.resolve(__dirname, "../../web/dist");
if (fs.existsSync(webDistPath)) {
  await app.register(fastifyStatic, {
    root: webDistPath,
    prefix: "/",
    decorateReply: false,
  });

  // SPA fallback: serve index.html for non-API routes
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith("/trpc") || req.url.startsWith("/uploads")) {
      reply.code(404).send({ error: "Not found" });
    } else {
      reply.sendFile("index.html", webDistPath);
    }
  });
}

try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Thoth API running at http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
