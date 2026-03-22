import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TermsService } from "./terms.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { AuthGuard } from "@nestjs/passport";

function getUserIdOrNull(req: any): string | null {
  return req?.user?.id ?? null;
}

function getUserIdOrThrow(req: any): string {
  const id = getUserIdOrNull(req);
  if (!id) throw new Error("Unauthorized (missing req.user.id)");
  return id;
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    if (err) return null;
    return user ?? null;
  }
}

@Controller()
export class TermsController {
  constructor(private readonly terms: TermsService) {}
  @UseGuards(JwtAuthGuard)
  @Put("/terms/:id/image")
  async setImage(
    @Param("id") id: string,
    @Body() body: { imageUrl: string | null; brandName?: string | null },
    @Req() req: any,
  ) {
    const userId = getUserIdOrThrow(req);
    return this.terms.setTermImage(
      id,
      body.imageUrl ?? null,
      userId,
      body.brandName ?? null,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get("/terms/suggest")
  async suggest(
    @Query("q") q: string,
    @Query("lang") lang: string,
    @Query("limit") limit: string,
    @Req() req: any,
  ) {
    const userId = getUserIdOrNull(req); // optional
    const lim = limit ? Number(limit) : 10;

    return {
      ok: true,
      data: await this.terms.suggest({
        q: q ?? "",
        lang: (lang ?? "en").toLowerCase(),
        limit: Number.isFinite(lim) ? lim : 10,
        userId,
      }),
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get("terms")
  async get(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("q") q?: string,
  ) {
    const userId = getUserIdOrNull(req);

    const lim = limit ? parseInt(limit, 10) : 20;
    const off = offset ? parseInt(offset, 10) : 0;
    const search = q?.trim();

    const result = await this.terms.findAll({
      limit: Number.isFinite(lim) ? lim : 20,
      offset: Number.isFinite(off) ? off : 0,
      search,
      userId,
    });

    return {
      ok: true,
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("/terms")
  async create(@Body() body: unknown, @Req() req: any) {
    const userId = getUserIdOrThrow(req);
    return this.terms.create(body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put("/terms/:id/my-defaults")
  async upsertMyDefaults(
    @Param("id") id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = getUserIdOrThrow(req);
    // כאן ה-body כבר מכיל בדרך כלל את ה-extras, imageUrl ו-brandName
    return this.terms.upsertMyDefaults(id, body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/terms/:id/vote")
  async vote(@Param("id") id: string, @Body() body: unknown, @Req() req: any) {
    const userId = getUserIdOrThrow(req);
    return this.terms.vote(id, body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/terms/:id")
  async remove(@Param("id") id: string, @Req() req: any) {
    const userId = getUserIdOrThrow(req);
    return this.terms.delete(id, userId);
  }
}
