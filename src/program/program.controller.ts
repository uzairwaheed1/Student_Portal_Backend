import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Program')
@Controller('admin/programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @Roles('SuperAdmin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new program (SuperAdmin only)' })
  @ApiResponse({ status: 201, description: 'Program created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  @ApiResponse({ status: 409, description: 'Program code already exists' })
  create(@Body() createProgramDto: CreateProgramDto, @CurrentUser() user: any) {
    return this.programService.create(createProgramDto, user.id);
  }

  @Get()
  @Roles('SuperAdmin','Admin', 'Faculty')
  @ApiOperation({ summary: 'Get all programs (Admin, Faculty)' })
  @ApiResponse({ status: 200, description: 'Returns array of programs' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.programService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Faculty')
  @ApiOperation({ summary: 'Get a program by ID (Admin, Faculty)' })
  @ApiResponse({ status: 200, description: 'Program found' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programService.findOne(id);
  }

  @Patch(':id')
  @Roles('SuperAdmin')
  @ApiOperation({ summary: 'Update a program by ID (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Program updated successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  @ApiResponse({ status: 409, description: 'Program code already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
    @CurrentUser() user: any,
  ) {
    return this.programService.update(id, updateProgramDto, user.id);
  }

  @Delete(':id')
  @Roles('SuperAdmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete a program by ID (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin only' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete program with associated batches',
  })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.programService.remove(id, user.id);
  }
}
