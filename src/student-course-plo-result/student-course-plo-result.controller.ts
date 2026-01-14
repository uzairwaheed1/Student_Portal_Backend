import { Controller, Post, Get, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { StudentCoursePloResultService } from './student-course-plo-result.service';
import { PLOCalculationService } from './plo-calculation.service';
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
  constructor(
    private readonly studentCoursePloResultService: StudentCoursePloResultService,
    private readonly ploCalculationService: PLOCalculationService,
  ) {}

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

  /**
   * Manual recalculation for entire batch
   * POST /student-course-plo-results/recalculate/batch/1
   */
  @Post('recalculate/batch/:batchId')
  @ApiOperation({ summary: 'Manually recalculate program-level PLOs for all students in a batch' })
  @ApiResponse({ status: 200, description: 'PLOs recalculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid batch ID' })
  async recalculateBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    await this.ploCalculationService.recalculateForBatch(batchId);
    return {
      success: true,
      message: `PLOs recalculated for batch ${batchId}`,
    };
  }

  /**
   * Get student's program-level PLO summary
   * GET /student-course-plo-results/program-plos/B20CS001
   */
  @Get('program-plos/:rollNo')
  @ApiOperation({ summary: 'Get program-level PLO summary for a student by roll number' })
  @ApiResponse({ status: 200, description: 'PLO summary retrieved successfully' })
  async getStudentProgramPLOsByRollNo(@Param('rollNo') rollNo: string) {
    const plos = await this.ploCalculationService.getStudentPLOSummary(rollNo);
    
    return {
      roll_no: rollNo,
      total_plos: plos.length,
      plos: plos,
    };
  }

  /**
   * Get batch-level PLO statistics
   * GET /student-course-plo-results/batch-statistics/1
   */
  @Get('batch-statistics/:batchId')
  @ApiOperation({ summary: 'Get batch-level PLO statistics and aggregates' })
  @ApiResponse({ status: 200, description: 'Batch statistics retrieved successfully' })
  async getBatchStatistics(@Param('batchId', ParseIntPipe) batchId: number) {
    const stats = await this.ploCalculationService.getBatchPLOStatistics(batchId);
    
    return {
      batch_id: batchId,
      statistics: stats,
    };
  }
}