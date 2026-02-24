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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
function filename(_req, file, cb) {
    const ext = ((0, path_1.extname)(file.originalname || '.jpg') || '.jpg').toLowerCase();
    const safe = ALLOWED_EXT.has(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safe}`);
}
function fileFilter(_req, file, cb) {
    const ext = ((0, path_1.extname)(file.originalname || '') || '').toLowerCase();
    const okExt = ALLOWED_EXT.has(ext);
    const okMime = ALLOWED_MIME.has(String(file.mimetype || '').toLowerCase());
    if (!okExt || !okMime) {
        return cb(new common_1.BadRequestException('Only JPG/PNG/WEBP images are allowed'), false);
    }
    cb(null, true);
}
let FilesController = class FilesController {
    uploadImage(file) {
        if (!file)
            throw new common_1.BadRequestException('Missing file');
        const imageUrl = `/uploads/images/${file.filename}`;
        return { ok: true, data: { imageUrl } };
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: 'uploads/images',
            filename,
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "uploadImage", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('files')
], FilesController);
//# sourceMappingURL=files.controller.js.map