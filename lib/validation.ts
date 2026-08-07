import { z } from 'zod';

export const orderRequestSchema = z.object({
  customerName: z.string().trim().min(1, 'Name is required'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  emailAddress: z.string().trim().email('Email must be valid'),
  exactLocation: z.string().trim().min(1, 'Location is required'),
  productName: z.string().trim().min(1, 'Product name is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  pricePerPiece: z.coerce.number().positive('Price per piece must be valid'),
  totalPrice: z.coerce.number().positive('Total price must be valid'),
  notes: z.string().trim().optional().default(''),
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
