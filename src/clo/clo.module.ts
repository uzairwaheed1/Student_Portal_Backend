import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloService } from './clo.service';
import { CloController } from './clo.controller';
import { Clo } from './entities/clo.entity';
import { Course } from '../courses/entities/course.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clo, Course, ActivityLog])],
  controllers: [CloController],
  providers: [CloService],
  exports: [CloService],
})
export class CloModule {}
