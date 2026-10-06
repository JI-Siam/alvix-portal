import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { removeOr404 } from '../common/utils/crud';
import { toXlsx } from '../common/utils/excel';
import { paged, skip } from '../common/utils/pagination';
import { Applicant } from './entities/applicant.entity';
import { CreateApplicantDto, ListApplicantsDto, UpdateApplicantDto } from './dto/applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(@InjectRepository(Applicant) private repo: Repository<Applicant>) {}

  async findAll(q: ListApplicantsDto) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').skip(skip(q)).take(q.limit);
    if (q.q) qb.andWhere(`(a.passportNumber ILIKE :q OR a.firstName ILIKE :q OR a.lastName ILIKE :q)`, { q: `%${q.q}%` });
    const [items, total] = await qb.getManyAndCount();
    return paged(items, total, q);
  }

  async findOne(id: string) {
    const a = await this.repo.findOneBy({ id });
    if (!a) throw new NotFoundException('Applicant not found');
    return a;
  }

  async create(dto: CreateApplicantDto) {
    dto.passportNumber = dto.passportNumber.trim().toUpperCase();
    if (await this.repo.existsBy({ passportNumber: dto.passportNumber })) throw new ConflictException('Passport number already registered');
    const { password, fundUsd, ...rest } = dto;
    const saved = await this.repo.save(this.repo.create({
      ...rest, fundUsd: fundUsd == null ? null : fundUsd.toFixed(2), passwordHash: await argon2.hash(password),
    }));
    return this.findOne(saved.id); // password_hash is select:false, never returned
  }

  async update(id: string, dto: UpdateApplicantDto) {
    const a = await this.findOne(id);
    const { password, fundUsd, passportNumber, ...rest } = dto;
    if (rest.firstName === null) delete rest.firstName; // required column: ignore attempts to null it
    const pn = passportNumber?.trim().toUpperCase();
    if (pn && pn !== a.passportNumber) {
      if (await this.repo.existsBy({ passportNumber: pn })) throw new ConflictException('Passport number already registered');
      a.passportNumber = pn;
    }
    Object.assign(a, rest);
    if (fundUsd !== undefined) a.fundUsd = fundUsd === null ? null : fundUsd.toFixed(2);
    if (password) a.passwordHash = await argon2.hash(password);
    await this.repo.save(a);
    return this.findOne(id);
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Applicant'); }

  /** Admin sets a new password directly, no old password needed. */
  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    await this.repo.update(id, { passwordHash: await argon2.hash(newPassword) });
    return { ok: true };
  }

  async exportXlsx(q: ListApplicantsDto) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').take(10000);
    if (q.q) qb.andWhere(`(a.passportNumber ILIKE :q OR a.firstName ILIKE :q OR a.lastName ILIKE :q)`, { q: `%${q.q}%` });
    const rows = await qb.getMany();
    const cols: [string, keyof Applicant, number?][] = [
      ['Passport No.', 'passportNumber', 16], ['First Name', 'firstName', 18], ['Last Name', 'lastName', 18], ['Date of Birth', 'dateOfBirth', 14],
      ['Gender', 'gender', 10], ['Nationality', 'nationality', 16], ['Phone', 'phone', 16], ['Email', 'email', 28], ['City', 'city', 16],
      ['Country', 'country', 16], ['Address', 'address', 32], ['Passport Expiry', 'passportExpiryDate', 16], ['Sponsor', 'sponsor', 22],
      ['Reference Person', 'referencePerson', 22], ['Bank Open Date', 'bankOpenDate', 16], ['Bank Issue Date', 'bankIssueDate', 16], ['Bank Maturity', 'bankMaturity', 16],
    ];
    return toXlsx('Applicants', [...cols.map(([header, key, width]) => ({ header, key, width })), { header: 'Fund (USD)', key: 'fundUsd', width: 16, numFmt: '#,##0.00' }],
      rows.map((r) => ({ ...Object.fromEntries(cols.map(([, k]) => [k, r[k] ?? ''])), fundUsd: r.fundUsd == null ? '' : Number(r.fundUsd) })));
  }
}
