import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CourseOffering } from './entities/course-offering.entity';
  import { Course } from '../courses/entities/course.entity';
  import { Semester } from '../semester/entities/semester.entity';
  import { FacultyProfile } from '../admin/entities/faculty-profile.entity';
  import { CreateCourseOfferingDto, CourseOfferingResponseDto } from './dto/create-course-offering.dto';
  import { UpdateCourseOfferingDto } from './dto/update-course-offering.dto';
  import { CourseOfferingQueryDto } from './dto/course-offering-query.dto';
  @Injectable()
  export class CourseOfferingService {
    constructor(
      @InjectRepository(CourseOffering)
      private courseOfferingRepository: Repository<CourseOffering>,
      @InjectRepository(Course)
      private courseRepository: Repository<Course>,
      @InjectRepository(Semester)
      private semesterRepository: Repository<Semester>,
      @InjectRepository(FacultyProfile)
      private facultyProfileRepository: Repository<FacultyProfile>,
    ) {}
  
    /**
     * Create a new course offering
     * Validates that course, semester, and instructor exist
     * Ensures no duplicate offering for same course-semester combination
     */
    async create(
      createDto: CreateCourseOfferingDto,
    ): Promise<CourseOfferingResponseDto> {
      // Validate course exists
      const course = await this.courseRepository.findOne({
        where: { id: createDto.course_id },
      });
      if (!course) {
        throw new NotFoundException(
          `Course with ID ${createDto.course_id} not found`,
        );
      }
  
      // Validate semester exists
      const semester = await this.semesterRepository.findOne({
        where: { id: createDto.semester_id },
        relations: ['batch'],
      });
      if (!semester) {
        throw new NotFoundException(
          `Semester with ID ${createDto.semester_id} not found`,
        );
      }
  
      // Validate instructor exists and has faculty role
      const instructor = await this.facultyProfileRepository.findOne({
        where: { id: createDto.instructor_id },
        relations: ['user', 'user.role'],
      });
      console.log("instructor ", instructor);
      if (!instructor) {
        throw new NotFoundException(
          `Instructor with ID ${createDto.instructor_id} not found`,
        );
      }
      if (instructor.user.role.name !== 'Faculty') {
        throw new BadRequestException(
          'Only users with Faculty role can be assigned as instructors',
        );
      }
  
      // Check for duplicate offering
      const existingOffering = await this.courseOfferingRepository.findOne({
        where: {
          course_id: createDto.course_id,
          semester_id: createDto.semester_id,
        },
      });
      if (existingOffering) {
        throw new ConflictException(
          `Course offering already exists for course ${course.course_code} in this semester`,
        );
      }
  
      // Create the offering
      const offering = this.courseOfferingRepository.create(createDto);
      const savedOffering = await this.courseOfferingRepository.save(offering);

      // Return formatted response with nested objects
      return {
        id: savedOffering.id,
        course_id: course.id,
        course_code: course.course_code,
        course_title: course.course_name,
        semester_id: semester.id,
        semester_number: semester.number,
        batch_name: semester.batch.name,
        instructor_id: instructor.id,
        instructor_name: instructor.user.name,
        instructor_email: instructor.user.email,
        created_at: savedOffering.created_at,
        course: {
          id: course.id,
          course_code: course.course_code,
          course_name: course.course_name,
          program_id: course.program_id,
        },
        semester: {
          id: semester.id,
          number: semester.number,
          batch_id: semester.batch.id,
        },
        batch: {
          id: semester.batch.id,
          name: semester.batch.name,
          program_id: semester.batch.program_id,
        },
        instructor: {
          id: instructor.id,
          name: instructor.user.name,
          email: instructor.user.email,
        },
      };
    }
  
    /**
     * Find all course offerings with optional filters
     * Supports pagination and filtering by semester, instructor, or batch
     */
    async findAll(
      query: CourseOfferingQueryDto,
    ): Promise<{ data: CourseOfferingResponseDto[]; total: number; page: number; limit: number }> {
      const { semester_id, instructor_id, batch_id, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;
  
      const queryBuilder = this.courseOfferingRepository
        .createQueryBuilder('offering')
        .leftJoinAndSelect('offering.course', 'course')
        .leftJoinAndSelect('offering.semester', 'semester')
        .leftJoinAndSelect('semester.batch', 'batch')
        .leftJoinAndSelect('offering.instructor', 'instructor') // join FacultyProfile
        .leftJoinAndSelect('instructor.user', 'user') // now join User
        .orderBy('offering.id', 'DESC');
  
      // Apply filters
      if (semester_id) {
        queryBuilder.andWhere('offering.semester_id = :semester_id', {
          semester_id,
        });
      }
      if (instructor_id) {
        queryBuilder.andWhere('offering.instructor_id = :instructor_id', {
          instructor_id,
        });
      }
      if (batch_id) {
        queryBuilder.andWhere('semester.batch_id = :batch_id', { batch_id });
      }
  
      queryBuilder.skip(skip).take(limit);
  
      const [offerings, total] = await queryBuilder.getManyAndCount();

      const data = offerings.map((offering) => ({
        id: offering.id,
        course_id: offering.course.id,
        course_code: offering.course.course_code,
        course_title: offering.course.course_name,
        semester_id: offering.semester.id,
        semester_number: offering.semester.number,
        batch_name: offering.semester.batch.name,
        instructor_id: offering.instructor.id,
        instructor_name: offering.instructor.user.name,
        instructor_email: offering.instructor.user.email,
        created_at: offering.created_at,
        course: {
          id: offering.course.id,
          course_code: offering.course.course_code,
          course_name: offering.course.course_name,
          program_id: offering.course.program_id,
        },
        semester: {
          id: offering.semester.id,
          number: offering.semester.number,
          batch_id: offering.semester.batch.id,
        },
        batch: {
          id: offering.semester.batch.id,
          name: offering.semester.batch.name,
          program_id: offering.semester.batch.program_id,
        },
        instructor: {
          id: offering.instructor.id,
          name: offering.instructor.user.name,
          email: offering.instructor.user.email,
        },
      }));

      return { data, total, page, limit };
    }
  
    /**
     * Find a single course offering by ID
     */
    async findOne(id: number): Promise<CourseOfferingResponseDto> {
      const offering = await this.courseOfferingRepository.findOne({
        where: { id },
        relations: ['course', 'semester', 'semester.batch', 'instructor', 'instructor.user'],
      });

      if (!offering) {
        throw new NotFoundException(`Course offering with ID ${id} not found`);
      }

      return {
        id: offering.id,
        course_id: offering.course.id,
        course_code: offering.course.course_code,
        course_title: offering.course.course_name,
        semester_id: offering.semester.id,
        semester_number: offering.semester.number,
        batch_name: offering.semester.batch.name,
        instructor_id: offering.instructor.id,
        instructor_name: offering.instructor.user.name,
        instructor_email: offering.instructor.user.email,
        created_at: offering.created_at,
        course: {
          id: offering.course.id,
          course_code: offering.course.course_code,
          course_name: offering.course.course_name,
          program_id: offering.course.program_id,
        },
        semester: {
          id: offering.semester.id,
          number: offering.semester.number,
          batch_id: offering.semester.batch.id,
        },
        batch: {
          id: offering.semester.batch.id,
          name: offering.semester.batch.name,
          program_id: offering.semester.batch.program_id,
        },
        instructor: {
          id: offering.instructor.id,
          name: offering.instructor.user.name,
          email: offering.instructor.user.email,
        },
      };
    }
  
    /**
     * Update course offering (only instructor can be changed)
     * Course and semester cannot be changed after creation
     */
    async update(
      id: number,
      updateDto: UpdateCourseOfferingDto,
    ): Promise<CourseOfferingResponseDto> {
      const offering = await this.courseOfferingRepository.findOne({
        where: { id },
        relations: ['semester'],
      });
  
      if (!offering) {
        throw new NotFoundException(`Course offering with ID ${id} not found`);
      }
  
      // Check if semester is locked
      if (offering.semester.is_locked) {
        throw new BadRequestException(
          'Cannot update offering: semester is locked',
        );
      }
  
      // Validate new instructor if provided
      if (updateDto.instructor_id) {
        const instructor = await this.facultyProfileRepository.findOne({
          where: { id: updateDto.instructor_id },
          relations: ['user', 'user.role'],
        });
        if (!instructor) {
          throw new NotFoundException(
            `Instructor with ID ${updateDto.instructor_id} not found`,
          );
        }
        if (instructor.user.role.name !== 'Faculty') {
          throw new BadRequestException(
            'Only users with Faculty role can be assigned as instructors',
          );
        }
        offering.instructor_id = updateDto.instructor_id;
      }
  
      await this.courseOfferingRepository.save(offering);
      return this.findOne(id);
    }
  
    /**
     * Delete a course offering
     * Only allowed if semester is not locked
     */
    async remove(id: number): Promise<{ message: string }> {
      const offering = await this.courseOfferingRepository.findOne({
        where: { id },
        relations: ['semester', 'course'],
      });
  
      if (!offering) {
        throw new NotFoundException(`Course offering with ID ${id} not found`);
      }
  
      // Check if semester is locked
      if (offering.semester.is_locked) {
        throw new BadRequestException(
          'Cannot delete offering: semester is locked',
        );
      }
  
      await this.courseOfferingRepository.remove(offering);
      return {
        message: `Course offering for ${offering.course.course_code} deleted successfully`,
      };
    }
  
    /**
     * Get all offerings for a specific instructor
     */
    async findByInstructor(instructorId: number): Promise<CourseOfferingResponseDto[]> {
      const offerings = await this.courseOfferingRepository.find({
        where: { instructor_id: instructorId },
        relations: ['course', 'semester', 'semester.batch', 'instructor', 'instructor.user'],
        order: { created_at: 'DESC' },
      });

      return offerings.map((offering) => ({
        id: offering.id,
        course_id: offering.course.id,
        course_code: offering.course.course_code,
        course_title: offering.course.course_name,
        semester_id: offering.semester.id,
        semester_number: offering.semester.number,
        batch_name: offering.semester.batch.name,
        instructor_id: offering.instructor.id,
        instructor_name: offering.instructor.user.name,
        instructor_email: offering.instructor.user.email,
        created_at: offering.created_at,
        course: {
          id: offering.course.id,
          course_code: offering.course.course_code,
          course_name: offering.course.course_name,
          program_id: offering.course.program_id,
        },
        semester: {
          id: offering.semester.id,
          number: offering.semester.number,
          batch_id: offering.semester.batch.id,
        },
        batch: {
          id: offering.semester.batch.id,
          name: offering.semester.batch.name,
          program_id: offering.semester.batch.program_id,
        },
        instructor: {
          id: offering.instructor.id,
          name: offering.instructor.user.name,
          email: offering.instructor.user.email,
        },
      }));
    }
  
    /**
     * Get all offerings for a specific semester
     */
    async findBySemester(semesterId: number): Promise<CourseOfferingResponseDto[]> {
      const offerings = await this.courseOfferingRepository.find({
        where: { semester_id: semesterId },
        relations: ['course', 'semester', 'semester.batch', 'instructor', 'instructor.user'],
        order: { course: { course_code: 'ASC' } },
      });

      return offerings.map((offering) => ({
        id: offering.id,
        course_id: offering.course.id,
        course_code: offering.course.course_code,
        course_title: offering.course.course_name,
        semester_id: offering.semester.id,
        semester_number: offering.semester.number,
        batch_name: offering.semester.batch.name,
        instructor_id: offering.instructor.id,
        instructor_name: offering.instructor.user.name,
        instructor_email: offering.instructor.user.email,
        created_at: offering.created_at,
        course: {
          id: offering.course.id,
          course_code: offering.course.course_code,
          course_name: offering.course.course_name,
          program_id: offering.course.program_id,
        },
        semester: {
          id: offering.semester.id,
          number: offering.semester.number,
          batch_id: offering.semester.batch.id,
        },
        batch: {
          id: offering.semester.batch.id,
          name: offering.semester.batch.name,
          program_id: offering.semester.batch.program_id,
        },
        instructor: {
          id: offering.instructor.id,
          name: offering.instructor.user.name,
          email: offering.instructor.user.email,
        },
      }));
    }

    /**
     * Get all course offerings for a specific batch and semester
     * Validates that the semester belongs to the specified batch
     */
    async findByBatchAndSemester(
      batchId: number,
      semesterId: number,
    ): Promise<CourseOfferingResponseDto[]> {
      // First, validate that the semester exists and belongs to the batch
      const semester = await this.semesterRepository.findOne({
        where: {
          id: semesterId,
          batch_id: batchId,
        },
        relations: ['batch'],
      });

      if (!semester) {
        throw new NotFoundException(
          `Semester with ID ${semesterId} not found for batch with ID ${batchId}`,
        );
      }

      // Get all course offerings for this semester
      const offerings = await this.courseOfferingRepository.find({
        where: { semester_id: semesterId },
        relations: ['course', 'semester', 'semester.batch', 'instructor', 'instructor.user'],
        order: { course: { course_code: 'ASC' } },
      });

      return offerings.map((offering) => ({
        id: offering.id,
        course_id: offering.course.id,
        course_code: offering.course.course_code,
        course_title: offering.course.course_name,
        semester_id: offering.semester.id,
        semester_number: offering.semester.number,
        batch_name: offering.semester.batch.name,
        instructor_id: offering.instructor.id,
        instructor_name: offering.instructor.user.name,
        instructor_email: offering.instructor.user.email,
        created_at: offering.created_at,
        course: {
          id: offering.course.id,
          course_code: offering.course.course_code,
          course_name: offering.course.course_name,
          program_id: offering.course.program_id,
        },
        semester: {
          id: offering.semester.id,
          number: offering.semester.number,
          batch_id: offering.semester.batch.id,
        },
        batch: {
          id: offering.semester.batch.id,
          name: offering.semester.batch.name,
          program_id: offering.semester.batch.program_id,
        },
        instructor: {
          id: offering.instructor.id,
          name: offering.instructor.user.name,
          email: offering.instructor.user.email,
        },
      }));
    }

    /**
     * Get all semesters for a specific batch
     * Semesters are automatically generated when a batch is created
     */
    async getSemestersByBatch(batchId: number): Promise<Semester[]> {
      const semesters = await this.semesterRepository.find({
        where: { batch_id: batchId },
        relations: ['batch'],
        order: { number: 'ASC' },
      });

      if (semesters.length === 0) {
        throw new NotFoundException(
          `No semesters found for batch with ID ${batchId}. Make sure the batch exists and has semesters generated.`,
        );
      }

      return semesters;
    }

    /**
     * Get a specific semester by batch_id and semester number
     * Useful when creating course offerings
     */
    async getSemesterByBatchAndNumber(
      batchId: number,
      semesterNumber: number,
    ): Promise<Semester> {
      if (semesterNumber < 1 || semesterNumber > 8) {
        throw new BadRequestException(
          'Semester number must be between 1 and 8',
        );
      }

      const semester = await this.semesterRepository.findOne({
        where: {
          batch_id: batchId,
          number: semesterNumber,
        },
        relations: ['batch'],
      });

      if (!semester) {
        throw new NotFoundException(
          `Semester ${semesterNumber} not found for batch with ID ${batchId}`,
        );
      }

      return semester;
    }
  }