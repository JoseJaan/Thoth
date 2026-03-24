export declare function ensureUploadDirs(): void;
export declare function savePdf(buffer: Buffer, originalName: string): {
    filePath: string;
    fileName: string;
};
export declare function deletePdf(relativePath: string): boolean;
export declare function getPdfFullPath(relativePath: string): string;
export declare function importFolder(folderPath: string): Promise<Array<{
    name: string;
    buffer: Buffer;
    size: number;
}>>;
//# sourceMappingURL=storage.d.ts.map