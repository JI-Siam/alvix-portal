import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { AreasService } from './areas.service';
import { CreateAreaDto, ListAreasDto, UpdateAreaDto } from './dto/area.dto';

@Roles(...ADMIN_ROLES)
@Controller('areas')
export class AreasController {
  constructor(private s: AreasService) {}
  @Get() list(@Query() q: ListAreasDto) { return this.s.findAll(q); }
  @Post() create(@Body() dto: CreateAreaDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAreaDto) { return this.s.update(id, dto); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
