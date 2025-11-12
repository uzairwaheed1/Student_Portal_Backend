// ============================================
// FILE: src/admin/admin-user.service.ts
// ============================================
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { AdminProfile } from '../entities/admin-profile.entity';
import { FacultyProfile } from './entities/faculty-profile.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { InvitationService } from '../invitation/invitation.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(AdminProfile)
    private adminProfileRepository: Repository<AdminProfile>,
    @InjectRepository(FacultyProfile)
    private facultyProfileRepository: Repository<FacultyProfile>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    private invitationService: InvitationService,
    private dataSource: DataSource,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto, createdBy: number): Promise<any> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Get Admin role
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user (without password, unverified)
      const user = queryRunner.manager.create(User, {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password_hash: null, // No password yet
        role_id: adminRole.id,
        email_verified: false,
        account_status: 'pending',
        invited_by: createdBy,
      });
      const savedUser = await queryRunner.manager.save(user);

      // Create admin profile
      const adminProfile = await queryRunner.manager.save(AdminProfile, {
        user_id: savedUser.id,
        designation: createAdminDto.designation || undefined,
        department: createAdminDto.department || undefined,
        contact_no: createAdminDto.contact_no || undefined,
        is_super_admin: false,
      });
    //   await queryRunner.manager.save(adminProfile);

      // Log activity
      await queryRunner.manager.save(ActivityLog, {
        user_id: createdBy,
        action: 'CREATE_ADMIN',
        entity: 'User',
        metadata: {
          admin_id: savedUser.id,
          admin_email: savedUser.email,
        },
      });

      await queryRunner.commitTransaction();

      // Send invitation email
      await this.invitationService.sendInvitation(savedUser, 'Admin');

      return {
        message: 'Admin created successfully. Invitation email sent.',
        admin: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          account_status: savedUser.account_status,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createFaculty(createFacultyDto: CreateFacultyDto, createdBy: number): Promise<any> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createFacultyDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Get Faculty role
    const facultyRole = await this.roleRepository.findOne({
      where: { name: 'Faculty' },
    });

    if (!facultyRole) {
      throw new NotFoundException('Faculty role not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user (without password, unverified)
      const user = queryRunner.manager.create(User, {
        name: createFacultyDto.name,
        email: createFacultyDto.email,
        password_hash: null,
        role_id: facultyRole.id,
        email_verified: false,
        account_status: 'pending',
        invited_by: createdBy,
      });
      const savedUser = await queryRunner.manager.save(user);

      // Create faculty profile
      const facultyProfile = await queryRunner.manager.save(FacultyProfile, {
        user_id: savedUser.id,
        designation: createFacultyDto.designation || undefined,
        department: createFacultyDto.department || undefined,
        joining_date: createFacultyDto.joining_date ? new Date(createFacultyDto.joining_date) : undefined,
      });

      // Log activity
      await queryRunner.manager.save(ActivityLog, {
        user_id: createdBy,
        action: 'CREATE_FACULTY',
        entity: 'User',
        metadata: {
          faculty_id: savedUser.id,
          faculty_email: savedUser.email,
        },
      });

      await queryRunner.commitTransaction();

      // Send invitation email
      await this.invitationService.sendInvitation(savedUser, 'Faculty');

      return {
        message: 'Faculty created successfully. Invitation email sent.',
        faculty: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          account_status: savedUser.account_status,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllAdmins(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });

    const [users, total] = await this.userRepository.findAndCount({
      where: { role_id: adminRole?.id },
      relations: ['role'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      account_status: user.account_status,
      email_verified: user.email_verified,
      created_at: user.created_at,
    }));

    return { data, total, page, limit };
  }

  async getAllFaculty(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const facultyRole = await this.roleRepository.findOne({
      where: { name: 'Faculty' },
    });

    const [users, total] = await this.userRepository.findAndCount({
      where: { role_id: facultyRole?.id },
      relations: ['role'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      account_status: user.account_status,
      email_verified: user.email_verified,
      created_at: user.created_at,
    }));

    return { data, total, page, limit };
  }

  async resendInvitation(userId: number, requestedBy: number): Promise<any> {
    // Log activity
    await this.activityLogRepository.save({
      user_id: requestedBy,
      action: 'RESEND_INVITATION',
      entity: 'User',
      metadata: { target_user_id: userId },
    });

    return this.invitationService.resendInvitation(userId);
  }
}
