export declare const flashcardsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: string;
            createdAt: string;
            updatedAt: string;
            front: string;
            back: string;
            sourceId: string | null;
            sourceType: string | null;
            nextReview: string;
            interval: number;
            easeFactor: string;
            repetitions: number;
        }[];
        meta: object;
    }>;
    getDueToday: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: string;
            createdAt: string;
            updatedAt: string;
            front: string;
            back: string;
            sourceId: string | null;
            sourceType: string | null;
            nextReview: string;
            interval: number;
            easeFactor: string;
            repetitions: number;
        }[];
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: {
            id: string;
            createdAt: string;
            updatedAt: string;
            front: string;
            back: string;
            sourceId: string | null;
            sourceType: string | null;
            nextReview: string;
            interval: number;
            easeFactor: string;
            repetitions: number;
        };
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            front: string;
            back: string;
            sourceId?: string | null | undefined;
            sourceType?: string | null | undefined;
        };
        output: {
            id: string;
            front: string;
            back: string;
            sourceId: string | null;
            sourceType: string | null;
            nextReview: string;
            interval: number;
            easeFactor: string;
            repetitions: number;
            createdAt: string;
            updatedAt: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            front?: string | undefined;
            back?: string | undefined;
        };
        output: {
            id: string;
            createdAt: string;
            updatedAt: string;
            front: string;
            back: string;
            sourceId: string | null;
            sourceType: string | null;
            nextReview: string;
            interval: number;
            easeFactor: string;
            repetitions: number;
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
    review: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            rating: number;
        };
        output: {
            nextReview: string;
            interval: number;
        };
        meta: object;
    }>;
    stats: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            total: number;
            due: number;
            reviewedToday: number;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=flashcards.d.ts.map