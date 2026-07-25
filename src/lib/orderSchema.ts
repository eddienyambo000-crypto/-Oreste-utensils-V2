import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string().min(1).max(120),
  slug: z.string().min(1).max(160),
  name: z.string().min(1).max(200),
  priceRwf: z.number().int().nonnegative().max(100_000_000),
  image: z.string().max(400),
  quantity: z.number().int().min(1).max(99),
});

export const orderInputSchema = z
  .object({
    customerName: z.string().trim().min(2, "Please enter your name").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "Please enter a valid phone number")
      .max(20)
      .regex(/^[+0-9\s()-]+$/, "Phone number contains invalid characters"),
    fulfillment: z.enum(["delivery", "pickup"]),
    deliveryArea: z.string().trim().max(120).nullable(),
    note: z.string().trim().max(500).nullable(),
    items: z.array(cartItemSchema).min(1, "Your cart is empty").max(60),
    // Honeypot — must stay empty. Bots fill it in.
    company: z.string().max(0).optional().or(z.literal("")),
  })
  .refine(
    (data) => data.fulfillment !== "delivery" || Boolean(data.deliveryArea),
    { message: "Please choose a delivery area", path: ["deliveryArea"] },
  );

export type OrderInputPayload = z.infer<typeof orderInputSchema>;
