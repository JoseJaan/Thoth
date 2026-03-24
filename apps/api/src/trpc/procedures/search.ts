import { z } from "zod";
import { like, or } from "drizzle-orm";
import { router, publicProcedure } from "../trpc.js";
import { notes, documents, diagrams, tasks } from "../../db/schema.js";

export const searchRouter = router({
  global: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const q = `%${input.query}%`;

      const [noteResults, docResults, diagramResults, taskResults] = await Promise.all([
        ctx.db
          .select({ id: notes.id, title: notes.title, contentText: notes.contentText })
          .from(notes)
          .where(
            or(like(notes.title, q), like(notes.contentText, q))
          )
          .limit(10),
        ctx.db
          .select({ id: documents.id, title: documents.title, extractedText: documents.extractedText })
          .from(documents)
          .where(
            or(like(documents.title, q), like(documents.extractedText, q))
          )
          .limit(10),
        ctx.db
          .select({ id: diagrams.id, title: diagrams.title })
          .from(diagrams)
          .where(like(diagrams.title, q))
          .limit(10),
        ctx.db
          .select({ id: tasks.id, title: tasks.title })
          .from(tasks)
          .where(like(tasks.title, q))
          .limit(10),
      ]);

      return {
        notes: noteResults.map((n) => ({
          id: n.id,
          title: n.title,
          type: "note" as const,
          snippet: n.contentText?.substring(0, 100) || "",
        })),
        documents: docResults.map((d) => ({
          id: d.id,
          title: d.title,
          type: "document" as const,
          snippet: d.extractedText?.substring(0, 100) || "",
        })),
        diagrams: diagramResults.map((d) => ({
          id: d.id,
          title: d.title,
          type: "diagram" as const,
          snippet: "",
        })),
        tasks: taskResults.map((t) => ({
          id: t.id,
          title: t.title,
          type: "task" as const,
          snippet: "",
        })),
      };
    }),
});
