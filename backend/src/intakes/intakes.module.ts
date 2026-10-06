import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intake } from './entities/intake.entity';
import { IntakesController } from './intakes.controller';
import { IntakesService } from './intakes.service';

@Module({ imports: [TypeOrmModule.forFeature([Intake])], controllers: [IntakesController], providers: [IntakesService] })
export class IntakesModule {}
