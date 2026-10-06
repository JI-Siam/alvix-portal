import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthUser, CurrentUser, Public, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { AuthService } from './auth.service';
import { AdminLoginDto, ApplicantLoginDto, ChangePasswordDto } from './dto/auth.dto';

const MAX_AGE = 60 * 60 * 1_000; // 1 h session
/** 5 attempts per 2-minute window — applies to both login endpoints. */
const LOGIN_LIMIT = { default: { limit: 5, ttl: 120_000 } };

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private setCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: MAX_AGE, path: '/',
    });
  }

  @Public() @Throttle(LOGIN_LIMIT) @HttpCode(200) @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    this.setCookie(res, await this.auth.adminLogin(dto));
    return { ok: true };
  }

  @Public() @Throttle(LOGIN_LIMIT) @HttpCode(200) @Post('applicant/login')
  async applicantLogin(@Body() dto: ApplicantLoginDto, @Res({ passthrough: true }) res: Response) {
    this.setCookie(res, await this.auth.applicantLogin(dto));
    return { ok: true };
  }

  @Public() @HttpCode(200) @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT) @Throttle(LOGIN_LIMIT) @HttpCode(200) @Post('change-password')
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) { return this.auth.changePassword(user, dto); }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.APPLICANT) @Get('me')
  me(@CurrentUser() user: AuthUser) { return user; }
}
