import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/decorators';
import { Role } from '../common/enums';
import { Applicant } from '../applicants/entities/applicant.entity';
import { Application } from '../applications/entities/application.entity';
import { DocumentRecord } from '../documents/entities/document.entity';
import { PdfReport } from './pdf-report';

const txt = (s?: string | null) => (s ? s.replace(/_/g, ' ') : '');
const usd = (v?: string | null) => (v == null ? '' : `USD ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const fullName = (a: Applicant) => `${a.firstName} ${a.lastName ?? ''}`.trim();
const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]+/g, '-');

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Applicant) private applicants: Repository<Applicant>,
    @InjectRepository(Application) private apps: Repository<Application>,
    @InjectRepository(DocumentRecord) private docs: Repository<DocumentRecord>,
  ) {}

  private docRows(docs: DocumentRecord[]) { return docs.map((d) => [d.documentType, txt(d.status), d.receivedDate ?? '', d.notes ?? '']); }
  private docSummary(docs: DocumentRecord[]) {
    const done = docs.filter((d) => d.status === 'RECEIVED' || d.status === 'VERIFIED').length;
    return `${done} of ${docs.length} documents received or verified.`;
  }
  private profile(r: PdfReport, a: Applicant) {
    r.heading('Passport & personal information');
    r.kv([['Passport number', a.passportNumber], ['Passport expiry', a.passportExpiryDate], ['First name', a.firstName], ['Last name', a.lastName],
      ['Date of birth', a.dateOfBirth], ['Gender', a.gender], ['Nationality', a.nationality]]);
    r.heading('Contact');
    r.kv([['Phone', a.phone], ['Email', a.email], ['City', a.city], ['Country', a.country], ['Address', a.address]]);
    r.heading('Sponsor & bank details');
    r.kv([['Sponsor', a.sponsor], ['Reference person', a.referencePerson], ['Fund (USD)', usd(a.fundUsd)],
      ['Bank open date', a.bankOpenDate], ['Bank issue date', a.bankIssueDate], ['Bank maturity', a.bankMaturity]]);
  }

  /** Full applicant file: profile + documents + all applications. */
  async applicantPdf(id: string) {
    const a = await this.applicants.findOneBy({ id });
    if (!a) throw new NotFoundException('Applicant not found');
    const [docs, apps] = await Promise.all([
      this.docs.find({ where: { applicantId: id }, order: { createdAt: 'ASC' } }),
      this.apps.find({ where: { applicantId: id }, relations: { university: true, program: true, major: true, intake: true }, order: { createdAt: 'ASC' } }),
    ]);
    const r = new PdfReport('Applicant profile');
    r.banner(fullName(a), `Passport ${a.passportNumber}`);
    this.profile(r, a);
    r.heading('Documents');
    r.note(this.docSummary(docs));
    r.table([{ label: 'Document', w: 3 }, { label: 'Status', w: 1.4 }, { label: 'Received on', w: 1.4 }, { label: 'Notes', w: 3 }], this.docRows(docs), 'No documents recorded.');
    r.heading('Applications');
    r.table([{ label: 'Application ID', w: 1.6 }, { label: 'University', w: 2.4 }, { label: 'Program', w: 1.6 }, { label: 'Major', w: 1.8 }, { label: 'Intake', w: 1.4 }, { label: 'Date', w: 1.2 }, { label: 'Status', w: 1.5 }],
      apps.map((p) => [p.applicationId, p.university?.name, p.program?.name, p.major?.name, p.intake?.name, p.applicationDate ?? '', txt(p.status)]), 'No applications yet.');
    return { buffer: await r.finish(), name: `applicant-${safe(a.passportNumber)}.pdf` };
  }

  /** One application sheet: application details + applicant summary + document checklist. */
  async applicationPdf(id: string, user: AuthUser) {
    const p = await this.apps.findOne({ where: { id }, relations: { applicant: true, university: { area: true }, program: true, major: true, intake: true } });
    if (!p) throw new NotFoundException('Application not found');
    if (user.role === Role.APPLICANT && p.applicantId !== user.sub) throw new ForbiddenException();
    const a = p.applicant;
    const docs = await this.docs.find({ where: { applicantId: a.id }, order: { createdAt: 'ASC' } });
    const r = new PdfReport('Application sheet');
    r.banner(p.applicationId, `${fullName(a)}  -  Passport ${a.passportNumber}`);
    r.heading('Application details');
    r.kv([['Application ID', p.applicationId], ['Status', txt(p.status)], ['Intake', p.intake?.name], ['Application date', p.applicationDate],
      ['University', p.university?.name], ['Area', p.university?.area?.name], ['Program', p.program?.name], ['Major', p.major?.name], ['Notes', p.notes]]);
    r.heading('Applicant');
    r.kv([['Full name', fullName(a)], ['Passport number', a.passportNumber], ['Passport expiry', a.passportExpiryDate], ['Date of birth', a.dateOfBirth],
      ['Gender', a.gender], ['Nationality', a.nationality], ['Phone', a.phone], ['Email', a.email], ['Address', [a.address, a.city, a.country].filter(Boolean).join(', ')]]);
    r.heading('Sponsor & bank details');
    r.kv([['Sponsor', a.sponsor], ['Reference person', a.referencePerson], ['Fund (USD)', usd(a.fundUsd)],
      ['Bank open date', a.bankOpenDate], ['Bank issue date', a.bankIssueDate], ['Bank maturity', a.bankMaturity]]);
    r.heading('Document checklist');
    r.note(this.docSummary(docs));
    r.table([{ label: 'Document', w: 3 }, { label: 'Status', w: 1.4 }, { label: 'Received on', w: 1.4 }, { label: 'Notes', w: 3 }], this.docRows(docs), 'No documents recorded.');
    return { buffer: await r.finish(), name: `${safe(p.applicationId)}.pdf` };
  }
}
