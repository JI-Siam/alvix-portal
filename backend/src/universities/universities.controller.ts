import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, ListUniversitiesDto, UpdateUniversityDto } from './dto/university.dto';

@Roles(...ADMIN_ROLES)
@Controller('universities')
export class UniversitiesController {
  constructor(private s: UniversitiesService) {}
  @Get() list(@Query() q: ListUniversitiesDto) { return this.s.findAll(q); }
  @Post() create(@Body() dto: CreateUniversityDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUniversityDto) { return this.s.update(id, dto); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
