export declare const searchRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    global: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            query: string;
        };
        output: {
            notes: {
                id: string;
                title: string;
                type: "note";
                snippet: string;
            }[];
            documents: {
                id: string;
                title: string;
                type: "document";
                snippet: string;
            }[];
            diagrams: {
                id: string;
                title: string;
                type: "diagram";
                snippet: string;
            }[];
            tasks: {
                id: string;
                title: string;
                type: "task";
                snippet: string;
            }[];
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=search.d.ts.map