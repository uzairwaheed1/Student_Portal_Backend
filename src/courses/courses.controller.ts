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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
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

@ApiTags('Courses')
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('Admin', 'SuperAdmin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course (Admin, SuperAdmin)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Get()
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({ summary: 'Get all courses (Admin, Faculty, Student)' })
  @ApiQuery({
    name: 'program_id',
    required: false,
    type: Number,
    description: 'Filter courses by program ID',
  })
  @ApiResponse({ status: 200, description: 'Returns array of courses' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query('program_id') programId?: string) {
    const programIdNum = programId ? parseInt(programId, 10) : undefined;
    return this.coursesService.findAll(programIdNum);
  }

  @Get('program/:programId')
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({
    summary: 'Get all courses for a specific program (Admin, Faculty, Student)',
  })
  @ApiResponse({ status: 200, description: 'Returns courses for the program' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByProgram(@Param('programId', ParseIntPipe) programId: number) {
    return this.coursesService.findByProgram(programId);
  }

  @Get(':id')
  @Roles('Admin', 'SuperAdmin', 'Faculty', 'Student')
  @ApiOperation({ summary: 'Get a course by ID (Admin, Faculty, Student)' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Update a course by ID (Admin, SuperAdmin)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.id);
  }

  @Delete(':id')
  @Roles('Admin', 'SuperAdmin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard delete a course by ID (Admin, SuperAdmin)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.coursesService.remove(id, user.id);
  }
}
