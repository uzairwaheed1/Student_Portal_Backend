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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PloService } from './plo.service';
import { CreatePloDto } from './dto/create-plo.dto';
import { UpdatePloDto } from './dto/update-plo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('PLO')
@Controller('plos')
export class PloController {
  constructor(private readonly ploService: PloService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new PLO (SuperAdmin only)' })
  @ApiResponse({ status: 201, description: 'PLO created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 409, description: 'PLO code already exists for this program' })
  create(@Body() createPloDto: CreatePloDto, @CurrentUser() user: any) {
    return this.ploService.create(createPloDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin', 'Faculty', 'Student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all PLOs (Admin, Faculty, Student)' })
  @ApiQuery({
    name: 'program_id',
    required: false,
    type: Number,
    description: 'Filter PLOs by program ID',
  })
  @ApiResponse({ status: 200, description: 'Returns array of PLOs' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query('program_id') programId?: string) {
    const programIdNum = programId ? parseInt(programId, 10) : undefined;
    return this.ploService.findAll(programIdNum);
  }

  @Get('program/:programId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin','Admin', 'Faculty', 'Student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all PLOs for a specific program (Admin, Faculty, Student)' })
  @ApiResponse({ status: 200, description: 'Returns PLOs for the program' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByProgram(@Param('programId', ParseIntPipe) programId: number) {
    return this.ploService.findByProgram(programId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin','Admin', 'Faculty', 'Student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a PLO by ID (Admin, Faculty, Student)' })
  @ApiResponse({ status: 200, description: 'PLO found' })
  @ApiResponse({ status: 404, description: 'PLO not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ploService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a PLO by ID (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'PLO updated successfully' })
  @ApiResponse({ status: 404, description: 'PLO not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  @ApiResponse({ status: 409, description: 'PLO code already exists for this program' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePloDto: UpdatePloDto,
    @CurrentUser() user: any,
  ) {
    return this.ploService.update(id, updatePloDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete a PLO by ID (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'PLO deleted successfully' })
  @ApiResponse({ status: 404, description: 'PLO not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ploService.remove(id, user.id);
  }
}
