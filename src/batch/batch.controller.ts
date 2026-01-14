import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { BatchService } from './batch.service';
  import { CreateBatchDto } from './dto/create-batch.dto';
  import { UpdateBatchDto } from './dto/update-batch.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { CurrentUser } from '../auth/decorators/current-user.decorator';
  
  @ApiTags('Batch Management')
  @Controller('admin/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  export class BatchController {
    constructor(private readonly batchService: BatchService) {}
  
    @Post()
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new batch with 8 auto-generated semesters' })
    @ApiResponse({ status: 201, description: 'Batch created successfully' })
    @ApiResponse({ status: 409, description: 'Batch name already exists' })
    async createBatch(@Body() dto: CreateBatchDto, @CurrentUser() user: any) {
      return this.batchService.createBatch(dto, user.id);
    }
  
    @Get()
    @Roles('Admin', 'SuperAdmin', 'Faculty')
    @ApiOperation({ summary: 'Get all batches' })
    @ApiResponse({ status: 200, description: 'List of batches' })
    async getAllBatches(
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
      return this.batchService.getAllBatches(page, limit);
    }
  
    @Get(':id')
    @Roles('Admin', 'SuperAdmin', 'Faculty')
    @ApiOperation({ summary: 'Get batch by ID with semester status' })
    @ApiResponse({ status: 200, description: 'Batch details with action permissions' })
    @ApiResponse({ status: 404, description: 'Batch not found' })
    async getBatchById(@Param('id', ParseIntPipe) id: number) {
      return this.batchService.getBatchById(id);
    }
  
    @Patch(':id')
    @Roles('Admin', 'SuperAdmin')
    @ApiOperation({ summary: 'Update batch details' })
    @ApiResponse({ status: 200, description: 'Batch updated successfully' })
    @ApiResponse({ status: 404, description: 'Batch not found' })
    async updateBatch(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateBatchDto,
      @CurrentUser() user: any,
    ) {
      return this.batchService.updateBatch(id, dto, user.id);
    }
  
    @Delete(':id')
    @Roles('SuperAdmin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete batch (only if no students registered)' })
    @ApiResponse({ status: 200, description: 'Batch deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete batch with students' })
    @ApiResponse({ status: 404, description: 'Batch not found' })
    async deleteBatch(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
      return this.batchService.deleteBatch(id, user.id);
    }
  
    @Post(':id/move-to-next-semester')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Move batch to next semester (enabled after semester end date)' })
    @ApiResponse({ status: 200, description: 'Moved to next semester successfully' })
    @ApiResponse({ status: 400, description: 'Semester not ended yet or already in final semester' })
    async moveToNextSemester(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
      return this.batchService.moveToNextSemester(id, user.id);
    }
  
    @Post(':id/graduate')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Graduate batch (enabled after Semester 8 ends)' })
    @ApiResponse({ status: 200, description: 'Batch graduated successfully' })
    @ApiResponse({ status: 400, description: 'Batch not in Semester 8 or semester not ended' })
    async graduateBatch(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
      return this.batchService.graduateBatch(id, user.id);
    }
  
    @Get(':id/semesters')
    @Roles('Admin', 'SuperAdmin', 'Faculty')
    @ApiOperation({ summary: 'Get all semesters of a batch' })
    @ApiResponse({ status: 200, description: 'List of semesters with status' })
    async getBatchSemesters(@Param('id', ParseIntPipe) id: number) {
      return this.batchService.getBatchSemesters(id);
    }
  }
  