import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcrypt';
  import { v4 as uuidv4 } from 'uuid';
  import { User } from '../entities/user.entity';
  import { Role } from '../entities/role.entity';
  import { StudentProfile } from './entities/student-profile.entity';
  import { PreRegisteredStudent } from './entities/pre-registered-student.entity';
  import { ActivityLog } from '../admin/entities/activity-log.entity';
  import { EmailService } from '../email/email.service';
  import { RegisterStudentDto } from './dto/register-student.dto';
  import { PreRegisterStudentDto } from './dto/pre-register-student.dto';
  import * as XLSX from 'xlsx';
  
  @Injectable()
  export class StudentService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      @InjectRepository(Role)
      private roleRepository: Repository<Role>,
      @InjectRepository(StudentProfile)
      private studentProfileRepository: Repository<StudentProfile>,
      @InjectRepository(PreRegisteredStudent)
      private preRegStudentRepository: Repository<PreRegisteredStudent>,
      @InjectRepository(ActivityLog)
      private activityLogRepository: Repository<ActivityLog>,
      private emailService: EmailService,
      private configService: ConfigService,
      private dataSource: DataSource,
    ) {}
  
    async preRegisterStudent(dto: PreRegisterStudentDto, createdBy: number): Promise<any> {
      // Check if roll number already pre-registered
      const existing = await this.preRegStudentRepository.findOne({
        where: { roll_no: dto.roll_no },
      });
  
      if (existing) {
        throw new ConflictException('Roll number already pre-registered');
      }
  
      const preRegStudent = this.preRegStudentRepository.create({
        roll_no: dto.roll_no,
        batch_id: dto.batch_id,
        created_by: createdBy,
      });
  
      await this.preRegStudentRepository.save(preRegStudent);
  
      return {
        message: 'Student roll number pre-registered successfully',
        roll_no: dto.roll_no,
      };
    }
  
    async bulkPreRegisterStudents(file: Express.Multer.File, batchId: number, createdBy: number): Promise<any> {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
  
      try {
        // Read Excel file
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
  
        const successfulRollNos: string[] = [];
        const failedRollNos: string[] = [];

        for (const rowRaw of data) {
          // Explicitly type row as Record<string, any> to address 'unknown' type
          const row = rowRaw as Record<string, any>;
          const rollNo = row['roll_no'] || row['Roll Number'] || row['roll number'];

          if (!rollNo) {
            failedRollNos.push('Missing roll_no in row');
            continue;
          }
  
          try {
            // Check if already exists
            const existing = await this.preRegStudentRepository.findOne({
              where: { roll_no: rollNo },
            });
  
            if (existing) {
              failedRollNos.push(`${rollNo} (already exists)`);
              continue;
            }
  
            // Create pre-registration
            const preRegStudent = this.preRegStudentRepository.create({
              roll_no: rollNo,
              batch_id: batchId,
              created_by: createdBy,
            });
  
            await this.preRegStudentRepository.save(preRegStudent);
            successfulRollNos.push(rollNo);
          } catch (error) {
            failedRollNos.push(`${rollNo} (${error.message})`);
          }
        }
  
        // Log activity
        await this.activityLogRepository.save({
          user_id: createdBy,
          action: 'BULK_PRE_REGISTER_STUDENTS',
          entity: 'PreRegisteredStudent',
          metadata: {
            batch_id: batchId,
            total: data.length,
            successful: successfulRollNos.length,
            failed: failedRollNos.length,
          },
        });
  
        return {
          message: 'Bulk pre-registration completed',
          total: data.length,
          successful: successfulRollNos.length,
          failed: failedRollNos.length,
          successfulRollNos,
          failedRollNos,
        };
      } catch (error) {
        throw new BadRequestException(`Failed to process Excel file: ${error.message}`);
      }
    }
  
    async registerStudent(dto: RegisterStudentDto): Promise<any> {
      // Check if roll number is pre-registered
      const preRegStudent = await this.preRegStudentRepository.findOne({
        where: { roll_no: dto.roll_no },
      });
  
      if (!preRegStudent) {
        throw new BadRequestException('Roll number not found. Please contact admin.');
      }
  
      if (preRegStudent.is_registered) {
        throw new ConflictException('This roll number is already registered');
      }
  
      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });
  
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
  
      // Get Student role
      const studentRole = await this.roleRepository.findOne({
        where: { name: 'Student' },
      });
  
      if (!studentRole) {
        throw new NotFoundException('Student role not found');
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
  
        // Generate verification token
        const verificationToken = uuidv4();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 48);
  
        // Create user
        const user = queryRunner.manager.create(User, {
          name: dto.name,
          email: dto.email,
          password_hash: hashedPassword,
          role_id: studentRole.id,
          email_verified: false,
          account_status: 'pending',
          invitation_token: verificationToken,
          invitation_expires_at: tokenExpiry,
        });
        const savedUser = await queryRunner.manager.save(user);
  
        // Create student profile
        const studentProfile = queryRunner.manager.create(StudentProfile, {
          user_id: savedUser.id,
          roll_no: dto.roll_no,
          batch_id: preRegStudent.batch_id,
          gender: dto.gender || undefined,
          date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
          contact_no: dto.contact_no || undefined,
          address: dto.address || undefined,
          father_name: dto.father_name || undefined,
          father_contact: dto.father_contact || undefined,
          emergency_contact: dto.emergency_contact || undefined,
          email_verified: savedUser.email_verified,
          account_status: savedUser.account_status,
        });
        await queryRunner.manager.save(studentProfile);
  
        // Update pre-registered student
        await queryRunner.manager.update(PreRegisteredStudent, preRegStudent.id, {
          is_registered: true,
          registered_user_id: savedUser.id,
        });
  
        await queryRunner.commitTransaction();
  
        // Send verification email
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
  
        await this.emailService.sendVerificationEmail(
          savedUser.email,
          savedUser.name,
          verificationLink,
          '48 hours',
        );
  
        return {
          message: 'Registration successful. Please check your email to verify your account.',
          student: {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            roll_no: dto.roll_no,
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
  
    async verifyEmail(token: string): Promise<any> {
      const user = await this.userRepository.findOne({
        where: { invitation_token: token },
        relations: ['role'],
      });
  
      if (!user) {
        throw new NotFoundException('Invalid verification token');
      }
  
      if (!user.invitation_expires_at || new Date() > user.invitation_expires_at) {
        throw new BadRequestException('Verification token has expired');
      }
  
      if (user.email_verified) {
        throw new BadRequestException('Email already verified');
      }
  
      await this.userRepository.update(user.id, {
        email_verified: true,
        account_status: 'active',
        invitation_token: null,
        invitation_expires_at: null,
      });

      // Sync to student profile
      await this.studentProfileRepository.update(
        { user_id: user.id },
        {
          email_verified: true,
          account_status: 'active',
        }
      );

      return {
        message: 'Email verified successfully. You can now login.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      };
    }
  
    async getAllPreRegisteredStudents(page: number = 1, limit: number = 10): Promise<any> {
      const skip = (page - 1) * limit;
  
      const [data, total] = await this.preRegStudentRepository.findAndCount({
        relations: ['batch'],
        skip,
        take: limit,
        order: { created_at: 'DESC' },
      });
  
      return {
        data: data.map((item) => ({
          id: item.id,
          roll_no: item.roll_no,
        //   batch: item.batch ? item.batch.name : null,
          is_registered: item.is_registered,
          created_at: item.created_at,
        })),
        total,
        page,
        limit,
      };
    }
  }