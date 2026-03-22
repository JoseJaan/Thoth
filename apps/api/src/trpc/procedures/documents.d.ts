export declare const documentsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context.js").Context;
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
//# sourceMappingURL=documents.d.ts.map