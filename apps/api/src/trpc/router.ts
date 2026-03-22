import { router } from "./trpc.js";
import { healthProcedure } from "./procedures/health.js";
import { notesRouter } from "./procedures/notes.js";

export const appRouter = router({
  health: healthProcedure,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
