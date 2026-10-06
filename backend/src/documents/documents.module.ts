import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from '../applicants/entities/applicant.entity';
import { DocumentRecord } from './entities/document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({ imports: [TypeOrmModule.forFeature([DocumentRecord, Applicant])], controllers: [DocumentsController], providers: [DocumentsService] })
export class DocumentsModule {}
