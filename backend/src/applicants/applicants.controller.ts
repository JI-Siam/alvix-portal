import { Body, Controller, Delete, Get, HttpCode, StreamableFile, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { ResetPasswordDto } from '../auth/dto/auth.dto';
import { stamp, XLSX_MIME } from '../common/utils/excel';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto, ListApplicantsDto, UpdateApplicantDto } from './dto/applicant.dto';

@Controller('applicants')
export class ApplicantsController {
  constructor(private s: ApplicantsService) {}

  @Roles(Role.APPLICANT) @Get('me')
  me(@CurrentUser() u: AuthUser) { return this.s.findOne(u.sub); }

  @Roles(...ADMIN_ROLES) @Get() list(@Query() q: ListApplicantsDto) { return this.s.findAll(q); }
  @Roles(...ADMIN_ROLES) @Get('export')
  async export(@Query() q: ListApplicantsDto) {
    return new StreamableFile(await this.s.exportXlsx(q), { type: XLSX_MIME, disposition: `attachment; filename="applicants-${stamp()}.xlsx"` });
  }
  @Roles(...ADMIN_ROLES) @HttpCode(200) @Patch(':id/password')
  resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResetPasswordDto) { return this.s.resetPassword(id, dto.newPassword); }
  @Roles(...ADMIN_ROLES) @Post() create(@Body() dto: CreateApplicantDto) { return this.s.create(dto); }
  @Roles(...ADMIN_ROLES) @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
  @Roles(...ADMIN_ROLES) @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateApplicantDto) { return this.s.update(id, dto); }
}
