import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CloService } from './clo.service';
import { CreateCloDto } from './dto/create-clo.dto';
import { UpdateCloDto } from './dto/update-clo.dto';
import { CloResponseDto } from './dto/clo-response.dto';
import { PaginatedCloResponseDto } from './dto/paginated-clo-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('CLOs (Course Learning Outcomes)')
@Controller('clos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CloController {
  constructor(private readonly cloService: CloService) {}

  @Post('create')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new CLO' })
  @ApiResponse({
    status: 201,
    description: 'CLO created successfully',
    type: CloResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'CLO number already exists for this course' })
  async create(@Body() createCloDto: CreateCloDto, @Request() req) {
    const userId = req.user?.id || 1; // Default for testing
    return this.cloService.create(createCloDto, userId);
  }

  @Post('bulk')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create CLOs for a course' })
  @ApiResponse({
    status: 201,
    description: 'CLOs created successfully',
    type: [CloResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'One or more CLO numbers already exist' })
  async bulkCreate(
    @Body()
    body: {
      course_id: number;
      clos: Array<{ clo_number: number; description: string }>;
    },
    @Request() req,
  ) {
    const userId = req.user?.id || 1;
    return this.cloService.bulkCreate(body.course_id, body.clos, userId);
  }

  @Get()
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({ summary: 'Get all CLOs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'courseId', required: false, type: Number, description: 'Filter by course ID' })
  @ApiResponse({
    status: 200,
    description: 'List of CLOs retrieved successfully',
    type: PaginatedCloResponseDto,
  })
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('courseId') courseId?: number,
  ) {
    return this.cloService.findAll(page, limit, courseId ? +courseId : undefined);
  }

  @Get('course/:courseId')
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({ summary: 'Get all CLOs for a specific course' })
  @ApiParam({ name: 'courseId', type: Number, description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'CLOs retrieved successfully',
    type: [CloResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.cloService.findByCourse(courseId);
  }

  @Get(':id')
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({ summary: 'Get a single CLO by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'CLO ID' })
  @ApiResponse({
    status: 200,
    description: 'CLO retrieved successfully',
    type: CloResponseDto,
  })
  @ApiResponse({ status: 404, description: 'CLO not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cloService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @ApiOperation({ summary: 'Update a CLO' })
  @ApiParam({ name: 'id', type: Number, description: 'CLO ID' })
  @ApiResponse({
    status: 200,
    description: 'CLO updated successfully',
    type: CloResponseDto,
  })
  @ApiResponse({ status: 404, description: 'CLO not found' })
  @ApiResponse({ status: 409, description: 'CLO number already exists for this course' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCloDto: UpdateCloDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 1;
    return this.cloService.update(id, updateCloDto, userId);
  }

  @Delete(':id')
  @Roles('Admin', 'SuperAdmin', 'Faculty')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a CLO' })
  @ApiParam({ name: 'id', type: Number, description: 'CLO ID' })
  @ApiResponse({
    status: 200,
    description: 'CLO deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'CLO deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'CLO not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id || 1;
    return this.cloService.remove(id, userId);
  }
}
