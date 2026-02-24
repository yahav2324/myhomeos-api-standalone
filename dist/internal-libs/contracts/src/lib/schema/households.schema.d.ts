import { z } from 'zod';
export declare const CreateHouseholdSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
}, {
    name?: string;
}>;
export type CreateHouseholdDto = z.infer<typeof CreateHouseholdSchema>;
