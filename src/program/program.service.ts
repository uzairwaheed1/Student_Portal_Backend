import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Batch } from '../batch/entities/batch.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createProgramDto: CreateProgramDto, createdBy: number): Promise<any> {
    // Check if program code already exists
    const existingByCode = await this.programRepository.findOne({
      where: { code: createProgramDto.code },
    });

    if (existingByCode) {
      throw new ConflictException('Program code already exists');
    }

    // Create program
    const program = this.programRepository.create(createProgramDto);
    const savedProgram = await this.programRepository.save(program);

    // Log activity
    await this.activityLogRepository.save({
      user_id: createdBy,
      action: 'CREATE_PROGRAM',
      entity: 'Program',
      metadata: {
        program_id: savedProgram.id,
        program_code: savedProgram.code,
        program_name: savedProgram.name,
      },
    });

    return {
      message: 'Program created successfully',
      program: savedProgram,
    };
  }

  async findAll(): Promise<any> {
    const programs = await this.programRepository.find({
      order: { created_at: 'DESC' },
      relations: ['batches', 'plos'],
    });

    return {
      data: programs,
      total: programs.length,
    };
  }

  async findOne(id: number): Promise<any> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['batches', 'plos'],
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async update(
    id: number,
    updateProgramDto: UpdateProgramDto,
    updatedBy: number,
  ): Promise<any> {
    const program = await this.programRepository.findOne({ where: { id } });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Check if code is being updated and if it conflicts with existing code
    if (updateProgramDto.code && updateProgramDto.code !== program.code) {
      const existingByCode = await this.programRepository.findOne({
        where: { code: updateProgramDto.code },
      });

      if (existingByCode) {
        throw new ConflictException('Program code already exists');
      }
    }

    // Update program fields
    Object.assign(program, updateProgramDto);
    const updatedProgram = await this.programRepository.save(program);

    // Log activity
    await this.activityLogRepository.save({
      user_id: updatedBy,
      action: 'UPDATE_PROGRAM',
      entity: 'Program',
      metadata: {
        program_id: id,
        changes: updateProgramDto,
      },
    });

    return {
      message: 'Program updated successfully',
      program: updatedProgram,
    };
  }

  async remove(id: number, deletedBy: number): Promise<any> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['batches'],
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Check if program has associated batches
    const batchesCount = await this.batchRepository.count({
      where: { program_id: id },
    });

    if (batchesCount > 0) {
      throw new BadRequestException(
        'Cannot delete program with associated batches. Please remove or reassign batches first.',
      );
    }

    // Hard delete the program
    await this.programRepository.delete({ id });

    // Log activity
    await this.activityLogRepository.save({
      user_id: deletedBy,
      action: 'DELETE_PROGRAM',
      entity: 'Program',
      metadata: {
        program_id: id,
        program_code: program.code,
        program_name: program.name,
      },
    });

    return {
      message: 'Program deleted successfully',
    };
  }
}
