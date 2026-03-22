import { router } from "./trpc.js";
import { healthProcedure } from "./procedures/health.js";
import { notesRouter } from "./procedures/notes.js";
import { documentsRouter } from "./procedures/documents.js";

export const appRouter = router({
  health: healthProcedure,
  notes: notesRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
