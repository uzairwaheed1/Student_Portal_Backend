import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { AdminProfile } from '../entities/admin-profile.entity';
import { FacultyProfile } from './entities/faculty-profile.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      AdminProfile,
      FacultyProfile,
      ActivityLog,
    ]),
    InvitationModule,
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminModule {}
