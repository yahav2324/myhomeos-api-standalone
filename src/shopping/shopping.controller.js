import { __decorate, __metadata, __param } from "tslib";
// apps/api/src/shopping/shopping.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Delete, Req, BadRequestException, UseGuards, } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
let ShoppingController = class ShoppingController {
    constructor(shopping) {
        this.shopping = shopping;
    }
    getHouseholdId(req) {
        var _a;
        const householdId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.activeHouseholdId;
        if (!householdId)
            throw new BadRequestException('Missing activeHouseholdId on user');
        return householdId;
    }
    // ===== Lists =====
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
    // ===== Items =====
    listItems(req, listId) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.listItems(householdId, listId);
    }
    addItem(req, listId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.addItem(householdId, listId, body);
    }
    // ✅ Update item (text/qty/unit/category/extra/checked)
    updateItem(req, listId, itemId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.updateItem(householdId, listId, itemId, body);
    }
    // ✅ Toggle checked (convenience)
    setChecked(req, listId, itemId, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.updateItem(householdId, listId, itemId, { checked: body.checked });
    }
    // ✅ Delete item
    deleteItem(req, listId, itemId) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.deleteItem(householdId, listId, itemId);
    }
    importGuest(req, body) {
        const householdId = this.getHouseholdId(req);
        return this.shopping.importGuestData(householdId, body);
    }
};
__decorate([
    Get('lists'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "listLists", null);
__decorate([
    Post('lists'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "createList", null);
__decorate([
    Patch('lists/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "renameList", null);
__decorate([
    Delete('lists/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "deleteList", null);
__decorate([
    Get('lists/:id/items'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "listItems", null);
__decorate([
    Post('lists/:id/items'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "addItem", null);
__decorate([
    Patch('lists/:listId/items/:itemId'),
    __param(0, Req()),
    __param(1, Param('listId')),
    __param(2, Param('itemId')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "updateItem", null);
__decorate([
    Patch('lists/:listId/items/:itemId/checked'),
    __param(0, Req()),
    __param(1, Param('listId')),
    __param(2, Param('itemId')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "setChecked", null);
__decorate([
    Delete('lists/:listId/items/:itemId'),
    __param(0, Req()),
    __param(1, Param('listId')),
    __param(2, Param('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "deleteItem", null);
__decorate([
    Post('import'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShoppingController.prototype, "importGuest", null);
ShoppingController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('shopping'),
    __metadata("design:paramtypes", [ShoppingService])
], ShoppingController);
export { ShoppingController };
//# sourceMappingURL=shopping.controller.js.map