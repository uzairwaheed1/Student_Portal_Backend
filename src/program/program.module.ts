import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { Program } from './entities/program.entity';
import { Batch } from '../batch/entities/batch.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Batch, ActivityLog])],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
