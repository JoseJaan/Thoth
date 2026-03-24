export declare const diagramsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            data: string;
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
            thumbnail: string | null;
        }[];
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: {
            data: string;
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
            thumbnail: string | null;
        };
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            data?: string | undefined;
            title?: string | undefined;
        };
        output: {
            id: string;
            title: string;
            data: string;
            thumbnail: null;
            createdAt: string;
            updatedAt: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            data?: string | undefined;
            title?: string | undefined;
            thumbnail?: string | null | undefined;
        };
        output: {
            data: string;
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
            thumbnail: string | null;
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
}>>;
//# sourceMappingURL=diagrams.d.ts.map