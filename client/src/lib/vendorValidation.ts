// client/src/lib/vendorValidation.ts
import { z } from "zod";

export const vendorSetupSchema = z.object({
    vendorType: z.enum(["product-seller", "service-provider", "hybrid"]),
    businessName: z
        .string()
        .min(2, "Business name must be at least 2 characters"),
    businessCategory: z.string().min(1, "Category is required"),
    businessDescription: z
        .string()
        .min(20, "Description must be at least 20 characters"),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
});

export type VendorSetup = z.infer<typeof vendorSetupSchema>;
