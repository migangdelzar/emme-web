/**
 * @emme/validation — Zod schemas for form validation.
 */
export const PACKAGE_VERSION = "0.0.0";

export { dateSchema } from "./common/date.schema.js";
export { emailSchema } from "./common/email.schema.js";
export { idSchema } from "./common/id.schema.js";
export { paginationSchema } from "./common/pagination.schema.js";
export { phoneSchema } from "./common/phone.schema.js";
export { formatIssues } from "./helpers/format-issues.js";
export { parseWithSchema } from "./helpers/create-schema.js";
export type { FieldErrors, ValidationResult } from "./types/validation.types.js";
