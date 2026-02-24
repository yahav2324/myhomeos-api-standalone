"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentHouseholdId = exports.CurrentUserId = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUserId = (0, common_1.createParamDecorator)((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user?.id;
});
exports.CurrentHouseholdId = (0, common_1.createParamDecorator)((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user?.activeHouseholdId;
});
//# sourceMappingURL=current-user.decorator.js.map