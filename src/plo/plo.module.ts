import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PloService } from './plo.service';
import { PloController } from './plo.controller';
import { Plo } from './entities/plo.entity';
import { Program } from '../program/entities/program.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plo, Program, ActivityLog])],
  controllers: [PloController],
  providers: [PloService],
  exports: [PloService],
})
export class PloModule {}
