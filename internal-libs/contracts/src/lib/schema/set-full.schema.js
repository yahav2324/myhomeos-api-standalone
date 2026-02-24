import z from 'zod';
export const SetFullSchema = z.object({
    fullQuantity: z.number().positive(),
});
//# sourceMappingURL=set-full.schema.js.map