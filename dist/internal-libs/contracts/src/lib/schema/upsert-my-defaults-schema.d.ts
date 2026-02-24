import z from 'zod';
export declare const UpsertMyDefaultsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<{
        VEGETABLES: "VEGETABLES";
        FRUITS: "FRUITS";
        DAIRY: "DAIRY";
        MEAT_FISH: "MEAT_FISH";
        BAKERY: "BAKERY";
        PANTRY: "PANTRY";
        FROZEN: "FROZEN";
        DRINKS: "DRINKS";
        SNACKS: "SNACKS";
        SPICES: "SPICES";
        CLEANING: "CLEANING";
        BABY: "BABY";
        PHARM: "PHARM";
        OTHER: "OTHER";
    }>>>;
    unit: z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<{
        PCS: "PCS";
        G: "G";
        KG: "KG";
        ML: "ML";
        L: "L";
    }>>>;
    qty: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    extras: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    unit?: "PCS" | "G" | "KG" | "ML" | "L";
    category?: "VEGETABLES" | "FRUITS" | "DAIRY" | "MEAT_FISH" | "BAKERY" | "PANTRY" | "FROZEN" | "DRINKS" | "SNACKS" | "SPICES" | "CLEANING" | "BABY" | "PHARM" | "OTHER";
    qty?: number;
    extras?: Record<string, string>;
}, {
    unit?: "PCS" | "G" | "KG" | "ML" | "L";
    category?: "VEGETABLES" | "FRUITS" | "DAIRY" | "MEAT_FISH" | "BAKERY" | "PANTRY" | "FROZEN" | "DRINKS" | "SNACKS" | "SPICES" | "CLEANING" | "BABY" | "PHARM" | "OTHER";
    qty?: number;
    extras?: Record<string, string>;
}>;
