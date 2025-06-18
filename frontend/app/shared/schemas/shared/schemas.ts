import { z } from 'zod';

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string().optional(),
    code: z.string(),
    message: z.string(),
  })).optional(),
});

export const ApiResponseSchema = z.union([
  z.object({
    data: z.any(),
    success: z.boolean(),
    message: z.string().optional(),
  }),
  ApiErrorSchema,
]);

// Inferred types
export type ApiError = z.infer<typeof ApiErrorSchema>; 