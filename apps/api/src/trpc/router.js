import { router } from "./trpc.js";
import { healthProcedure } from "./procedures/health.js";
import { notesRouter } from "./procedures/notes.js";
import { documentsRouter } from "./procedures/documents.js";
import { diagramsRouter } from "./procedures/diagrams.js";
import { tasksRouter } from "./procedures/tasks.js";
import { tagsRouter } from "./procedures/tags.js";
import { linksRouter } from "./procedures/links.js";
import { searchRouter } from "./procedures/search.js";
import { flashcardsRouter } from "./procedures/flashcards.js";
export const appRouter = router({
    health: healthProcedure,
    notes: notesRouter,
    documents: documentsRouter,
    diagrams: diagramsRouter,
    tasks: tasksRouter,
    tags: tagsRouter,
    links: linksRouter,
    search: searchRouter,
    flashcards: flashcardsRouter,
});
//# sourceMappingURL=router.js.map