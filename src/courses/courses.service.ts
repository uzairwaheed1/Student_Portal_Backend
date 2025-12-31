import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Program } from '../program/entities/program.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createCourseDto: CreateCourseDto, createdBy: number): Promise<any> {
    // Verify program exists
    const program = await this.programRepository.findOne({
      where: { id: createCourseDto.program_id },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Check if course code already exists
    const existingCourse = await this.courseRepository.findOne({
      where: { course_code: createCourseDto.course_code },
    });

    if (existingCourse) {
      throw new ConflictException('Course code already exists');
    }

    // Create course
    const course = this.courseRepository.create({
      course_code: createCourseDto.course_code,
      course_name: createCourseDto.course_name,
      course_description: createCourseDto.course_description ?? null,
      credit_hours: createCourseDto.credit_hours,
      program_id: createCourseDto.program_id,
      semester_number: createCourseDto.semester_number ?? null,
      course_type: createCourseDto.course_type ?? 'Core',
      created_by: createdBy,
    });

    const savedCourse = await this.courseRepository.save(course);

    // Log activity
    await this.activityLogRepository.save({
      user_id: createdBy,
      action: 'CREATE_COURSE',
      entity: 'Course',
      metadata: {
        course_id: savedCourse.id,
        course_code: savedCourse.course_code,
        program_id: savedCourse.program_id,
      },
    });

    return {
      message: 'Course created successfully',
      course: savedCourse,
    };
  }

  async findAll(programId?: number): Promise<any> {
    const where: any = {};
    if (programId) {
      where.program_id = programId;
    }

    const courses = await this.courseRepository.find({
      where,
      relations: ['program'],
      order: { course_code: 'ASC' },
    });

    return {
      data: courses,
      total: courses.length,
    };
  }

  async findByProgram(programId: number): Promise<any> {
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const courses = await this.courseRepository.find({
      where: { program_id: programId },
      relations: ['program'],
      order: {
        semester_number: 'ASC',
        course_code: 'ASC',
      },
    });

    return {
      program: {
        id: program.id,
        code: program.code,
        name: program.name,
      },
      data: courses,
      total: courses.length,
    };
  }

  async findOne(id: number): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['program'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    updatedBy: number,
  ): Promise<any> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // If program_id is being updated, verify new program exists
    if (updateCourseDto.program_id && updateCourseDto.program_id !== course.program_id) {
      const program = await this.programRepository.findOne({
        where: { id: updateCourseDto.program_id },
      });

      if (!program) {
        throw new NotFoundException('Program not found');
      }
    }

    // If course_code is being updated, check for conflicts
    if (updateCourseDto.course_code && updateCourseDto.course_code !== course.course_code) {
      const existingCourse = await this.courseRepository.findOne({
        where: { course_code: updateCourseDto.course_code },
      });

      if (existingCourse && existingCourse.id !== id) {
        throw new ConflictException('Course code already exists');
      }
    }

    // Update course fields
    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);

    // Log activity
    await this.activityLogRepository.save({
      user_id: updatedBy,
      action: 'UPDATE_COURSE',
      entity: 'Course',
      metadata: {
        course_id: id,
        changes: updateCourseDto,
      },
    });

    return {
      message: 'Course updated successfully',
      course: updatedCourse,
    };
  }

  async remove(id: number, deletedBy: number): Promise<any> {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Hard delete the course
    await this.courseRepository.delete({ id });

    // Log activity
    await this.activityLogRepository.save({
      user_id: deletedBy,
      action: 'DELETE_COURSE',
      entity: 'Course',
      metadata: {
        course_id: id,
        course_code: course.course_code,
        program_id: course.program_id,
      },
    });

    return {
      message: 'Course deleted successfully',
    };
  }
}
