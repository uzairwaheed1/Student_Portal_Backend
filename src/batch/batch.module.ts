import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { Batch } from './entities/batch.entity';
import { Semester } from '../semester/entities/semester.entity';
import { StudentProfile } from '../student/entities/student-profile.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Semester, StudentProfile, ActivityLog]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
