import { Body, Controller, Delete, Get, HttpCode, StreamableFile, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { stamp, XLSX_MIME } from '../common/utils/excel';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, ListApplicationsDto, UpdateApplicationDto } from './dto/application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private s: ApplicationsService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT) @Get()
  list(@Query() q: ListApplicationsDto, @CurrentUser() u: AuthUser) { return this.s.findAll(q, u); }

  @Roles(...ADMIN_ROLES) @Get('export')
  async export(@Query() q: ListApplicationsDto, @CurrentUser() u: AuthUser) {
    return new StreamableFile(await this.s.exportXlsx(q, u), { type: XLSX_MIME, disposition: `attachment; filename="applications-${stamp()}.xlsx"` });
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT) @Get(':id')
  one(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthUser) { return this.s.findOne(id, u); }

  @Roles(...ADMIN_ROLES) @Post() create(@Body() dto: CreateApplicationDto) { return this.s.create(dto); }
  @Roles(...ADMIN_ROLES) @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateApplicationDto) { return this.s.update(id, dto); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
