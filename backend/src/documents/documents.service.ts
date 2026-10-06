import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { removeOr404 } from '../common/utils/crud';
import { STANDARD_DOCUMENTS } from '../common/enums';
import { Applicant } from '../applicants/entities/applicant.entity';
import { DocumentRecord } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentRecord) private repo: Repository<DocumentRecord>,
    @InjectRepository(Applicant) private applicants: Repository<Applicant>,
  ) {}
  list(applicantId: string) { return this.repo.find({ where: { applicantId }, order: { createdAt: 'ASC' } }); }
  async create(applicantId: string, dto: CreateDocumentDto) {
    if (!(await this.applicants.existsBy({ id: applicantId }))) throw new NotFoundException('Applicant not found');
    return this.repo.save(this.repo.create({ ...dto, applicantId }));
  }
  async update(id: string, dto: UpdateDocumentDto) {
    const d = await this.repo.findOneBy({ id });
    if (!d) throw new NotFoundException('Document not found');
    return this.repo.save(Object.assign(d, dto));
  }
  async findOne(id: string) {
    const d = await this.repo.findOneBy({ id });
    if (!d) throw new NotFoundException('Document not found');
    return d;
  }
  remove(id: string) { return removeOr404(this.repo, id, 'Document'); }

  /** Adds every standard document type the applicant doesn't already have (case-insensitive). */
  async addChecklist(applicantId: string) {
    if (!(await this.applicants.existsBy({ id: applicantId }))) throw new NotFoundException('Applicant not found');
    const have = new Set((await this.list(applicantId)).map((d) => d.documentType.toLowerCase()));
    const missing = STANDARD_DOCUMENTS.filter((t) => !have.has(t.toLowerCase()));
    if (missing.length) await this.repo.save(missing.map((documentType) => this.repo.create({ applicantId, documentType })));
    return this.list(applicantId);
  }
}
