export type TaggableType = "note" | "document" | "diagram" | "task";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Taggable {
  tagId: string;
  taggableId: string;
  taggableType: TaggableType;
}

export type CreateTagInput = Pick<Tag, "name" | "color">;
export type UpdateTagInput = Partial<Pick<Tag, "name" | "color">>;
