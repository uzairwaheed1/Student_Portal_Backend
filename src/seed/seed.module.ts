// ============================================
// FILE: src/seed/seed.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { AdminProfile } from '../entities/admin-profile.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Role, User, AdminProfile]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
