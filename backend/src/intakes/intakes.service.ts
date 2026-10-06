import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { removeOr404 } from '../common/utils/crud';
import { paged, skip } from '../common/utils/pagination';
import { Intake } from './entities/intake.entity';
import { CreateIntakeDto, ListIntakesDto, UpdateIntakeDto } from './dto/intake.dto';

@Injectable()
export class IntakesService {
  constructor(@InjectRepository(Intake) private repo: Repository<Intake>) {}
  async findAll(q: ListIntakesDto) {
    const [items, total] = await this.repo.findAndCount({
      where: q.q ? { name: ILike(`%${q.q}%`) } : {}, order: { createdAt: 'DESC' }, skip: skip(q), take: q.limit,
    });
    return paged(items, total, q);
  }
  async findOne(id: string) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Intake not found');
    return row;
  }
  async create(dto: CreateIntakeDto) {
    if (await this.repo.existsBy({ name: dto.name.trim().toUpperCase() })) throw new ConflictException('Intake already exists');
    return this.repo.save(this.repo.create(dto));
  }
  async update(id: string, dto: UpdateIntakeDto) {
    const row = await this.findOne(id);
    if (dto.name && dto.name.trim().toUpperCase() !== row.name && (await this.repo.existsBy({ name: dto.name.trim().toUpperCase() })))
      throw new ConflictException('Intake already exists');
    return this.repo.save(Object.assign(row, dto));
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Intake'); }
}
