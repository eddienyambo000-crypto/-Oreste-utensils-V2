import { z } from "zod";

// The client says which product and how many. Name is only used to name a
// line that is no longer available; price, slug and image are ignored and
// re-read from the database (see lib/orderPricing.ts).
const cartItemSchema = z.object({
  productId: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
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
