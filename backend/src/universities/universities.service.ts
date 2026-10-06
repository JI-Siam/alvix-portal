import { removeOr404 } from '../common/utils/crud';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paged, skip } from '../common/utils/pagination';
import { Area } from '../areas/entities/area.entity';
import { Program } from '../programs/entities/program.entity';
import { University } from './entities/university.entity';
import { CreateUniversityDto, ListUniversitiesDto, UpdateUniversityDto } from './dto/university.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University) private repo: Repository<University>,
    @InjectRepository(Area) private areas: Repository<Area>,
    @InjectRepository(Program) private programs: Repository<Program>,
  ) {}

  async findAll(q: ListUniversitiesDto) {
    const qb = this.repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.area', 'area').leftJoinAndSelect('u.programs', 'programs')
      .orderBy('u.name', 'ASC').skip(skip(q)).take(q.limit);
    if (q.q) qb.andWhere('u.name ILIKE :q', { q: `%${q.q}%` });
    if (q.areaId) qb.andWhere('u.area_id = :areaId', { areaId: q.areaId });
    const [items, total] = await qb.getManyAndCount();
    return paged(items, total, q);
  }

  private async resolvePrograms(ids: string[]) {
    const unique = [...new Set(ids)];
    const found = await this.programs.findBy({ id: In(unique) });
    if (found.length !== unique.length) throw new BadRequestException('One or more programs do not exist');
    return found;
  }

  async create(dto: CreateUniversityDto) {
    if (!(await this.areas.existsBy({ id: dto.areaId }))) throw new BadRequestException('Area does not exist');
    if (await this.repo.existsBy({ name: dto.name.trim().toUpperCase() })) throw new ConflictException('University already exists');
    const { programIds, ...rest } = dto;
    const uni = this.repo.create(rest);
    uni.programs = programIds?.length ? await this.resolvePrograms(programIds) : [];
    return this.repo.save(uni);
  }

  async update(id: string, dto: UpdateUniversityDto) {
    const uni = await this.repo.findOne({ where: { id }, relations: { programs: true } });
    if (!uni) throw new NotFoundException('University not found');
    const { programIds, ...rest } = dto;
    if (rest.areaId && !(await this.areas.existsBy({ id: rest.areaId }))) throw new BadRequestException('Area does not exist');
    Object.assign(uni, rest);
    if (programIds) uni.programs = await this.resolvePrograms(programIds);
    return this.repo.save(uni);
  }
  async findOne(id: string) {
    const u = await this.repo.findOne({ where: { id }, relations: { area: true, programs: true } });
    if (!u) throw new NotFoundException('University not found');
    return u;
  }
  remove(id: string) { return removeOr404(this.repo, id, 'University'); }
}
