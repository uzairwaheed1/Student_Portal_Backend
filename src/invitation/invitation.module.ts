// ============================================
// FILE: src/invitation/invitation.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { User } from '../entities/user.entity';
import { AdminProfile } from '../entities/admin-profile.entity';
import { FacultyProfile } from '../admin/entities/faculty-profile.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AdminProfile, FacultyProfile]),
    EmailModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
    