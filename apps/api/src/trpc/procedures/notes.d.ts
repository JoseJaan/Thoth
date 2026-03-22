export declare const notesRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    listAll: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            tags: ({
                id: string;
                name: string;
                color: string;
            } | undefined)[];
            id: string;
            title: string;
            content: string;
            contentText: string;
            parentId: string | null;
            isFolder: boolean;
            icon: string | null;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
        }[];
        meta: object;
    }>;
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            parentId?: string | null | undefined;
        } | undefined;
        output: {
            id: string;
            title: string;
            content: string;
            contentText: string;
            parentId: string | null;
            isFolder: boolean;
            icon: string | null;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
        }[];
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: {
            id: string;
            title: string;
            content: string;
            contentText: string;
            parentId: string | null;
            isFolder: boolean;
            icon: string | null;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
        };
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            title?: string | undefined;
            content?: string | undefined;
            parentId?: string | null | undefined;
            isFolder?: boolean | undefined;
            icon?: string | null | undefined;
        };
        output: {
            id: string;
            title: string;
            content: string;
            contentText: string;
            parentId: string | null;
            isFolder: boolean;
            icon: string | null;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            title?: string | undefined;
            content?: string | undefined;
            contentText?: string | undefined;
            parentId?: string | null | undefined;
            icon?: string | null | undefined;
            sortOrder?: number | undefined;
        };
        output: {
            id: string;
            title: string;
            content: string;
            contentText: string;
            parentId: string | null;
            isFolder: boolean;
            icon: string | null;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
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
    reorder: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            ids: string[];
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=notes.d.ts.map