/**
 * @emme/validation — Zod schemas for form validation.
 */
export const PACKAGE_VERSION = "0.0.0";

export {
  dateSchema,
  emailSchema,
  idSchema,
  paginationSchema,
  phoneSchema,
} from "./common/index.js";
export { formatIssues, parseWithSchema } from "./helpers/index.js";
export {
  ROOT_ERROR_KEY,
  ValidationError,
  type ValidationIssue,
} from "./errors/index.js";
export type { FieldErrors, ValidationResult } from "./types/index.js";
