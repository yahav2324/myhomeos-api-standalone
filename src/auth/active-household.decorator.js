import { createParamDecorator } from '@nestjs/common';
export const ActiveHouseholdId = createParamDecorator((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.householdId;
});
//# sourceMappingURL=active-household.decorator.js.map