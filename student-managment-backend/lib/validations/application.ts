import { z } from "zod";
import { ServiceType, ApplicationStatus } from "@prisma/client";

export const applicationSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  details: z.string().optional(),
  // For accommodation specific fields if needed in the general app
  accommodationDetails: z.object({
    preferredCity: z.string().optional(),
    budgetMax: z.number().optional(),
    moveInDate: z.string().or(z.date()).optional(),
  }).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
