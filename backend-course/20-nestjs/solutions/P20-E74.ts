// P20-E74: Location ב־POST
import { Body, Controller, Get, Module, NotFoundException, Param, ParseIntPipe, Post, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller("links")
export class LinksController {
  private links: { id: number; url: string }[] = [];

  @Post()
  create(@Body() body: { url: string }, @Res({ passthrough: true }) res: Response) {
    const link = { id: this.links.length + 1, url: body.url };
    this.links.push(link);
    res.location(`/links/${link.id}`);
    return link;
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    const link = this.links.find((l) => l.id === id);
    if (!link) throw new NotFoundException(`קישור ${id} לא נמצא`);
    return link;
  }
}

@Module({ controllers: [LinksController] })
export class LinksModule {}
