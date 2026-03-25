import { z } from "zod";

export const onboardingSchema = z.object({
  // Personal Details
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
  nationality: z.string().min(2, "Nationality is required"),
  city: z.string().min(2, "City is required"),
  ukPostalCode: z.string().optional(),
  ukAddress: z.string().optional(),

  // Education Details
  highestQualification: z.string().min(2, "Qualification is required"),
  fieldOfStudy: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),

  // UK Visa & Work Eligibility
  visaStatus: z.string().min(2, "Visa status is required"),
  visaExpiryDate: z.string().or(z.date()).optional(),
  workEligibility: z.boolean().default(false),
  hoursAllowedPerWeek: z.number().int().min(0).max(168).optional(),

  // Job Preferences
  preferredJobTitles: z.string().optional(),
  preferredLocations: z.string().optional(),
  availableFrom: z.string().or(z.date()).optional(),
  cvSummary: z.string().optional(),

  // Accommodation Preference
  accommodationNeeded: z.boolean().default(false),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
