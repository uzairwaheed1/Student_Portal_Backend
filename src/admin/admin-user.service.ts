// ============================================
// FILE: src/admin/admin-user.service.ts
// ============================================
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
// import { CourseFaculty } from '../entities/course-faculty.entity';

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
    // @InjectRepository(CourseFaculty)
    // private courseFacultyRepository: Repository<CourseFaculty>,
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
        email_verified: savedUser.email_verified,
        account_status: savedUser.account_status,
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
        email_verified: savedUser.email_verified,
        account_status: savedUser.account_status,
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
      relations: ['role', 'facultyProfile'], // Add facultyProfile relation
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    
    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      account_status: user.facultyProfile?.account_status || user.account_status,
      email_verified: user.facultyProfile?.email_verified ?? user.email_verified,
      designation: user.facultyProfile?.designation,
      department: user.facultyProfile?.department,
      joining_date: user.facultyProfile?.joining_date,
    }));

    return { data, total, page, limit, success: true };
  }

  // Add these methods to AdminUserService class:

async updateAdmin(id: number, dto: UpdateAdminDto, updatedBy: number): Promise<any> {
  const adminProfile = await this.adminProfileRepository.findOne({
    where: { user_id: id },
    relations: ['user'],
  });

  if (!adminProfile) {
    throw new NotFoundException('Admin not found');
  }

  // Update user fields
  if (dto.name) adminProfile.user.name = dto.name;
  if (dto.email && dto.email !== adminProfile.user.email) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    adminProfile.user.email = dto.email;
  }
  await this.userRepository.save(adminProfile.user);

  // Update profile fields
  if (dto.designation) adminProfile.designation = dto.designation;
  if (dto.department) adminProfile.department = dto.department;
  if (dto.contact_no) adminProfile.contact_no = dto.contact_no;
  await this.adminProfileRepository.save(adminProfile);

  await this.activityLogRepository.save({
    user_id: updatedBy,
    action: 'UPDATE_ADMIN',
    entity: 'AdminProfile',
    metadata: { admin_id: id, changes: dto },
  });

  return { message: 'Admin updated successfully', admin: adminProfile };
}

async deleteAdmin(id: number, deletedBy: number): Promise<any> {
  const adminProfile = await this.adminProfileRepository.findOne({
    where: { user_id: id },
    relations: ['user'],
  });

  if (!adminProfile) {
    throw new NotFoundException('Admin not found');
  }

  if (adminProfile.is_super_admin) {
    throw new BadRequestException('Cannot delete super admin');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.delete(AdminProfile, { id });
    await queryRunner.manager.delete(User, { id: adminProfile.user.id });

    await queryRunner.manager.save(ActivityLog, {
      user_id: deletedBy,
      action: 'DELETE_ADMIN',
      entity: 'AdminProfile',
      metadata: { admin_id: id, admin_name: adminProfile.user.name },
    });

    await queryRunner.commitTransaction();
    return { message: 'Admin deleted successfully' };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async updateFaculty(id: number, dto: UpdateFacultyDto, updatedBy: number): Promise<any> {
  const facultyProfile = await this.facultyProfileRepository.findOne({
    where: { user_id: id },
    relations: ['user'],
  });

  if (!facultyProfile) {
    throw new NotFoundException('Faculty not found');
  }

  // Update user fields
  if (dto.name) facultyProfile.user.name = dto.name;
  if (dto.email && dto.email !== facultyProfile.user.email) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    facultyProfile.user.email = dto.email;
  }
  await this.userRepository.save(facultyProfile.user);

  // Update profile fields
  if (dto.designation) facultyProfile.designation = dto.designation;
  if (dto.department) facultyProfile.department = dto.department;
  if (dto.joining_date) facultyProfile.joining_date = new Date(dto.joining_date);
  await this.facultyProfileRepository.save(facultyProfile);

  await this.activityLogRepository.save({
    user_id: updatedBy,
    action: 'UPDATE_FACULTY',
    entity: 'FacultyProfile',
    metadata: { faculty_id: id, changes: dto },
  });

  return { message: 'Faculty updated successfully', faculty: facultyProfile };
}

async deleteFaculty(id: number, deletedBy: number): Promise<any> {
  const facultyProfile = await this.facultyProfileRepository.findOne({
    where: { user_id: id },
    relations: ['user'],
  });

  if (!facultyProfile) {
    throw new NotFoundException('Faculty not found');
  }

  // Check if faculty has courses assigned
  // const coursesCount = await this.courseFacultyRepository.count({
  //   where: { faculty_id: id },
  // });

  // if (coursesCount > 0) {
  //   throw new BadRequestException('Cannot delete faculty with assigned courses');
  // }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.delete(FacultyProfile, { id });
    await queryRunner.manager.delete(User, { id: facultyProfile.user.id });

    await queryRunner.manager.save(ActivityLog, {
      user_id: deletedBy,
      action: 'DELETE_FACULTY',
      entity: 'FacultyProfile',
      metadata: { faculty_id: id, faculty_name: facultyProfile.user.name },
    });

    await queryRunner.commitTransaction();
    return { message: 'Faculty deleted successfully' };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
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
