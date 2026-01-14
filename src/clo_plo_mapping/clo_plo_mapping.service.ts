import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource, In } from 'typeorm';
  import { CloPloMapping } from './entities/clo-plo-mapping.entity';
  import { Clo } from '../clo/entities/clo.entity';
  import { Plo } from '../plo/entities/plo.entity';
  import { Course } from '../courses/entities/course.entity';
  import { ActivityLog } from '../admin/entities/activity-log.entity';
  import { BulkCloPloMappingDto } from './dto/bulk-clo-plo-mapping.dto';
  import { BulkMappingResponseDto } from './dto/clo-plo-mapping-response.dto';
import { log } from 'console';
  
  @Injectable()
  export class CloPloMappingService {
    constructor(
      @InjectRepository(CloPloMapping)
      private mappingRepository: Repository<CloPloMapping>,
      @InjectRepository(Clo)
      private cloRepository: Repository<Clo>,
      @InjectRepository(Plo)
      private ploRepository: Repository<Plo>,
      @InjectRepository(Course)
      private courseRepository: Repository<Course>,
      @InjectRepository(ActivityLog)
      private activityLogRepository: Repository<ActivityLog>,
      private dataSource: DataSource,
    ) {}
  
    /**
     * Validate Bloom's Taxonomy level based on domain
     */
    private validateBloomLevel(domain: string, level: number): void {
      const ranges = {
        C: { min: 1, max: 6, name: 'Cognitive' },
        P: { min: 1, max: 7, name: 'Psychomotor' },
        A: { min: 1, max: 5, name: 'Affective' },
      };
  
      const range = ranges[domain];
      if (!range) {
        throw new BadRequestException(`Invalid domain: ${domain}`);
      }
  
      if (level < range.min || level > range.max) {
        throw new BadRequestException(
          `${range.name} domain (${domain}) level must be between ${range.min} and ${range.max}, got ${level}`,
        );
      }
    }
  
    /**
     * Bulk create/replace CLO-PLO mappings for a course
     */
    async bulkCreateMappings(
      dto: BulkCloPloMappingDto,
      userId: number,
    ): Promise<BulkMappingResponseDto> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // STEP 1: Verify course exists and get its program
        const course = await queryRunner.manager.findOne(Course, {
          where: { id: dto.course_id },
          relations: ['program'],
        });
  
        if (!course) {
          throw new NotFoundException(`Course with ID ${dto.course_id} not found`);
        }
  
        if (!course.program) {
          throw new BadRequestException(
            `Course ${dto.course_id} is not associated with any program`,
          );
        }
  
        const program_id = course.program.id;
  
        // STEP 2: Extract all CLO IDs and PLO IDs from payload
        const cloIds = dto.mappings.map((m) => m.clo_id);
        const uniqueCloIds = [...new Set(cloIds)];
  
        const ploIds = dto.mappings
          .flatMap((m) => m.plo_mappings.map((p) => p.plo_id))
          .filter((id) => id != null);
        const uniquePloIds = [...new Set(ploIds)];
  
        // STEP 3: Verify all CLOs belong to this course
        if (uniqueCloIds.length > 0) {
          const clos = await queryRunner.manager.find(Clo, {
            where: { id: In(uniqueCloIds) },
          });
  
          if (clos.length !== uniqueCloIds.length) {
            const foundIds = clos.map(c => c.id);
            const missingIds = uniqueCloIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(
              `CLO IDs not found: ${missingIds.join(', ')}`,
            );
          }
  
          // CRITICAL: Verify CLOs belong to the selected course
          const invalidClos = clos.filter((clo) => clo.course_id !== dto.course_id);
          if (invalidClos.length > 0) {
            throw new BadRequestException(
              `CLO IDs ${invalidClos.map((c) => c.id).join(', ')} do not belong to course ${dto.course_id}`,
            );
          }
        }
  
        // STEP 4: Verify all PLOs belong to the course's program
        if (uniquePloIds.length > 0) {
          const plos = await queryRunner.manager.find(Plo, {
            where: { id: In(uniquePloIds) },
          });

          console.log(plos);
          console.log(uniquePloIds);
          console.log(program_id);
  
          if (plos.length !== uniquePloIds.length) {
            const foundIds = plos.map(p => p.id);
            const missingIds = uniquePloIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(
              `PLO IDs not found: ${missingIds.join(', ')}`,
            );
          }
  
          // CRITICAL: Verify PLOs belong to the same program as course
          const invalidPlos = plos.filter((plo) => plo.program_id !== program_id);
          if (invalidPlos.length > 0) {
            throw new BadRequestException(
              `PLO IDs ${invalidPlos.map((p) => p.id).join(', ')} do not belong to program ${program_id}`,
            );
          }
        }
  
        // STEP 5: Validate Bloom levels for all mappings
        for (const cloMapping of dto.mappings) {
          for (const ploMapping of cloMapping.plo_mappings) {
            this.validateBloomLevel(ploMapping.domain, ploMapping.level);
          }
        }
  
        // STEP 6: Delete existing mappings for this course + these CLOs (REPLACE mode)
        if (uniqueCloIds.length > 0) {
          await queryRunner.manager.delete(CloPloMapping, {
            course_id: dto.course_id,
            clo_id: In(uniqueCloIds),
          });
        }
  
        // STEP 7: FLATTEN nested structure into individual rows
        // KEY CONCEPT: Each CLO-PLO relationship becomes ONE database row
        const flatMappings: Partial<CloPloMapping>[] = [];
  
        for (const cloMapping of dto.mappings) {
          for (const ploMapping of cloMapping.plo_mappings) {
            flatMappings.push({
              course_id: dto.course_id,  // ← CRITICAL: Store course context
              clo_id: cloMapping.clo_id,
              plo_id: ploMapping.plo_id,
              domain: ploMapping.domain,
              level: ploMapping.level,
              weightage: ploMapping.weightage,
            });
          }
        }
  
        // STEP 8: Bulk insert all mappings
        let savedMappings: CloPloMapping[] = [];
        if (flatMappings.length > 0) {
          savedMappings = await queryRunner.manager.save(
            CloPloMapping,
            flatMappings,
          );
        }
  
        // STEP 9: Log activity
        await queryRunner.manager.save(ActivityLog, {
          user_id: userId,
          action: 'BULK_CREATE_CLO_PLO_MAPPING',
          entity: 'CloPloMapping',
          metadata: {
            course_id: dto.course_id,
            program_id: program_id,
            total_mappings: savedMappings.length,
            clos_mapped: uniqueCloIds.length,
            plos_referenced: uniquePloIds.length,
          },
        });
  
        await queryRunner.commitTransaction();
  
        // STEP 10: Return response
        return {
          message: 'CLO-PLO mappings created successfully',
          course_id: dto.course_id,
          total_mappings: savedMappings.length,
          clos_mapped: uniqueCloIds.length,
          mappings: savedMappings.map((m) => ({
            id: m.id,
            course_id: m.course_id,
            clo_id: m.clo_id,
            plo_id: m.plo_id,
            domain: m.domain,
            level: m.level,
            weightage: m.weightage,
            created_at: m.created_at,
          })),
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    /**
     * Get mappings by course (returns structured data for table UI)
     */
    async getMappingsByCourse(courseId: number): Promise<any> {
      // Verify course exists
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['program'],
      });
  
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
  
      // Get all CLOs for this course
      const clos = await this.cloRepository.find({
        where: { course_id: courseId },
        order: { clo_number: 'ASC' },
      });
  
      if (clos.length === 0) {
        return {
          course_id: courseId,
          course_code: course.course_code,
          course_title: course.course_name,
          clos: [],
        };
      }
  
      const cloIds = clos.map((c) => c.id);
  
      // Get all mappings for this course
      const mappings = await this.mappingRepository.find({
        where: { 
          course_id: courseId,  // ← Direct query using course_id
          clo_id: In(cloIds) 
        },
        relations: ['plo'],
        order: { clo_id: 'ASC', plo_id: 'ASC' },
      });
  
      // Group mappings by CLO for table display
      const result = clos.map((clo) => {
        const cloMappings = mappings.filter((m) => m.clo_id === clo.id);
  
        return {
          clo_id: clo.id,
          clo_number: clo.clo_number,
          clo_description: clo.description,
          plo_mappings: cloMappings.map((m) => ({
            id: m.id,
            plo_id: m.plo_id,
            plo_code: m.plo?.code || null,
            plo_title: m.plo?.title || null,
            domain: m.domain,
            level: m.level,
            weightage: m.weightage,
          })),
        };
      });
  
      return {
        course_id: courseId,
        course_code: course.course_code,
        course_title: course.course_name,
        program_id: course.program?.id || null,
        clos: result,
      };
    }
  
    /**
     * Delete a single mapping
     */
    async deleteMapping(id: number, userId: number): Promise<{ message: string }> {
      const mapping = await this.mappingRepository.findOne({ where: { id } });
  
      if (!mapping) {
        throw new NotFoundException(`Mapping with ID ${id} not found`);
      }
  
      await this.mappingRepository.remove(mapping);
  
      // Log activity
      await this.activityLogRepository.save({
        user_id: userId,
        action: 'DELETE',
        entity: 'CloPloMapping',
        metadata: { 
          mapping_id: id,
          course_id: mapping.course_id,
          clo_id: mapping.clo_id,
          plo_id: mapping.plo_id,
        },
      });
  
      return { message: 'Mapping deleted successfully' };
    }
  
    /**
     * Get all mappings with pagination
     */
    async findAll(page: number = 1, limit: number = 50, courseId?: number): Promise<any> {
      const skip = (page - 1) * limit;
  
      const queryBuilder = this.mappingRepository
        .createQueryBuilder('mapping')
        .leftJoinAndSelect('mapping.clo', 'clo')
        .leftJoinAndSelect('mapping.course', 'course')
        .leftJoinAndSelect('mapping.plo', 'plo')
        .orderBy('mapping.course_id', 'ASC')
        .addOrderBy('mapping.clo_id', 'ASC')
        .addOrderBy('mapping.plo_id', 'ASC')
        .skip(skip)
        .take(limit);
  
      if (courseId) {
        queryBuilder.where('mapping.course_id = :courseId', { courseId });
      }
  
      const [mappings, total] = await queryBuilder.getManyAndCount();
  
      return {
        data: mappings.map((m) => ({
          id: m.id,
          course_id: m.course_id,
          course_code: m.course?.course_code || null,
          clo_id: m.clo_id,
          clo_number: m.clo?.clo_number || null,
          plo_id: m.plo_id,
          plo_code: m.plo?.code || null,
          domain: m.domain,
          level: m.level,
          weightage: m.weightage,
          created_at: m.created_at,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Delete all mappings for a course
     */
    async deleteAllForCourse(courseId: number, userId: number): Promise<{ message: string; deleted: number }> {
      const result = await this.mappingRepository.delete({ course_id: courseId });
  
      // Log activity
      await this.activityLogRepository.save({
        user_id: userId,
        action: 'DELETE_ALL',
        entity: 'CloPloMapping',
        metadata: { 
          course_id: courseId,
          deleted_count: result.affected || 0,
        },
      });
  
      return { 
        message: `All mappings for course ${courseId} deleted successfully`,
        deleted: result.affected || 0,
      };
    }
  }
  