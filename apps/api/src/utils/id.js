import { nanoid } from "nanoid";
export function generateId() {
    return nanoid(16);
}
export function now() {
    return new Date().toISOString();
}
//# sourceMappingURL=id.js.map