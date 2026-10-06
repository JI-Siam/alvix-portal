import { removeOr404 } from '../common/utils/crud';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { paged, skip } from '../common/utils/pagination';
import { Major } from './entities/major.entity';
import { CreateMajorDto, ListMajorsDto, UpdateMajorDto } from './dto/major.dto';

@Injectable()
export class MajorsService {
  constructor(@InjectRepository(Major) private repo: Repository<Major>) {}
  async findAll(q: ListMajorsDto) {
    const [items, total] = await this.repo.findAndCount({
      where: q.q ? { name: ILike(`%${q.q}%`) } : {}, order: { name: 'ASC' }, skip: skip(q), take: q.limit,
    });
    return paged(items, total, q);
  }
  async create(dto: CreateMajorDto) {
    if (await this.repo.existsBy({ name: dto.name.trim().toUpperCase() })) throw new ConflictException('Major already exists');
    return this.repo.save(this.repo.create(dto));
  }
  async update(id: string, dto: UpdateMajorDto) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Major not found');
    return this.repo.save(Object.assign(row, dto));
  }
  async findOne(id: string) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Major not found');
    return row;
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Major'); }
}
