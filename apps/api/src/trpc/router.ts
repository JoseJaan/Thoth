import { router } from "./trpc.js";
import { healthProcedure } from "./procedures/health.js";
import { notesRouter } from "./procedures/notes.js";
import { documentsRouter } from "./procedures/documents.js";
import { diagramsRouter } from "./procedures/diagrams.js";
import { tasksRouter } from "./procedures/tasks.js";

export const appRouter = router({
  health: healthProcedure,
  notes: notesRouter,
  documents: documentsRouter,
  diagrams: diagramsRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
