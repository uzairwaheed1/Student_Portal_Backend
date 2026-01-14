import { Controller, Post, Get, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
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
  constructor(private readonly studentCoursePloResultService: StudentCoursePloResultService) {}

  @Post('upload-bulk')
  @ApiOperation({ summary: 'Upload bulk PLO results for a course offering' })
  @ApiResponse({ status: 201, description: 'PLO results uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async uploadBulkResults(@Body() uploadDto: UploadCoursePloResultsDto, @Request() req) {
    const facultyId = req.user?.facultyId || 1; // Get from JWT token
    return this.studentCoursePloResultService.uploadBulkPloResults(uploadDto, facultyId);
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
}