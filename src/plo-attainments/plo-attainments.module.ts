import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PLOAttainmentsController } from './plo-attainments.controller';
import { PLOAttainmentsService } from './plo-attainments.service';
import { Batch } from '../batch/entities/batch.entity';
import { Course } from '../courses/entities/course.entity';
import { PreRegisteredStudent } from '../student/entities/pre-registered-student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Course, PreRegisteredStudent]),
  ],
  controllers: [PLOAttainmentsController],
  providers: [PLOAttainmentsService],
  exports: [PLOAttainmentsService],
})
export class PLOAttainmentsModule {}
