import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { IntakesService } from './intakes.service';
import { CreateIntakeDto, ListIntakesDto, UpdateIntakeDto } from './dto/intake.dto';

@Roles(...ADMIN_ROLES)
@Controller('intakes')
export class IntakesController {
  constructor(private s: IntakesService) {}
  @Get() list(@Query() q: ListIntakesDto) { return this.s.findAll(q); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Post() create(@Body() dto: CreateIntakeDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIntakeDto) { return this.s.update(id, dto); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
