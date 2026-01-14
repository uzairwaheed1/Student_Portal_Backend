import { Module } from '@nestjs/common';
import { StudentCoursePloResultService } from './student-course-plo-result.service';
import { StudentCoursePloResultController } from './student-course-plo-result.controller';
import { CourseStudentPloResult } from './entities/course-student-plo-results.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from '../student/entities/student-profile.entity';
import { Course } from '../courses/entities/course.entity';
import { Batch } from '../batch/entities/batch.entity';
import { Semester } from '../semester/entities/semester.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { CourseOffering } from '../course-offering/entities/course-offering.entity';
import { PreRegisteredStudent } from '../student/entities/pre-registered-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    CourseStudentPloResult,
    StudentProfile,
    Course,
    Batch,
    Semester,
    ActivityLog,
    CourseOffering,
    PreRegisteredStudent,
  ])],
  controllers: [StudentCoursePloResultController],
  providers: [StudentCoursePloResultService],
  exports: [StudentCoursePloResultService]
})
export class StudentCoursePloResultModule {}
