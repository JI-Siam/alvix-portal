import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from '../applicants/entities/applicant.entity';
import { Application } from '../applications/entities/application.entity';
import { DocumentRecord } from '../documents/entities/document.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({ imports: [TypeOrmModule.forFeature([Applicant, Application, DocumentRecord])], controllers: [ReportsController], providers: [ReportsService] })
export class ReportsModule {}
