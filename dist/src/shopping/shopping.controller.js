"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingController = void 0;
const common_1 = require("@nestjs/common");
const shopping_service_1 = require("./shopping.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let ShoppingController = class ShoppingController {
    constructor(shopping) {
        this.shopping = shopping;
    }
    getHouseholdId(req) {
        const householdId = req?.user?.activeHouseholdId;
        if (!householdId)
            throw new common_1.BadRequestException('Missing activeHouseholdId on user');
        return householdId;
    }
    listLists(req) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.listLists(householdId);
    }
    createList(req, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.createList(householdId, body);
    }
    renameList(req, id, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.renameList(householdId, id, body);
    }
    deleteList(req, id) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.deleteList(householdId, id);
    }
    listItems(req, listId) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.listItems(householdId, listId);
    }
    addItem(req, listId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.addItem(householdId, listId, body);
    }
    updateItem(req, listId, itemId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.updateItem(householdId, listId, itemId, body);
    }
    setChecked(req, listId, itemId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.updateItem(householdId, listId, itemId, { checked: body.checked });
    }
    deleteItem(req, listId, itemId) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.deleteItem(householdId, listId, itemId);
    }
    importGuest(req, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.importGuestData(householdId, body);
    }
};
exports.ShoppingController = ShoppingController;
__decorate([
    (0, common_1.Get)('lists'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "listLists", null);
__decorate([
    (0, common_1.Post)('lists'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "createList", null);
__decorate([
    (0, common_1.Patch)('lists/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "renameList", null);
__decorate([
    (0, common_1.Delete)('lists/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "deleteList", null);
__decorate([
    (0, common_1.Get)('lists/:id/items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "listItems", null);
__decorate([
    (0, common_1.Post)('lists/:id/items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)('lists/:listId/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Patch)('lists/:listId/items/:itemId/checked'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "setChecked", null);
__decorate([
    (0, common_1.Delete)('lists/:listId/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "importGuest", null);
exports.ShoppingController = ShoppingController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shopping'),
    __metadata("design:paramtypes", [shopping_service_1.ShoppingService])
], ShoppingController);
//# sourceMappingURL=shopping.controller.js.map