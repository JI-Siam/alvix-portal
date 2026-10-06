import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { removeOr404 } from '../common/utils/crud';
import { paged, skip } from '../common/utils/pagination';
import { User } from './entities/user.entity';
import { CreateUserDto, ListUsersDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findAll(q: ListUsersDto) {
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC').skip(skip(q)).take(q.limit);
    if (q.q) qb.andWhere('(u.name ILIKE :q OR u.email ILIKE :q)', { q: `%${q.q}%` });
    const [items, total] = await qb.getManyAndCount();
    return paged(items, total, q);
  }
  async findOne(id: string) {
    const u = await this.repo.findOneBy({ id });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    if (await this.repo.existsBy({ email })) throw new ConflictException('Email already in use');
    const { password, ...rest } = dto;
    const saved = await this.repo.save(this.repo.create({ ...rest, email, passwordHash: await argon2.hash(password) }));
    return this.findOne(saved.id); // password_hash is select:false
  }
  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.findOne(id);
    const { password, ...rest } = dto;
    if (id === actorId && (rest.isActive === false || (rest.role && rest.role !== user.role)))
      throw new BadRequestException('You cannot deactivate or change the role of your own account');
    Object.assign(user, rest);
    if (password) user.passwordHash = await argon2.hash(password);
    await this.repo.save(user);
    return this.findOne(id);
  }
  remove(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('You cannot delete your own account');
    return removeOr404(this.repo, id, 'User');
  }

  /** Super admin sets a user's password directly, no old password needed. */
  async resetPassword(id: string, newPassword: string) {
    if (newPassword.length < 10) throw new BadRequestException('Password must be at least 10 characters');
    await this.findOne(id);
    await this.repo.update(id, { passwordHash: await argon2.hash(newPassword) });
    return { ok: true };
  }
}
