import { Controller, Post, Get, Body, Param, ParseIntPipe, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentCoursePloResultService } from './student-course-plo-result.service';
import { UploadCoursePloResultsDto } from './dto/upload-course-plo-results.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('Student Course PLO Results')
@Controller('student-course-plo-results')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SuperAdmin', 'Admin', 'Faculty')
export class StudentCoursePloResultController {
  constructor(private readonly studentCoursePloResultService: StudentCoursePloResultService) {
    console.log('🧪 service injected:', studentCoursePloResultService);
    console.log('🔥 controller constructor called');
  }

  @Post('upload-bulk')
  @ApiOperation({ summary: 'Upload bulk PLO results for a course offering' })
  @ApiResponse({ status: 201, description: 'PLO results uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async uploadBulkResults(@Body() uploadDto: UploadCoursePloResultsDto, @Request() req) {
    console.log('✅ API HIT: uploadBulkResults - Validation passed!');
    console.log('📦 uploadDto:', JSON.stringify(uploadDto, null, 2));
    console.log('👤 req.user:', req.user);
    
    // Get user ID from JWT token (service will resolve FacultyProfile ID)
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    console.log('🆔 userId from token:', userId);
    
    try {
      console.log('🚀 About to call uploadBulkPloResults...');
      const result = await this.studentCoursePloResultService.uploadBulkPloResults(uploadDto, userId);
      console.log('✅ uploadBulkPloResults completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in uploadBulkPloResults:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
    }

  @Get('student/:studentId/batch/:batchId')
  @ApiOperation({ summary: 'Get PLO results for a student in a batch' })
  @ApiResponse({ status: 200, description: 'PLO results fetched successfully' })
  @ApiResponse({ status: 404, description: 'Student or batch not found' })
  async getStudentProgramPLOs(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
      return this.studentCoursePloResultService.getStudentProgramPLOs(studentId, batchId);
  }

  /**
   * GET /student-course-plo-results/course-offerings
   * Get list of all course offerings with uploaded PLO results
   * Used for displaying the list of uploaded results
   */
  @Get('course-offerings')
  @ApiOperation({ summary: 'Get list of all course offerings with uploaded PLO results' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of course offerings with results retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          course_offering_id: { type: 'number' },
          course: { type: 'object' },
          semester: { type: 'object' },
          batch: { type: 'object' },
          instructor: { type: 'object' },
          summary: {
            type: 'object',
            properties: {
              student_count: { type: 'number' },
              last_upload_date: { type: 'string', format: 'date-time' },
              first_upload_date: { type: 'string', format: 'date-time' },
            }
          }
        }
      }
    }
  })
  async getCourseOfferingsWithResults() {
    return this.studentCoursePloResultService.getCourseOfferingsWithResults();
  }

  /**
   * GET /student-course-plo-results/course-offering/:courseOfferingId
   * Get all student PLO results for a specific course offering
   * Used for displaying detailed results in popup table
   */
  @Get('course-offering/:courseOfferingId')
  @ApiOperation({ summary: 'Get all student PLO results for a specific course offering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course offering results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        course_offering: { type: 'object' },
        students: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              student_id: { type: 'number' },
              roll_no: { type: 'string' },
              student_name: { type: 'string' },
              plo1: { type: 'number', nullable: true },
              plo2: { type: 'number', nullable: true },
              plo3: { type: 'number', nullable: true },
              plo4: { type: 'number', nullable: true },
              plo5: { type: 'number', nullable: true },
              plo6: { type: 'number', nullable: true },
              plo7: { type: 'number', nullable: true },
              plo8: { type: 'number', nullable: true },
              plo9: { type: 'number', nullable: true },
              plo10: { type: 'number', nullable: true },
              plo11: { type: 'number', nullable: true },
              plo12: { type: 'number', nullable: true },
              upload_timestamp: { type: 'string', format: 'date-time' },
              uploaded_by: { type: 'object' },
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            total_students: { type: 'number' },
            last_upload_date: { type: 'string', format: 'date-time', nullable: true },
            first_upload_date: { type: 'string', format: 'date-time', nullable: true },
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Course offering not found' })
  async getCourseOfferingResults(
    @Param('courseOfferingId', ParseIntPipe) courseOfferingId: number,
  ) {
    return this.studentCoursePloResultService.getCourseOfferingResults(courseOfferingId);
  }
}