export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("./context.js").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            status: string;
            timestamp: string;
        };
        meta: object;
    }>;
    notes: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    documents: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        listFolders: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                parentId?: string | null | undefined;
            } | undefined;
            output: {
                id: string;
                name: string;
                parentId: string | null;
                sortOrder: number;
                createdAt: string;
            }[];
            meta: object;
        }>;
        createFolder: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                parentId?: string | null | undefined;
            };
            output: {
                id: string;
                name: string;
                parentId: string | null;
                sortOrder: number;
                createdAt: string;
            };
            meta: object;
        }>;
        deleteFolder: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        renameFolder: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                name: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                readingStatus?: string | undefined;
                folderId?: string | null | undefined;
            } | undefined;
            output: {
                id: string;
                title: string;
                createdAt: string;
                updatedAt: string;
                authors: string | null;
                filePath: string;
                originalName: string;
                fileSize: number;
                readingStatus: string;
                extractedText: string | null;
                summary: string | null;
                folderId: string | null;
            }[];
            meta: object;
        }>;
        listAll: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                id: string;
                title: string;
                createdAt: string;
                updatedAt: string;
                authors: string | null;
                filePath: string;
                originalName: string;
                fileSize: number;
                readingStatus: string;
                extractedText: string | null;
                summary: string | null;
                folderId: string | null;
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
                createdAt: string;
                updatedAt: string;
                authors: string | null;
                filePath: string;
                originalName: string;
                fileSize: number;
                readingStatus: string;
                extractedText: string | null;
                summary: string | null;
                folderId: string | null;
            };
            meta: object;
        }>;
        upload: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileName: string;
                fileData: string;
                folderId?: string | null | undefined;
            };
            output: {
                id: string;
                title: string;
                authors: null;
                filePath: string;
                originalName: string;
                fileSize: number;
                readingStatus: string;
                extractedText: string;
                folderId: string | null;
                createdAt: string;
                updatedAt: string;
            };
            meta: object;
        }>;
        importFromFolder: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                folderPath: string;
                targetFolderId?: string | null | undefined;
            };
            output: {
                imported: number;
                ids: string[];
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                title?: string | undefined;
                authors?: string | null | undefined;
                readingStatus?: "unread" | "to_read" | "reading" | "read" | undefined;
                summary?: string | null | undefined;
                folderId?: string | null | undefined;
            };
            output: {
                id: string;
                title: string;
                createdAt: string;
                updatedAt: string;
                authors: string | null;
                filePath: string;
                originalName: string;
                fileSize: number;
                readingStatus: string;
                extractedText: string | null;
                summary: string | null;
                folderId: string | null;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                deleteFile?: boolean | undefined;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        listNotes: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                documentId: string;
            };
            output: {
                id: string;
                content: string;
                contentText: string;
                createdAt: string;
                updatedAt: string;
                documentId: string;
                pageNumber: number | null;
            }[];
            meta: object;
        }>;
        createNote: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                documentId: string;
                content?: string | undefined;
                pageNumber?: number | null | undefined;
            };
            output: {
                id: string;
                documentId: string;
                content: string;
                contentText: string;
                pageNumber: number | null;
                createdAt: string;
                updatedAt: string;
            };
            meta: object;
        }>;
        updateNote: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                content?: string | undefined;
                contentText?: string | undefined;
                pageNumber?: number | null | undefined;
            };
            output: {
                id: string;
                content: string;
                contentText: string;
                createdAt: string;
                updatedAt: string;
                documentId: string;
                pageNumber: number | null;
            };
            meta: object;
        }>;
        deleteNote: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
    }>>;
    diagrams: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    tasks: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    tags: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    links: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    search: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
    flashcards: import("@trpc/server").TRPCBuiltRouter<{
        ctx: import("./context.js").Context;
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
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=router.d.ts.map