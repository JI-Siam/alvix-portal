import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ApplicationStatus, Role } from '../common/enums';
import { AuthUser } from '../common/decorators';
import { removeOr404 } from '../common/utils/crud';
import { toXlsx } from '../common/utils/excel';
import { paged, skip } from '../common/utils/pagination';
import { Applicant } from '../applicants/entities/applicant.entity';
import { University } from '../universities/entities/university.entity';
import { Program } from '../programs/entities/program.entity';
import { Major } from '../majors/entities/major.entity';
import { Intake } from '../intakes/entities/intake.entity';
import { Application } from './entities/application.entity';
import { CreateApplicationDto, ListApplicationsDto, UpdateApplicationDto } from './dto/application.dto';

type Sel = { universityId: string; programId: string; majorId: string; intakeId: string };

@Injectable()
export class ApplicationsService {
  constructor(@InjectRepository(Application) private repo: Repository<Application>, private ds: DataSource) {}

  /**
   * Validates only what changed (so editing e.g. the status of an application whose university was later
   * deactivated still works). The university must always offer the selected program.
   */
  private async validateSelection(m: EntityManager, sel: Sel, prev?: Sel) {
    const changed = (k: keyof Sel) => !prev || sel[k] !== prev[k];
    if (changed('universityId') || changed('programId')) {
      const uni = await m.findOne(University, { where: { id: sel.universityId }, relations: { programs: true } });
      if (!uni || (changed('universityId') && !uni.isActive)) throw new BadRequestException('University does not exist or is inactive');
      if (changed('programId')) {
        const program = await m.findOneBy(Program, { id: sel.programId });
        if (!program || !program.isActive) throw new BadRequestException('Program does not exist or is inactive');
      }
      if (!uni.programs.some((p) => p.id === sel.programId)) throw new BadRequestException('This university does not offer the selected program');
    }
    if (changed('majorId')) {
      const major = await m.findOneBy(Major, { id: sel.majorId });
      if (!major || !major.isActive) throw new BadRequestException('Major does not exist or is inactive');
    }
    if (changed('intakeId')) {
      const intake = await m.findOneBy(Intake, { id: sel.intakeId });
      if (!intake || !intake.isActive) throw new BadRequestException('Intake does not exist or is inactive');
    }
  }

  /** APP-2026-000123, from a Postgres sequence so concurrent inserts can never collide. */
  private async nextApplicationId(m: EntityManager) {
    const [{ n }] = await m.query(`SELECT nextval('application_id_seq') AS n`);
    return `APP-${new Date().getFullYear()}-${String(n).padStart(6, '0')}`;
  }

  async create(dto: CreateApplicationDto) {
    const id = await this.ds.transaction(async (m) => {
      if (!(await m.existsBy(Applicant, { id: dto.applicantId }))) throw new BadRequestException('Applicant does not exist');
      await this.validateSelection(m, dto);
      // Use the provided applicationId or generate one from the sequence
      const applicationId = dto.applicationId?.trim()
        ? dto.applicationId.trim().toUpperCase()
        : await this.nextApplicationId(m);
      // Ensure uniqueness
      if (await m.existsBy(Application, { applicationId }))
        throw new BadRequestException(`Application ID "${applicationId}" is already in use`);
      const app = m.create(Application, { ...dto, applicationId, status: dto.status ?? ApplicationStatus.PENDING });
      return (await m.save(app)).id;
    });
    return this.findOne(id);
  }

  private base() {
    return this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.applicant', 'applicant')
      .leftJoinAndSelect('a.university', 'university')
      .leftJoinAndSelect('university.area', 'area')
      .leftJoinAndSelect('a.program', 'program')
      .leftJoinAndSelect('a.major', 'major')
      .leftJoinAndSelect('a.intake', 'intake');
  }

  private filtered(q: ListApplicationsDto, user: AuthUser) {
    const qb = this.base().orderBy('a.createdAt', 'DESC');
    const applicantId = user.role === Role.APPLICANT ? user.sub : q.applicantId;
    if (applicantId) qb.andWhere('a.applicantId = :applicantId', { applicantId });
    if (q.status) qb.andWhere('a.status = :status', { status: q.status });
    if (q.universityId) qb.andWhere('a.universityId = :u', { u: q.universityId });
    if (q.areaId) qb.andWhere('university.areaId = :areaId', { areaId: q.areaId });
    if (q.majorId) qb.andWhere('a.majorId = :m', { m: q.majorId });
    if (q.programId) qb.andWhere('a.programId = :p', { p: q.programId });
    if (q.intakeId) qb.andWhere('a.intakeId = :i', { i: q.intakeId });
    if (q.q) qb.andWhere(
      '(a.applicationId ILIKE :q OR applicant.passportNumber ILIKE :q OR applicant.firstName ILIKE :q OR applicant.lastName ILIKE :q)',
      { q: `%${q.q}%` },
    );
    return qb;
  }

  async findAll(q: ListApplicationsDto, user: AuthUser) {
    const [items, total] = await this.filtered(q, user).skip(skip(q)).take(q.limit).getManyAndCount();
    return paged(items, total, q);
  }

  /** Excel export of everything matching the current filters (max 10,000 rows). */
  async exportXlsx(q: ListApplicationsDto, user: AuthUser) {
    const rows = await this.filtered(q, user).take(10000).getMany();
    return toXlsx('Applications', [
      { header: 'Application ID', key: 'applicationId', width: 18 }, { header: 'Status', key: 'status', width: 20 },
      { header: 'Application Date', key: 'applicationDate', width: 16 }, { header: 'Intake', key: 'intake', width: 18 },
      { header: 'Applicant', key: 'applicant', width: 26 }, { header: 'Passport No.', key: 'passport', width: 16 },
      { header: 'University', key: 'university', width: 32 }, { header: 'Program', key: 'program', width: 24 },
      { header: 'Major', key: 'major', width: 26 }, { header: 'Notes', key: 'notes', width: 40 },
    ], rows.map((a) => ({
      applicationId: a.applicationId, status: a.status.replace(/_/g, ' '), applicationDate: a.applicationDate ?? '', intake: a.intake?.name,
      applicant: `${a.applicant?.firstName ?? ''} ${a.applicant?.lastName ?? ''}`.trim(), passport: a.applicant?.passportNumber,
      university: a.university?.name, program: a.program?.name, major: a.major?.name, notes: a.notes ?? '',
    })));
  }

  async findOne(id: string, user?: AuthUser) {
    const app = await this.base().where('a.id = :id', { id }).getOne();
    if (!app) throw new NotFoundException('Application not found');
    if (user?.role === Role.APPLICANT && app.applicantId !== user.sub) throw new ForbiddenException();
    return app;
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.ds.transaction(async (m) => {
      const app = await m.findOneBy(Application, { id });
      if (!app) throw new NotFoundException('Application not found');
      // Validate uniqueness if applicationId is being changed
      if (dto.applicationId && dto.applicationId.trim().toUpperCase() !== app.applicationId) {
        const newId = dto.applicationId.trim().toUpperCase();
        if (await m.existsBy(Application, { applicationId: newId }))
          throw new BadRequestException(`Application ID "${newId}" is already in use`);
        dto.applicationId = newId;
      }
      const prev: Sel = { universityId: app.universityId, programId: app.programId, majorId: app.majorId, intakeId: app.intakeId };
      const next: Sel = {
        universityId: dto.universityId ?? prev.universityId, programId: dto.programId ?? prev.programId,
        majorId: dto.majorId ?? prev.majorId, intakeId: dto.intakeId ?? prev.intakeId,
      };
      await this.validateSelection(m, next, prev);
      Object.assign(app, dto);
      await m.save(app);
    });
    return this.findOne(id);
  }

  remove(id: string) { return removeOr404(this.repo, id, 'Application'); }
}
