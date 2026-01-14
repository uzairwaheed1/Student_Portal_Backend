import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './student.service';
import { StudentController, PreRegistrationController } from './student.controller';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { PreRegisteredStudent } from './entities/pre-registered-student.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      StudentProfile,
      PreRegisteredStudent,
      ActivityLog,
    ]),
    EmailModule,
  ],
  controllers: [StudentController, PreRegistrationController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
