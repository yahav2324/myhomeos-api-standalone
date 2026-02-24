"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/app.module");
const helmet_1 = require("helmet");
const path_1 = require("path");
const express = require("express");
const fs_1 = require("fs");
const globalPrefix = "api";
async function bootstrap() {
    (0, fs_1.mkdirSync)("uploads/images", { recursive: true });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use("/uploads", express.static((0, path_1.join)(process.cwd(), "uploads")));
    app.useStaticAssets((0, path_1.join)(process.cwd(), "uploads"), { prefix: "/uploads" });
    const isProd = process.env.NODE_ENV === "production";
    const adminOrigin = process.env.ADMIN_WEB_ORIGIN;
    const mobileOrigin = process.env.MOBILE_WEB_ORIGIN;
    const allowedOrigins = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "https://api.myhomeos.app",
        "https://myhomeos.app",
        ...(adminOrigin ? [adminOrigin] : []),
        ...(mobileOrigin ? [mobileOrigin] : []),
    ];
    if (!isProd) {
        allowedOrigins.push("http://localhost:5200");
    }
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            if (origin.startsWith("http://192.168.")) {
                return cb(null, true);
            }
            common_1.Logger.error(`CORS blocked for origin: ${origin}`);
            return cb(new Error(`CORS blocked: ${origin}`), false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "x-apollo-operation-name",
        ],
    });
    app.setGlobalPrefix(globalPrefix);
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, "0.0.0.0");
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map