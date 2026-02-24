import { Box } from '@smart-kitchen/contracts';
export declare function makeCode(name: string, existingCodes: string[]): string;
export declare function computeState(percent: number): Box['state'];
export declare function computePercent(quantity: number, fullQuantity?: number): number;
export declare function toContract(row: any): Box;
