import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDbOptions } from './config/database.config';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { DocumentsModule } from './documents/documents.module';
import { ApplicationsModule } from './applications/applications.module';
import { UniversitiesModule } from './universities/universities.module';
import { ProgramsModule } from './programs/programs.module';
import { AreasModule } from './areas/areas.module';
import { MajorsModule } from './majors/majors.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntakesModule } from './intakes/intakes.module';
import { ReportsModule } from './reports/reports.module';
import { UppercaseSubscriber } from './common/subscribers/uppercase.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ ...buildDbOptions(process.env), autoLoadEntities: true, subscribers: [UppercaseSubscriber] }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 60 },        // 60 req / min per IP on all routes
      { name: 'burst',  ttl: 1_000,  limit: 10 },        // max 10 req / sec burst protection
    ]),
    AuthModule, UsersModule, ApplicantsModule, DocumentsModule, ApplicationsModule,
    UniversitiesModule, ProgramsModule, AreasModule, MajorsModule, DashboardModule, IntakesModule, ReportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
