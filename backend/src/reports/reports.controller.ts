import { Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Query, StreamableFile } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { ReportsService } from './reports.service';

const ALL = [Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT];
const send = (r: { buffer: Buffer; name: string }, download?: string) =>
  new StreamableFile(r.buffer, { type: 'application/pdf', disposition: `${download ? 'attachment' : 'inline'}; filename="${r.name}"` });

/** PDF printouts. Without ?download=1 the PDF opens inline (so it can be printed); with it, it downloads. */
@Controller('reports')
export class ReportsController {
  constructor(private s: ReportsService) {}

  @Roles(Role.APPLICANT) @Get('me/pdf')
  async me(@CurrentUser() u: AuthUser, @Query('download') dl?: string) { return send(await this.s.applicantPdf(u.sub), dl); }

  @Roles(...ALL) @Get('applicants/:id/pdf')
  async applicant(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthUser, @Query('download') dl?: string) {
    if (u.role === Role.APPLICANT && u.sub !== id) throw new ForbiddenException();
    return send(await this.s.applicantPdf(id), dl);
  }

  @Roles(...ALL) @Get('applications/:id/pdf')
  async application(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthUser, @Query('download') dl?: string) {
    return send(await this.s.applicationPdf(id, u), dl);
  }
}
