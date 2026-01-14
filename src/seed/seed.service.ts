// ============================================
// FILE: src/seed/seed.service.ts (SECURE VERSION)
// ============================================
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { AdminProfile } from '../entities/admin-profile.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AdminProfile)
    private adminProfileRepository: Repository<AdminProfile>,
    private configService: ConfigService,
  ) {}

  async seedAll() {
    this.logger.log('🌱 Starting database seeding...');

    try {
      await this.seedRoles();
      await this.seedSuperAdmin();
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error.message);
      throw error;
    }
  }

  private async seedRoles() {
    this.logger.log('📝 Seeding roles...');

    const rolesToCreate = [
      { name: 'SuperAdmin' },
      { name: 'Admin' },
      { name: 'Faculty' },
      { name: 'Student' },
    ];

    for (const roleData of rolesToCreate) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        this.logger.log(`✅ Created role: ${roleData.name}`);
      } else {
        this.logger.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }
  }

  private async seedSuperAdmin() {
    this.logger.log('👤 Seeding super admin...');

    // Get super admin credentials from environment variables
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const superAdminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');
    const superAdminName = this.configService.get<string>('SUPER_ADMIN_NAME');
    const superAdminDesignation = this.configService.get<string>('SUPER_ADMIN_DESIGNATION');
    const superAdminDepartment = this.configService.get<string>('SUPER_ADMIN_DEPARTMENT');
    const superAdminContact = this.configService.get<string>('SUPER_ADMIN_CONTACT');

    // Validate required environment variables
    if (!superAdminEmail || !superAdminPassword || !superAdminName) {
      this.logger.error('❌ Missing required super admin environment variables!');
      this.logger.error('Required: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME');
      this.logger.warn('⚠️  Skipping super admin creation. Please set environment variables.');
      return;
    }

    // Validate password strength
    if (superAdminPassword.length < 8) {
      this.logger.error('❌ SUPER_ADMIN_PASSWORD must be at least 8 characters long');
      return;
    }

    // Check if super admin role exists
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'SuperAdmin' },
    });

    if (!superAdminRole) {
      this.logger.error('❌ SuperAdmin role not found. Please seed roles first.');
      return;
    }

    // Check if super admin already exists (by email)
    const existingSuperAdmin = await this.userRepository.findOne({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      this.logger.log(`ℹ️  Super admin already exists (${superAdminEmail})`);
      return;
    }

    // Check if any super admin exists (by role)
    const existingSuperAdminByRole = await this.userRepository.findOne({
      where: { role_id: superAdminRole.id },
    });

    if (existingSuperAdminByRole) {
      this.logger.log('ℹ️  A super admin already exists in the system');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Create super admin user
    const superAdmin = this.userRepository.create({
      name: superAdminName,
      email: superAdminEmail,
      password_hash: hashedPassword,
      role_id: superAdminRole.id,
      email_verified: true,
      account_status: 'active',
    });

    const savedUser = await this.userRepository.save(superAdmin);

    // Create admin profile
    const adminProfile = this.adminProfileRepository.create({
      user: savedUser,
      designation: superAdminDesignation || 'System Administrator',
      department: superAdminDepartment || 'IT Department',
      contact_no: superAdminContact || undefined,
      is_super_admin: true,
    });;

    await this.adminProfileRepository.save(adminProfile);

    this.logger.log('✅ Super admin created successfully!');
    this.logger.log(`📧 Email: ${superAdminEmail}`);
    this.logger.log('🔑 Password: [HIDDEN - Check your .env file]');
    this.logger.warn('⚠️  IMPORTANT: Keep your .env file secure and never commit it to version control!');
  }

  // Optional: Method to check if super admin exists
  async checkSuperAdminExists(): Promise<boolean> {
    const superAdminRole = await this.roleRepository.findOne({
      where: { name: 'SuperAdmin' },
    });

    if (!superAdminRole) {
      return false;
    }

    const superAdmin = await this.userRepository.findOne({
      where: { role_id: superAdminRole.id },
    });

    return !!superAdmin;
  }
}
