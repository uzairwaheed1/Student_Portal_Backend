import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseOfferingService } from './course-offering.service';
import { CourseOfferingController } from './course-offering.controller';
import { CourseOffering } from './entities/course-offering.entity';
import { Course } from '../courses/entities/course.entity';
import { Semester } from '../semester/entities/semester.entity';
import { FacultyProfile } from '../admin/entities/faculty-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseOffering,
      Course,
      Semester,
      FacultyProfile,
    ]),
  ],
  controllers: [CourseOfferingController],
  providers: [CourseOfferingService],
  exports: [CourseOfferingService],
})
export class CourseOfferingModule {}