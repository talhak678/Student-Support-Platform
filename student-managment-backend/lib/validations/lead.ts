import { z } from "zod";
import { ServiceType } from "@prisma/client";

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  interestedService: z.nativeEnum(ServiceType).optional(),
  message: z.string().max(1000, "Message must be less than 1000 characters").optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
