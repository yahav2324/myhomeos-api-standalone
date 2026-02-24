import type { Server } from 'socket.io';
import type { Box } from '@smart-kitchen/contracts';
export declare class BoxesGateway {
    server: Server;
    upsert(box: Box): void;
    delete(payload: {
        id: string;
    }): void;
    emitIdentifyBox(boxId: string): void;
}
