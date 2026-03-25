import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const adminApplicationUpdateSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  adminNote: z.string().optional(),
});

export type AdminAppUpdateInput = z.infer<typeof adminApplicationUpdateSchema>;
