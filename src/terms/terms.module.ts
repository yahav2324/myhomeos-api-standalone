import { Module } from "@nestjs/common";
import { TermsController } from "./terms.controller";
import { TermsService } from "./terms.service";
import { TermsRepoPrisma } from "./terms.repo.prisma";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  controllers: [TermsController],
  providers: [TermsService, TermsRepoPrisma],
  exports: [TermsService],
})
export class TermsModule {}
