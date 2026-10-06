import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { ResetPasswordDto } from '../auth/dto/auth.dto';
import { UsersService } from './users.service';
import { CreateUserDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';

@Roles(Role.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private s: UsersService) {}
  @Get() list(@Query() q: ListUsersDto) { return this.s.findAll(q); }
  @Get(':id') one(@Param('id', ParseUUIDPipe) id: string) { return this.s.findOne(id); }
  @Post() create(@Body() dto: CreateUserDto) { return this.s.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() me: AuthUser) { return this.s.update(id, dto, me.sub); }
  @HttpCode(200) @Patch(':id/password') resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResetPasswordDto) { return this.s.resetPassword(id, dto.newPassword); }
  @HttpCode(200) @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() me: AuthUser) { return this.s.remove(id, me.sub); }
}
