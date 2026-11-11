// P20-E26: מודול סימניות — מקובץ ריק
import { Body, Controller, Delete, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Length } from "class-validator";

export interface Bookmark {
  id: number;
  url: string;
  title: string;
  tags: string[];
}

export class CreateBookmarkDto {
  @IsUrl()
  url: string;

  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags?: string[];
}

@Injectable()
export class BookmarksService {
  private readonly bookmarks: Bookmark[] = [];
  private nextId = 1;

  list(tag?: string): Bookmark[] {
    return tag === undefined ? this.bookmarks : this.bookmarks.filter((b) => b.tags.includes(tag));
  }

  get(id: number): Bookmark {
    const bookmark = this.bookmarks.find((b) => b.id === id);
    if (!bookmark) throw new NotFoundException(`סימנייה ${id} לא נמצאה`);
    return bookmark;
  }

  create(dto: CreateBookmarkDto): Bookmark {
    const bookmark = { id: this.nextId++, url: dto.url, title: dto.title.trim(), tags: dto.tags ?? [] };
    this.bookmarks.push(bookmark);
    return bookmark;
  }

  remove(id: number): void {
    const bookmark = this.get(id);
    this.bookmarks.splice(this.bookmarks.indexOf(bookmark), 1);
  }
}

@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get()
  list(@Query("tag") tag?: string) {
    return this.bookmarks.list(tag);
  }

  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.bookmarks.get(id);
  }

  @Post()
  create(@Body() dto: CreateBookmarkDto) {
    return this.bookmarks.create(dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number) {
    this.bookmarks.remove(id);
  }
}

@Module({ controllers: [BookmarksController], providers: [BookmarksService] })
export class BookmarksModule {}
