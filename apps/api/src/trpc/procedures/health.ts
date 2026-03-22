import { publicProcedure } from "../trpc.js";

export const healthProcedure = publicProcedure.query(() => {
  return { status: "ok", timestamp: new Date().toISOString() };
});
