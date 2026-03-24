import { nanoid } from "nanoid";

export function generateId(): string {
  return nanoid(16);
}

export function now(): string {
  return new Date().toISOString();
}
