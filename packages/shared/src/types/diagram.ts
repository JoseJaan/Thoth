export interface Diagram {
  id: string;
  title: string;
  data: string; // JSON Excalidraw scene
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateDiagramInput = Pick<Diagram, "title"> &
  Partial<Pick<Diagram, "data">>;

export type UpdateDiagramInput = Partial<
  Pick<Diagram, "title" | "data" | "thumbnail">
>;
