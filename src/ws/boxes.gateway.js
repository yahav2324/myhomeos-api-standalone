import { __decorate, __metadata } from "tslib";
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
let BoxesGateway = class BoxesGateway {
    upsert(box) {
        console.log('[WS] emit boxUpserted', box.id, box.quantity);
        this.server.emit('boxUpserted', box);
    }
    delete(payload) {
        this.server.emit('boxDeleted', payload);
    }
    emitIdentifyBox(boxId) {
        this.server.emit('identifyBox', { boxId });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Function)
], BoxesGateway.prototype, "server", void 0);
BoxesGateway = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*', // בשלב הבדיקות, כדי לוודא שזו לא הבעיה
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket'], // תואם למה שכתבת במובייל
    })
], BoxesGateway);
export { BoxesGateway };
//# sourceMappingURL=boxes.gateway.js.map