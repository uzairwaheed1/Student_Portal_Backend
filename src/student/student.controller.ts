import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
  import { StudentService } from './student.service';
  import { RegisterStudentDto } from './dto/register-student.dto';
  import { VerifyEmailDto } from './dto/verify-email.dto';
  import { PreRegisterStudentDto } from './dto/pre-register-student.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { CurrentUser } from '../auth/decorators/current-user.decorator';
  
  @ApiTags('Student')
  @Controller('student')
  export class StudentController {
    constructor(private readonly studentService: StudentService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Student self-registration' })
    @ApiResponse({ status: 201, description: 'Registration successful. Verification email sent.' })
    @ApiResponse({ status: 400, description: 'Roll number not pre-registered or validation error' })
    @ApiResponse({ status: 409, description: 'Email or roll number already registered' })
    async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
      return this.studentService.registerStudent(registerStudentDto);
    }
  
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify student email' })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
      return this.studentService.verifyEmail(verifyEmailDto.token);
    }
  }
  
  @ApiTags('Pre-registration')
  @Controller('admin/pre-register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  export class PreRegistrationController {
    constructor(private readonly studentService: StudentService) {}
  
    @Post('student')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Pre-register a single student roll number' })
    @ApiResponse({ status: 201, description: 'Roll number pre-registered successfully' })
    @ApiResponse({ status: 409, description: 'Roll number already pre-registered' })
    async preRegisterStudent(
      @Body() dto: PreRegisterStudentDto,
      @CurrentUser() user: any,
    ) {
      return this.studentService.preRegisterStudent(dto, user.id);
    }
  
    @Post('bulk-upload')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Bulk pre-register students via Excel file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Excel file with roll_no column',
          },
          batch_id: {
            type: 'number',
            description: 'Batch ID for all students',
            example: 1,
          },
        },
      },
    })
    @ApiResponse({ status: 201, description: 'Bulk upload completed' })
    @ApiResponse({ status: 400, description: 'Invalid file format or missing data' })
    async bulkUpload(
      @UploadedFile() file: Express.Multer.File,
      @Body('batch_id', ParseIntPipe) batchId: number,
      @CurrentUser() user: any,
    ) {
      return this.studentService.bulkPreRegisterStudents(file, batchId, user.id);
    }
  
    @Get('students')
    @Roles('Admin', 'SuperAdmin')
    @ApiOperation({ summary: 'Get all pre-registered students' })
    @ApiResponse({ status: 200, description: 'List of pre-registered students' })
    async getAllPreRegistered(
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
      return this.studentService.getAllPreRegisteredStudents(page, limit);
    }
  }
  