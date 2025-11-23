import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { Batch } from './entities/batch.entity';
  import { Semester } from '../semester/entities/semester.entity';
  import { StudentProfile } from '../student/entities/student-profile.entity';
  import { ActivityLog } from '../admin/entities/activity-log.entity';
  import { CreateBatchDto } from './dto/create-batch.dto';
  import { UpdateBatchDto } from './dto/update-batch.dto';
  
  @Injectable()
  export class BatchService {
    constructor(
      @InjectRepository(Batch)
      private batchRepository: Repository<Batch>,
      @InjectRepository(Semester)
      private semesterRepository: Repository<Semester>,
      @InjectRepository(StudentProfile)
      private studentProfileRepository: Repository<StudentProfile>,
      @InjectRepository(ActivityLog)
      private activityLogRepository: Repository<ActivityLog>,
      private dataSource: DataSource,
    ) {}
  
    async createBatch(dto: CreateBatchDto, createdBy: number): Promise<any> {
      const existing = await this.batchRepository.findOne({
        where: { name: dto.name },
      });
  
      if (existing) {
        throw new ConflictException('Batch name already exists');
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        const batch = queryRunner.manager.create(Batch, {
          name: dto.name,
          year: dto.year,
          current_semester: 1,
          semester_start_day: dto.semester_start_day,
          semester_start_month: dto.semester_start_month,
          semester_end_day: dto.semester_end_day,
          semester_end_month: dto.semester_end_month,
          status: 'Active',
          created_by: createdBy,
        });
  
        const savedBatch = await queryRunner.manager.save(batch);
  
        const semesters = this.generateSemesters(savedBatch);
        await queryRunner.manager.save(Semester, semesters);
  
        await queryRunner.manager.save(ActivityLog, {
          user_id: createdBy,
          action: 'CREATE_BATCH',
          entity: 'Batch',
          metadata: {
            batch_id: savedBatch.id,
            batch_name: savedBatch.name,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return {
          message: 'Batch created successfully with 8 semesters',
          batch: {
            id: savedBatch.id,
            name: savedBatch.name,
            year: savedBatch.year,
            current_semester: savedBatch.current_semester,
            status: savedBatch.status,
          },
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    private generateSemesters(batch: Batch): Partial<Semester>[] {
      const semesters: Partial<Semester>[] = [];
      let currentYear = batch.year;
      let currentMonth = batch.semester_start_month;
  
      for (let i = 1; i <= 8; i++) {
        const startDate = new Date(currentYear, currentMonth - 1, batch.semester_start_day);
        
        let endMonth = batch.semester_end_month;
        let endYear = currentYear;
        
        if (endMonth < currentMonth) {
          endYear++;
        }
  
        const endDate = new Date(endYear, endMonth - 1, batch.semester_end_day);
  
        semesters.push({
          batch_id: batch.id,
          number: i,
          start_date: startDate,
          end_date: endDate,
          is_active: i === 1,
          is_locked: false,
        });
  
        currentMonth += 6;
        if (currentMonth > 12) {
          currentMonth -= 12;
          currentYear++;
        }
      }
  
      return semesters;
    }
  
    async getAllBatches(page: number = 1, limit: number = 10): Promise<any> {
      const skip = (page - 1) * limit;
  
      const [batches, total] = await this.batchRepository.findAndCount({
        skip,
        take: limit,
        order: { created_at: 'DESC' },
      });
  
      return {
        data: batches,
        total,
        page,
        limit,
      };
    }
  
    async getBatchById(id: number): Promise<any> {
      const batch = await this.batchRepository.findOne({
        where: { id },
        relations: ['semesters'],
      });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      const activeSemester = batch.semesters.find((s) => s.number === batch.current_semester);
      const canMoveToNext = activeSemester && new Date() >= activeSemester.end_date && batch.current_semester < 8;
      const canGraduate = batch.current_semester === 8 && activeSemester && new Date() >= activeSemester.end_date;
  
      return {
        ...batch,
        canMoveToNext,
        canGraduate,
        activeSemester,
      };
    }
  
    async updateBatch(id: number, dto: UpdateBatchDto, updatedBy: number): Promise<any> {
      const batch = await this.batchRepository.findOne({ where: { id } });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      if (dto.name) batch.name = dto.name;
      if (dto.status) batch.status = dto.status;
  
      await this.batchRepository.save(batch);
  
      await this.activityLogRepository.save({
        user_id: updatedBy,
        action: 'UPDATE_BATCH',
        entity: 'Batch',
        metadata: {
          batch_id: id,
          changes: dto,
        },
      });
  
      return {
        message: 'Batch updated successfully',
        batch,
      };
    }
  
    async deleteBatch(id: number, deletedBy: number): Promise<any> {
      const batch = await this.batchRepository.findOne({ where: { id } });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      const studentsCount = await this.studentProfileRepository.count({
        where: { batch_id: id },
      });
  
      if (studentsCount > 0) {
        throw new BadRequestException('Cannot delete batch with registered students');
      }
  
      await this.semesterRepository.delete({ batch_id: id });
      await this.batchRepository.delete({ id });
  
      await this.activityLogRepository.save({
        user_id: deletedBy,
        action: 'DELETE_BATCH',
        entity: 'Batch',
        metadata: {
          batch_id: id,
          batch_name: batch.name,
        },
      });
  
      return {
        message: 'Batch deleted successfully',
      };
    }
  
    async moveToNextSemester(id: number, movedBy: number): Promise<any> {
      const batch = await this.batchRepository.findOne({
        where: { id },
        relations: ['semesters'],
      });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      if (batch.current_semester >= 8) {
        throw new BadRequestException('Batch is already in final semester');
      }
  
      const currentSemester = batch.semesters.find((s) => s.number === batch.current_semester);
      if (!currentSemester || new Date() < currentSemester.end_date) {
        throw new BadRequestException('Current semester has not ended yet');
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        await queryRunner.manager.update(Semester, currentSemester.id, {
          is_active: false,
          is_locked: true,
        });
  
        const nextSemester = batch.semesters.find((s) => s.number === batch.current_semester + 1);
        if (nextSemester) {
          await queryRunner.manager.update(Semester, nextSemester.id, {
            is_active: true,
          });
        }
  
        await queryRunner.manager.update(Batch, id, {
          current_semester: batch.current_semester + 1,
        });
  
        await queryRunner.manager.save(ActivityLog, {
          user_id: movedBy,
          action: 'MOVE_TO_NEXT_SEMESTER',
          entity: 'Batch',
          metadata: {
            batch_id: id,
            from_semester: batch.current_semester,
            to_semester: batch.current_semester + 1,
          },
        });
  
        await queryRunner.commitTransaction();
  
        return {
          message: `Batch moved to Semester ${batch.current_semester + 1} successfully`,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    async graduateBatch(id: number, graduatedBy: number): Promise<any> {
      const batch = await this.batchRepository.findOne({
        where: { id },
        relations: ['semesters'],
      });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      if (batch.current_semester !== 8) {
        throw new BadRequestException('Batch must be in Semester 8 to graduate');
      }
  
      const finalSemester = batch.semesters.find((s) => s.number === 8);
      if (!finalSemester || new Date() < finalSemester.end_date) {
        throw new BadRequestException('Final semester has not ended yet');
      }
  
      await this.semesterRepository.update(finalSemester.id, {
        is_active: false,
        is_locked: true,
      });
  
      await this.batchRepository.update(id, {
        status: 'Graduated',
      });
  
      await this.activityLogRepository.save({
        user_id: graduatedBy,
        action: 'GRADUATE_BATCH',
        entity: 'Batch',
        metadata: {
          batch_id: id,
          batch_name: batch.name,
        },
      });
  
      return {
        message: `Batch ${batch.name} graduated successfully`,
      };
    }
  
    async getBatchSemesters(id: number): Promise<any> {
      const batch = await this.batchRepository.findOne({ where: { id } });
  
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
  
      const semesters = await this.semesterRepository.find({
        where: { batch_id: id },
        order: { number: 'ASC' },
      });
  
      return {
        batch_id: id,
        batch_name: batch.name,
        current_semester: batch.current_semester,
        semesters,
      };
    }
  }
  