import { ZodSchema } from 'zod';
export declare function parseOrThrow<T>(schema: ZodSchema<T>, input: unknown): T;
