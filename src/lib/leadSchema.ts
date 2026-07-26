import { z } from "zod";
import { BUSINESS_TYPES } from "./types";

export const leadInputSchema = z.object({
  businessName: z.string().trim().min(2, "Please enter your business name").max(160),
  contactName: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .min(9, "Please enter a valid phone number")
    .max(20)
    .regex(/^[+0-9\s()-]+$/, "Phone number contains invalid characters"),
  businessType: z.enum(BUSINESS_TYPES),
  message: z.string().trim().max(1000).nullable(),
  // Honeypot — must stay empty.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInputPayload = z.infer<typeof leadInputSchema>;
