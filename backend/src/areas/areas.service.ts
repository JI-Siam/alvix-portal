import { removeOr404 } from '../common/utils/crud';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { paged, skip } from '../common/utils/pagination';
import { Area } from './entities/area.entity';
import { CreateAreaDto, ListAreasDto, UpdateAreaDto } from './dto/area.dto';

@Injectable()
export class AreasService {
  constructor(@InjectRepository(Area) private repo: Repository<Area>) {}
  async findAll(q: ListAreasDto) {
    const [items, total] = await this.repo.findAndCount({
      where: q.q ? { name: ILike(`%${q.q}%`) } : {}, order: { name: 'ASC' }, skip: skip(q), take: q.limit,
    });
    return paged(items, total, q);
  }
  create(dto: CreateAreaDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateAreaDto) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Area not found');
    return this.repo.save(Object.assign(row, dto));
  }
  async findOne(id: string) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Area not found');
    return row;
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Area'); }
}
