"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveHouseholdId = void 0;
const common_1 = require("@nestjs/common");
exports.ActiveHouseholdId = (0, common_1.createParamDecorator)((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.householdId;
});
//# sourceMappingURL=active-household.decorator.js.map