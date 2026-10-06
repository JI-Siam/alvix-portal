import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { ADMIN_ROLES, Role } from '../common/enums';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Controller()
export class DocumentsController {
  constructor(private s: DocumentsService) {}

  // Applicants may read their own checklist only.
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT) @Get('applicants/:id/documents')
  list(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: AuthUser) {
    if (u.role === Role.APPLICANT && u.sub !== id) throw new ForbiddenException();
    return this.s.list(id);
  }
  @Roles(...ADMIN_ROLES) @Post('applicants/:id/documents')
  create(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateDocumentDto) { return this.s.create(id, dto); }
  @Roles(...ADMIN_ROLES) @Patch('documents/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDocumentDto) { return this.s.update(id, dto); }
  @Roles(...ADMIN_ROLES) @HttpCode(200) @Post('applicants/:id/documents/checklist')
  checklist(@Param('id', ParseUUIDPipe) id: string) { return this.s.addChecklist(id); }
  @Roles(...ADMIN_ROLES) @Get('documents/:id')
  one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Roles(Role.SUPER_ADMIN) @HttpCode(200) @Delete('documents/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.s.remove(id); }
}
