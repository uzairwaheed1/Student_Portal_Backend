import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CourseOfferingService } from './course-offering.service';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { UpdateCourseOfferingDto } from './dto/update-course-offering.dto';
import { CourseOfferingQueryDto } from './dto/course-offering-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// @Controller('course-offerings')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiTags('Course Offerings')
  @Controller('admin/course-offerings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
export class CourseOfferingController {
  constructor(private readonly courseOfferingService: CourseOfferingService) {}

  /**
   * POST /course-offerings
   * Create a new course offering
   * Requires: Admin role
   */
  @Post()
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Create a new course  offering (Admin)' })
  @ApiResponse({ status: 201, description: 'Course offering created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course or semester not found' })
  @ApiResponse({ status: 409, description: 'Course offering already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCourseOfferingDto) {
    return this.courseOfferingService.create(createDto);
  }

  /**
   * GET /course-offerings
   * Get all course offerings with optional filters
   * Query params: semester_id, instructor_id, batch_id, page, limit
   */
  @Get()
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Get all course offerings (Admin)' })
  @ApiResponse({ status: 200, description: 'Course offerings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course offering not found' })
  @ApiResponse({ status: 409, description: 'Course offering already exists' })
  async findAll(@Query() query: CourseOfferingQueryDto) {
    return this.courseOfferingService.findAll(query);
  }

  /**
   * GET /course-offerings/instructor/:id
   * Get all offerings for a specific instructor
   * Used by faculty to see their assigned courses
   */
  @Get('instructor/:id')
  async findByInstructor(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingService.findByInstructor(id);
  }

  /**
   * GET /course-offerings/semester/:id
   * Get all offerings for a specific semester
   * Used by admin to see all courses in a semester
   */
  @Get('semester/:id')
  async findBySemester(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingService.findBySemester(id);
  }

  /**
   * GET /course-offerings/batch/:batchId/semester/:semesterId
   * Get all course offerings for a specific batch and semester
   * Validates that the semester belongs to the specified batch
   */
  @Get('batch/:batchId/semester/:semesterId')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @ApiOperation({ summary: 'Get course offerings by batch ID and semester ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course offerings retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          course_id: { type: 'number' },
          course_code: { type: 'string' },
          course_title: { type: 'string' },
          semester_id: { type: 'number' },
          semester_number: { type: 'number' },
          batch_name: { type: 'string' },
          instructor_id: { type: 'number' },
          instructor_name: { type: 'string' },
          instructor_email: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Semester not found for the specified batch' })
  async findByBatchAndSemester(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Param('semesterId', ParseIntPipe) semesterId: number,
  ) {
    return this.courseOfferingService.findByBatchAndSemester(batchId, semesterId);
  }

  /**
   * GET /course-offerings/batch/:batchId/semesters
   * Get all semesters for a specific batch
   * Semesters are automatically generated when a batch is created (8 semesters)
   */
  @Get('batch/:batchId/semesters')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @ApiOperation({ summary: 'Get all semesters for a batch' })
  @ApiResponse({ status: 200, description: 'Semesters retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No semesters found for the batch' })
  async getSemestersByBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.courseOfferingService.getSemestersByBatch(batchId);
  }

  /**
   * GET /course-offerings/batch/:batchId/semester/:semesterNumber
   * Get a specific semester by batch_id and semester number (1-8)
   * Useful when creating course offerings
   */
  @Get('batch/:batchId/semester/:semesterNumber')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @ApiOperation({ summary: 'Get a specific semester by batch and semester number' })
  @ApiResponse({ status: 200, description: 'Semester retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid semester number' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async getSemesterByBatchAndNumber(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Param('semesterNumber', ParseIntPipe) semesterNumber: number,
  ) {
    return this.courseOfferingService.getSemesterByBatchAndNumber(
      batchId,
      semesterNumber,
    );
  }

  /**
   * GET /course-offerings/:id
   * Get a single course offering by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingService.findOne(id);
  }

  /**
   * PATCH /course-offerings/:id
   * Update course offering (only instructor can be changed)
   * Requires: Admin role
   */
  @Patch(':id')
  // @Roles('Admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCourseOfferingDto,
  ) {
    return this.courseOfferingService.update(id, updateDto);
  }

  /**
   * DELETE /course-offerings/:id
   * Delete a course offering
   * Requires: Admin role
   * Not allowed if semester is locked
   */
  @Delete(':id')
  // @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingService.remove(id);
  }
}