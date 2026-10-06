import { removeOr404 } from '../common/utils/crud';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { paged, skip } from '../common/utils/pagination';
import { Program } from './entities/program.entity';
import { CreateProgramDto, ListProgramsDto, UpdateProgramDto } from './dto/program.dto';

@Injectable()
export class ProgramsService {
  constructor(@InjectRepository(Program) private repo: Repository<Program>) {}
  async findAll(q: ListProgramsDto) {
    const [items, total] = await this.repo.findAndCount({
      where: q.q ? { name: ILike(`%${q.q}%`) } : {}, order: { name: 'ASC' }, skip: skip(q), take: q.limit,
    });
    return paged(items, total, q);
  }
  create(dto: CreateProgramDto) { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateProgramDto) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Program not found');
    return this.repo.save(Object.assign(row, dto));
  }
  async findOne(id: string) {
    const row = await this.repo.findOneBy({ id });
    if (!row) throw new NotFoundException('Program not found');
    return row;
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Program'); }
}
