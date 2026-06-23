export function formatNaira(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (!isFinite(n)) return "₦0";
  return "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export const SKIN_TYPES = [
  { value: "oily", label: "Oily" },
  { value: "dry", label: "Dry" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "normal", label: "Normal" },
] as const;

export const SKIN_GOALS = [
  { value: "acne", label: "Acne" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
  { value: "dark_spots", label: "Dark Spots" },
  { value: "brightening", label: "Brightening" },
  { value: "hydration", label: "Hydration" },
  { value: "anti_aging", label: "Anti-Aging" },
  { value: "oil_control", label: "Oil Control" },
  { value: "sensitive_repair", label: "Sensitive Repair" },
] as const;

export type SkinType = (typeof SKIN_TYPES)[number]["value"];
export type SkinGoal = (typeof SKIN_GOALS)[number]["value"];
