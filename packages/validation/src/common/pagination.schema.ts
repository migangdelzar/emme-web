import { z } from "zod";

export const paginationSchema = z.object({
  page: z.int().min(1),
  pageSize: z.int().min(1).max(100),
});
