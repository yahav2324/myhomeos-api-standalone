import { type Box } from '@smart-kitchen/contracts';
import type { BoxesRepository } from './boxes.repository';
import { BoxesGateway } from '../ws/boxes.gateway';
export declare class BoxesService {
    private readonly repo;
    private readonly gateway;
    constructor(repo: BoxesRepository, gateway: BoxesGateway);
    list(): Promise<Box[]>;
    findAllForHousehold(householdId: string): Promise<Box[]>;
    findByDeviceId(deviceId: string): Promise<Box | null>;
    getForHousehold(householdId: string, id: string): Promise<Box | null>;
    create(householdId: string, body: unknown): Promise<{
        ok: true;
        data: Box;
    } | {
        ok: false;
        errors: any;
    }>;
    setFullForHousehold(householdId: string, id: string, body: unknown): Promise<{
        ok: true;
        data: Box;
    } | {
        ok: false;
        errors: any;
    }>;
    recalibrateFullForHousehold(householdId: string, id: string, body: unknown): Promise<{
        ok: true;
        data: Box;
    } | {
        ok: false;
        errors: any;
    }>;
    applyTelemetryByDeviceId(input: {
        deviceId: string;
        quantity: number;
        timestamp?: string;
    }): Promise<{
        ok: true;
        data: Box;
    } | {
        ok: false;
        errors: any;
    }>;
    deleteBoxForHousehold(householdId: string, id: string): Promise<{
        ok: true;
    } | {
        ok: false;
        errors: any;
    }>;
    identifyBox(householdId: string, id: string): Promise<void | {
        ok: false;
        errors: any;
    }>;
    setFullByCodeForHousehold(householdId: string, code: string, body: unknown): Promise<{
        ok: true;
        data: Box;
    } | {
        ok: false;
        errors: any;
    } | {
        ok: boolean;
        errors: {
            formErrors: string[];
            fieldErrors: {};
        };
    }>;
}
