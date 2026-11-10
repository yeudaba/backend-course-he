// P20-E27: slug — regex בפונקציה וב־pipe
import { BadRequestException, Controller, Get, Injectable, Module, Param, type PipeTransform, Query } from "@nestjs/common";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class SlugPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string" || value.length > 60 || !SLUG.test(value)) {
      throw new BadRequestException(`slug לא תקין: ${value}`);
    }
    return value;
  }
}

@Controller("slugs")
export class SlugsController {
  @Get("preview")
  preview(@Query("title") title = "") {
    return { slug: slugify(title) };
  }

  @Get(":slug")
  show(@Param("slug", SlugPipe) slug: string) {
    return { slug };
  }
}

@Module({ controllers: [SlugsController] })
export class SlugsModule {}
