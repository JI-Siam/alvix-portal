import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { MajorsService } from './majors.service';
import { CreateMajorDto, ListMajorsDto, UpdateMajorDto } from './dto/major.dto';

@Roles(...ADMIN_ROLES)
@Controller('majors')
export class MajorsController {
  constructor(private s: MajorsService) {}
  @Get() list(@Query() q: ListMajorsDto) { return this.s.findAll(q); }
  @Post() create(@Body() dto: CreateMajorDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMajorDto) { return this.s.update(id, dto); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
