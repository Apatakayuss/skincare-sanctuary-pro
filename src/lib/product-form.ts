import { z } from "zod";

export const SKIN_TYPES = ["oily", "dry", "combination", "sensitive", "normal"] as const;
export const SKINCARE_GOALS = [
  "acne",
  "hyperpigmentation",
  "dark_spots",
  "brightening",
  "hydration",
  "anti_aging",
  "oil_control",
  "sensitive_repair",
] as const;

export type SkinType = (typeof SKIN_TYPES)[number];
export type SkincareGoal = (typeof SKINCARE_GOALS)[number];

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  name: z.string().trim().min(2, "Name is required").max(200),
  brand_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  price: z.number().positive("Price must be greater than 0").max(10_000_000),
  compare_at_price: z.number().positive().max(10_000_000).nullable(),
  description: z.string().max(5000).default(""),
  ingredients: z.string().max(5000).default(""),
  usage_instructions: z.string().max(5000).default(""),
  skin_types: z.array(z.enum(SKIN_TYPES)).max(SKIN_TYPES.length),
  skincare_goals: z.array(z.enum(SKINCARE_GOALS)).max(SKINCARE_GOALS.length),
  stock_qty: z.number().int().min(0).max(1_000_000),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_bestseller: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export const emptyProduct: ProductInput = {
  slug: "",
  name: "",
  brand_id: null,
  category_id: null,
  price: 0,
  compare_at_price: null,
  description: "",
  ingredients: "",
  usage_instructions: "",
  skin_types: [],
  skincare_goals: [],
  stock_qty: 0,
  is_active: true,
  is_featured: false,
  is_bestseller: false,
};
