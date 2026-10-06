import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, ListProgramsDto, UpdateProgramDto } from './dto/program.dto';

@Roles(...ADMIN_ROLES)
@Controller('programs')
export class ProgramsController {
  constructor(private s: ProgramsService) {}
  @Get() list(@Query() q: ListProgramsDto) { return this.s.findAll(q); }
  @Post() create(@Body() dto: CreateProgramDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProgramDto) { return this.s.update(id, dto); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
