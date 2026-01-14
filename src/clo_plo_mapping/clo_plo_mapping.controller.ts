import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CloPloMappingService } from './clo_plo_mapping.service';
import { BulkCloPloMappingDto } from './dto/bulk-clo-plo-mapping.dto';
import { BulkMappingResponseDto } from './dto/clo-plo-mapping-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('CLO-PLO Mappings')
@Controller('clo-plo-mappings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CloPloMappingController {
  constructor(private readonly mappingService: CloPloMappingService) {}

  @Post('bulk')
  @Roles("SuperAdmin", "Admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk create CLO-PLO mappings for a course (table-based UI)',
    description:
      'Creates or replaces CLO-PLO mappings for a specific course. ' +
      'All mappings are stored with the course_id context. ' +
      'Existing mappings for the provided CLOs in this course will be deleted and replaced.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mappings created successfully',
    type: BulkMappingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or CLOs/PLOs do not belong to correct course/program' })
  @ApiResponse({ status: 404, description: 'Course, CLO, or PLO not found' })
  async bulkCreate(@Body() dto: BulkCloPloMappingDto, @Request() req) {
    const userId = req.user?.id || 1;
    return this.mappingService.bulkCreateMappings(dto, userId);
  }

  @Get('course/:courseId')
  @Roles("SuperAdmin", "Admin")
  @ApiOperation({ 
    summary: 'Get all CLO-PLO mappings for a course',
    description: 'Returns structured data ready for table display. Each CLO with its PLO mappings.',
  })
  @ApiParam({ name: 'courseId', type: Number, description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Mappings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getMappingsByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.mappingService.getMappingsByCourse(courseId);
  }

  @Delete('course/:courseId')
  @Roles("SuperAdmin", "Admin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all mappings for a course' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'All mappings deleted successfully' })
  async deleteAllForCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 1;
    return this.mappingService.deleteAllForCourse(courseId, userId);
  }

  @Get()
  @Roles("SuperAdmin", "Admin")
  @ApiOperation({ summary: 'Get all mappings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number, description: 'Filter by course' })
  @ApiResponse({ status: 200, description: 'Mappings retrieved successfully' })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 50,
    @Query('courseId') courseId?: number,
  ) {
    return this.mappingService.findAll(page, limit, courseId ? +courseId : undefined);
  }

  @Delete(':id')
  @Roles("SuperAdmin", "Admin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a single mapping' })
  @ApiParam({ name: 'id', type: Number, description: 'Mapping ID' })
  @ApiResponse({ status: 200, description: 'Mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mapping not found' })
  async deleteMapping(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id || 1;
    return this.mappingService.deleteMapping(id, userId);
  }
}