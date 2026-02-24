import { createParamDecorator } from '@nestjs/common';
export const CurrentUserId = createParamDecorator((_, ctx) => {
    var _a;
    const req = ctx.switchToHttp().getRequest();
    return (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
});
export const CurrentHouseholdId = createParamDecorator((_, ctx) => {
    var _a;
    const req = ctx.switchToHttp().getRequest();
    return (_a = req.user) === null || _a === void 0 ? void 0 : _a.activeHouseholdId;
});
//# sourceMappingURL=current-user.decorator.js.map