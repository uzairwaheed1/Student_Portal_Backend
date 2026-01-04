import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { Clo } from './entities/clo.entity';
  import { Course } from '../courses/entities/course.entity';
  import { ActivityLog } from '../admin/entities/activity-log.entity';
  import { CreateCloDto } from './dto/create-clo.dto';
  import { UpdateCloDto } from './dto/update-clo.dto';
  import { CloResponseDto } from './dto/clo-response.dto';
  import { PaginatedCloResponseDto } from './dto/paginated-clo-response.dto';
  
  @Injectable()
  export class CloService {
    constructor(
      @InjectRepository(Clo)
      private cloRepository: Repository<Clo>,
      @InjectRepository(Course)
      private courseRepository: Repository<Course>,
      @InjectRepository(ActivityLog)
      private activityLogRepository: Repository<ActivityLog>,
      private dataSource: DataSource,
    ) {}
  
    /**
     * Create a new CLO
     */
    async create(createCloDto: CreateCloDto, userId: number): Promise<CloResponseDto> {
      // Verify course exists
      const course = await this.courseRepository.findOne({
        where: { id: createCloDto.course_id },
      });
  
      if (!course) {
        throw new NotFoundException(
          `Course with ID ${createCloDto.course_id} not found`,
        );
      }
  
      // Check for duplicate CLO number in the same course
      const existingClo = await this.cloRepository.findOne({
        where: {
          course_id: createCloDto.course_id,
          clo_number: createCloDto.clo_number,
        },
      });
  
      if (existingClo) {
        throw new ConflictException(
          `CLO-${createCloDto.clo_number} already exists for this course`,
        );
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Create CLO
        const clo = queryRunner.manager.create(Clo, createCloDto);
        const savedClo = await queryRunner.manager.save(clo);
  
        // Log activity
        await queryRunner.manager.save(ActivityLog, {
          user_id: userId,
          action: 'CREATE',
          entity: 'CLO',
          metadata: {
            clo_id: savedClo.id,
            course_id: createCloDto.course_id,
            clo_number: createCloDto.clo_number,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return this.mapToResponseDto(savedClo, course);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    /**
     * Get all CLOs with pagination and optional filtering
     */
    async findAll(
      page: number = 1,
      limit: number = 10,
      courseId?: number,
    ): Promise<PaginatedCloResponseDto> {
      const skip = (page - 1) * limit;
  
      const queryBuilder = this.cloRepository
        .createQueryBuilder('clo')
        .leftJoinAndSelect('clo.course', 'course')
        .orderBy('clo.course_id', 'ASC')
        .addOrderBy('clo.clo_number', 'ASC')
        .skip(skip)
        .take(limit);
  
      if (courseId) {
        queryBuilder.where('clo.course_id = :courseId', { courseId });
      }
  
      const [clos, total] = await queryBuilder.getManyAndCount();
  
      const data = clos.map((clo) => this.mapToResponseDto(clo, clo.course));
  
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Get CLOs by course ID
     */
    async findByCourse(courseId: number): Promise<CloResponseDto[]> {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
  
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
  
      const clos = await this.cloRepository.find({
        where: { course_id: courseId },
        order: { clo_number: 'ASC' },
      });
  
      return clos.map((clo) => this.mapToResponseDto(clo, course));
    }
  
    /**
     * Get single CLO by ID
     */
    async findOne(id: number): Promise<CloResponseDto> {
      const clo = await this.cloRepository.findOne({
        where: { id },
        relations: ['course'],
      });
  
      if (!clo) {
        throw new NotFoundException(`CLO with ID ${id} not found`);
      }
  
      return this.mapToResponseDto(clo, clo.course);
    }
  
    /**
     * Update a CLO
     */
    async update(
      id: number,
      updateCloDto: UpdateCloDto,
      userId: number,
    ): Promise<CloResponseDto> {
      const clo = await this.cloRepository.findOne({
        where: { id },
        relations: ['course'],
      });
  
      if (!clo) {
        throw new NotFoundException(`CLO with ID ${id} not found`);
      }
  
      // Check for CLO number conflict if updating clo_number
      if (updateCloDto.clo_number && updateCloDto.clo_number !== clo.clo_number) {
        const existingClo = await this.cloRepository.findOne({
          where: {
            course_id: clo.course_id,
            clo_number: updateCloDto.clo_number,
          },
        });
  
        if (existingClo) {
          throw new ConflictException(
            `CLO-${updateCloDto.clo_number} already exists for this course`,
          );
        }
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Update fields
        if (updateCloDto.clo_number) clo.clo_number = updateCloDto.clo_number;
        if (updateCloDto.description) clo.description = updateCloDto.description;
  
        const updatedClo = await queryRunner.manager.save(clo);
  
        // Log activity
        await queryRunner.manager.save(ActivityLog, {
          user_id: userId,
          action: 'UPDATE',
          entity: 'CLO',
          metadata: {
            clo_id: id,
            changes: updateCloDto,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return this.mapToResponseDto(updatedClo, clo.course);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    /**
     * Delete a CLO
     */
    async remove(id: number, userId: number): Promise<{ message: string }> {
      const clo = await this.cloRepository.findOne({
        where: { id },
      });
  
      if (!clo) {
        throw new NotFoundException(`CLO with ID ${id} not found`);
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Delete CLO (cascade will handle related records)
        await queryRunner.manager.delete(Clo, { id });
  
        // Log activity
        await queryRunner.manager.save(ActivityLog, {
          user_id: userId,
          action: 'DELETE',
          entity: 'CLO',
          metadata: {
            clo_id: id,
            course_id: clo.course_id,
            clo_number: clo.clo_number,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return { message: 'CLO deleted successfully' };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    /**
     * Bulk create CLOs for a course
     */
    async bulkCreate(
      courseId: number,
      clos: Array<{ clo_number: number; description: string }>,
      userId: number,
    ): Promise<CloResponseDto[]> {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
  
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
  
      // Check for duplicates in input
      const cloNumbers = clos.map((c) => c.clo_number);
      const duplicates = cloNumbers.filter(
        (num, idx) => cloNumbers.indexOf(num) !== idx,
      );
  
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Duplicate CLO numbers in input: ${duplicates.join(', ')}`,
        );
      }
  
      // Check for existing CLOs
      const existingClos = await this.cloRepository.find({
        where: { course_id: courseId },
      });
  
      const existingNumbers = existingClos.map((c) => c.clo_number);
      const conflicts = cloNumbers.filter((num) => existingNumbers.includes(num));
  
      if (conflicts.length > 0) {
        throw new ConflictException(
          `CLO numbers already exist: ${conflicts.join(', ')}`,
        );
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        const createdClos: Clo[] = [];
  
        for (const cloData of clos) {
          const clo = queryRunner.manager.create(Clo, {
            course_id: courseId,
            clo_number: cloData.clo_number,
            description: cloData.description,
          });
          const savedClo = await queryRunner.manager.save(clo);
          createdClos.push(savedClo);
        }
  
        // Log activity
        await queryRunner.manager.save(ActivityLog, {
          user_id: userId,
          action: 'BULK_CREATE',
          entity: 'CLO',
          metadata: {
            course_id: courseId,
            count: clos.length,
            clo_numbers: cloNumbers,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return createdClos.map((clo) => this.mapToResponseDto(clo, course));
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    /**
     * Helper: Map entity to response DTO
     */
    private mapToResponseDto(clo: Clo, course?: Course): CloResponseDto {
      return {
        id: clo.id,
        course_id: clo.course_id,
        clo_number: clo.clo_number,
        description: clo.description,
        created_at: clo.created_at,
        updated_at: clo.updated_at,
        ...(course && {
          course: {
            id: course.id,
            code: course.course_code,
            title: course.course_name,
          },
        }),
      };
    }
  }