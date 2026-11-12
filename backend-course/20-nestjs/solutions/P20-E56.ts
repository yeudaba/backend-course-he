// P20-E56: עמודים עם קישורים — next ו־prev
import { Controller, Get, Module, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const ARTICLES = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1;
  const special: Record<number, string> = { 7: "Nest Tips", 21: "More Nest" };
  return { id, title: special[id] ?? `Article ${id}` };
});

export class ListArticlesQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20)
  limit = 5;

  @IsOptional() @IsString()
  q?: string;
}

@Controller("articles")
export class ArticlesController {
  @Get()
  list(@Query() { page, limit, q }: ListArticlesQuery) {
    const all = q ? ARTICLES.filter((a) => a.title.toLowerCase().includes(q.toLowerCase())) : ARTICLES;
    const total = all.length;
    const pages = Math.ceil(total / limit);
    const link = (p: number) => "/articles?" + new URLSearchParams({ ...(q ? { q } : {}), page: String(p), limit: String(limit) });
    return {
      data: all.slice((page - 1) * limit, page * limit),
      meta: { page, limit, total, pages },
      links: { self: link(page), next: page < pages ? link(page + 1) : null, prev: page > 1 ? link(page - 1) : null },
    };
  }
}

@Module({ controllers: [ArticlesController] })
export class ArticlesModule {}
