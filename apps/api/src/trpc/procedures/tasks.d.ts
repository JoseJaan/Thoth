export declare const tasksRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            status?: "todo" | "in_progress" | "done" | undefined;
        } | undefined;
        output: {
            id: string;
            title: string;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
            description: string | null;
            status: string;
            priority: string;
            dueDate: string | null;
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
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
            description: string | null;
            status: string;
            priority: string;
            dueDate: string | null;
        };
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            title: string;
            description?: string | null | undefined;
            status?: "todo" | "in_progress" | "done" | undefined;
            priority?: "medium" | "low" | "high" | undefined;
            dueDate?: string | null | undefined;
        };
        output: {
            id: string;
            title: string;
            description: string | null;
            status: "todo" | "in_progress" | "done";
            priority: "medium" | "low" | "high";
            dueDate: string | null;
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
            sortOrder?: number | undefined;
            description?: string | null | undefined;
            status?: "todo" | "in_progress" | "done" | undefined;
            priority?: "medium" | "low" | "high" | undefined;
            dueDate?: string | null | undefined;
        };
        output: {
            id: string;
            title: string;
            sortOrder: number;
            createdAt: string;
            updatedAt: string;
            description: string | null;
            status: string;
            priority: string;
            dueDate: string | null;
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
            tasks: {
                id: string;
                sortOrder: number;
                status: "todo" | "in_progress" | "done";
            }[];
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    listPomodoros: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            taskId?: string | undefined;
        } | undefined;
        output: {
            id: string;
            taskId: string | null;
            duration: number;
            startedAt: string;
            completedAt: string | null;
        }[];
        meta: object;
    }>;
    startPomodoro: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            taskId?: string | null | undefined;
            duration?: number | undefined;
        };
        output: {
            id: string;
            taskId: string | null;
            duration: number;
            startedAt: string;
            completedAt: null;
        };
        meta: object;
    }>;
    completePomodoro: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
        };
        output: {
            id: string;
            taskId: string | null;
            duration: number;
            startedAt: string;
            completedAt: string | null;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=tasks.d.ts.map