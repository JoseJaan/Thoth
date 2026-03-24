export declare const tagsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: string;
            name: string;
            color: string;
        }[];
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            color?: string | undefined;
        };
        output: {
            id: string;
            name: string;
            color: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            name?: string | undefined;
            color?: string | undefined;
        };
        output: {
            id: string;
            name: string;
            color: string;
        };
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    getForEntity: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            entityId: string;
            entityType: "note" | "document" | "diagram" | "task";
        };
        output: {
            id: string;
            name: string;
            color: string;
        }[];
        meta: object;
    }>;
    addToEntity: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tagId: string;
            entityId: string;
            entityType: "note" | "document" | "diagram" | "task";
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    removeFromEntity: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tagId: string;
            entityId: string;
            entityType: "note" | "document" | "diagram" | "task";
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=tags.d.ts.map