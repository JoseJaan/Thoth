export declare const linksRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getForEntity: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            entityId: string;
            entityType: "note" | "document" | "diagram" | "task";
        };
        output: {
            createdAt: string;
            sourceId: string;
            sourceType: string;
            targetId: string;
            targetType: string;
        }[];
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            sourceId: string;
            sourceType: "note" | "document" | "diagram" | "task";
            targetId: string;
            targetType: "note" | "document" | "diagram" | "task";
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            sourceId: string;
            sourceType: "note" | "document" | "diagram" | "task";
            targetId: string;
            targetType: "note" | "document" | "diagram" | "task";
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=links.d.ts.map