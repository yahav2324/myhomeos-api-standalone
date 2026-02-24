import { z } from 'zod';
export declare const CreateBoxSchema: z.ZodObject<{
    deviceId: z.ZodString;
    name: z.ZodString;
    unit: z.ZodEnum<["g", "ml"]>;
    capacity: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    deviceId?: string;
    unit?: "g" | "ml";
    name?: string;
    capacity?: number;
}, {
    deviceId?: string;
    unit?: "g" | "ml";
    name?: string;
    capacity?: number;
}>;
export type CreateBoxInput = z.infer<typeof CreateBoxSchema>;
