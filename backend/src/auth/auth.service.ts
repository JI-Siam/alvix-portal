import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/decorators';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { Applicant } from '../applicants/entities/applicant.entity';
import { AdminLoginDto, ApplicantLoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Applicant) private applicants: Repository<Applicant>,
    private jwt: JwtService,
  ) {}

  // A real hash verified against when the account doesn't exist, so timing doesn't reveal valid logins.
  private dummyHash = argon2.hash('timing-equalizer');

  private async check(hash: string | undefined, password: string) {
    try { return (await argon2.verify(hash ?? (await this.dummyHash), password)) && !!hash; } catch { return false; }
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.users.createQueryBuilder('u').addSelect('u.passwordHash')
      .where('u.email = :email', { email: dto.email.toLowerCase() }).getOne();
    const ok = await this.check(user?.passwordHash, dto.password);
    if (!ok || !user!.isActive) throw new UnauthorizedException('Invalid credentials');
    return this.jwt.signAsync({ sub: user!.id, role: user!.role });
  }

  async applicantLogin(dto: ApplicantLoginDto) {
    const a = await this.applicants.createQueryBuilder('a').addSelect('a.passwordHash')
      .where('a.passportNumber = :p', { p: dto.passportNumber.trim().toUpperCase() }).getOne();
    const ok = await this.check(a?.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.jwt.signAsync({ sub: a!.id, role: Role.APPLICANT });
  }

  /** Any logged-in user (admin, super admin or applicant) changes their own password; the old one is required. */
  async changePassword(user: AuthUser, dto: ChangePasswordDto) {
    const isApplicant = user.role === Role.APPLICANT;
    const repo: Repository<any> = isApplicant ? this.applicants : this.users;
    const row = await repo.createQueryBuilder('x').addSelect('x.passwordHash').where('x.id = :id', { id: user.sub }).getOne();
    if (!row || !(await this.check(row.passwordHash, dto.currentPassword))) throw new BadRequestException('Current password is incorrect');
    const min = isApplicant ? 8 : 10;
    if (dto.newPassword.length < min) throw new BadRequestException(`New password must be at least ${min} characters`);
    if (dto.newPassword === dto.currentPassword) throw new BadRequestException('New password must be different from the current one');
    await repo.update(user.sub, { passwordHash: await argon2.hash(dto.newPassword) });
    return { ok: true };
  }
}
