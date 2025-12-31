import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Program } from '../program/entities/program.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Program, ActivityLog])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
