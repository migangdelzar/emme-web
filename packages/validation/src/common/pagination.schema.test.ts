import { describe, expect, it } from "vitest";
import { paginationSchema } from "./pagination.schema.js";

describe("paginationSchema", () => {
  it("accepts one-based pagination within the shared page-size limit", () => {
    expect(paginationSchema.safeParse({ page: 1, pageSize: 100 }).success).toBe(true);
  });

  it("rejects zero-based pages and page sizes over the shared limit", () => {
    expect(paginationSchema.safeParse({ page: 0, pageSize: 101 }).success).toBe(false);
  });
});
