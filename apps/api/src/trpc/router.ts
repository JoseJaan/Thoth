import { router } from "./trpc.js";
import { healthProcedure } from "./procedures/health.js";

export const appRouter = router({
  health: healthProcedure,
});

export type AppRouter = typeof appRouter;
