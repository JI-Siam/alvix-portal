import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from '../areas/entities/area.entity';
import { Program } from '../programs/entities/program.entity';
import { University } from './entities/university.entity';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

@Module({
  imports: [TypeOrmModule.forFeature([University, Area, Program])],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
})
export class UniversitiesModule {}
