import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { CloudinaryProvider } from "./cloudinary.provider";

@Module({
  controllers: [FilesController],
  providers: [CloudinaryProvider],
})
export class FilesModule {}
