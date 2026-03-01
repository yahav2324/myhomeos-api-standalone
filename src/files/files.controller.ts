import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { extname } from "path";
import { v2 as cloudinary } from "cloudinary";
const toStream = require("buffer-to-stream");

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileFilter(_req: any, file: any, cb: any) {
  const ext = (extname(file.originalname || "") || "").toLowerCase();
  const okExt = ALLOWED_EXT.has(ext);
  const okMime = ALLOWED_MIME.has(String(file.mimetype || "").toLowerCase());

  if (!okExt || !okMime) {
    return cb(
      new BadRequestException("Only JPG/PNG/WEBP images are allowed"),
      false,
    );
  }
  cb(null, true);
}

@UseGuards(JwtAuthGuard)
@Controller("files")
export class FilesController {
  @Post("images")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(), // שומר את הקובץ בזיכרון זמנית לצורך העלאה
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter,
    }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Missing file");

    try {
      const result: any = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "homeos_terms" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        toStream(file.buffer).pipe(upload);
      });

      // במקום נתיב מקומי /uploads/..., אנחנו מחזירים URL מלא ומאובטח
      return { ok: true, data: { imageUrl: result.secure_url } };
    } catch (error) {
      throw new BadRequestException("Failed to upload image to Cloudinary");
    }
  }
}
