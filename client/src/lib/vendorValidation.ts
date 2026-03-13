import { z } from "zod";

const VENDOR_TYPES = [
    "product-seller",
    "service-provider",
    "digital-creator",
    "wholesaler",
    "other"
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number];

export const vendorSetupSchema = z.object({
    vendorType: z.enum(VENDOR_TYPES, {
        errorMap: () => ({ message: "Please select a valid business type" })
    }),
    businessName: z
        .string()
        .min(2, "Business name must be at least 2 characters")
        .max(100, "Business name must be under 100 characters"),
    businessCategory: z.string().min(1, "Category is required"),
    businessDescription: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(500, "Description must be under 500 characters"),
    primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex colour e.g. #6366f1")
        .optional()
        .default("#6366f1"),
    slogan: z
        .string()
        .max(100, "Slogan must be under 100 characters")
        .optional()
});

export type VendorSetup = z.infer<typeof vendorSetupSchema>;
