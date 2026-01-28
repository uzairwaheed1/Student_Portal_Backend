import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PLOAttainmentsService } from './plo-attainments.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('PLO Attainments')
@Controller('api/plo-attainments')
export class PLOAttainmentsController {
  constructor(private readonly ploAttainmentsService: PLOAttainmentsService) {}

  /**
   * GET /api/plo-attainments/batches
   * Get all batches that have PLO attainment data
   */
  @Get('batches')
  @ApiOperation({ summary: 'Get all batches with PLO attainment data' })
  @ApiResponse({ status: 200, description: 'List of batches with PLO data' })
  async getBatchesWithPLOData() {
    return await this.ploAttainmentsService.getBatchesWithPLOData();
  }

  /**
   * GET /api/plo-attainments/batch/:batchId
   * Get all students with their PLO attainments for a specific batch
   */
  @Get('batch/:batchId')
  @ApiOperation({ summary: 'Get students and PLO attainments for a batch' })
  @ApiResponse({ status: 200, description: 'Batch with students and PLO attainments' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async getBatchPLOAttainments(@Param('batchId', ParseIntPipe) batchId: number) {
    return await this.ploAttainmentsService.getBatchPLOAttainments(batchId);
  }

  /**
   * GET /api/plo-attainments/student/:studentId
   * Get detailed PLO attainments for a single student
   */
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get PLO attainments for a single student' })
  @ApiResponse({ status: 200, description: 'Student PLO attainments' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentPLOAttainments(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.ploAttainmentsService.getStudentPLOAttainments(studentId);
  }
}
