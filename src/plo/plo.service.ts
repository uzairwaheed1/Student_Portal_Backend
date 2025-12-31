import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plo } from './entities/plo.entity';
import { Program } from '../program/entities/program.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { CreatePloDto } from './dto/create-plo.dto';
import { UpdatePloDto } from './dto/update-plo.dto';

@Injectable()
export class PloService {
  constructor(
    @InjectRepository(Plo)
    private ploRepository: Repository<Plo>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createPloDto: CreatePloDto, createdBy: number): Promise<any> {
    // Verify program exists
    const program = await this.programRepository.findOne({
      where: { id: createPloDto.program_id },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Check if PLO code already exists for this program
    const existingPlo = await this.ploRepository.findOne({
      where: {
        code: createPloDto.code,
        program_id: createPloDto.program_id,
      },
    });

    if (existingPlo) {
      throw new ConflictException(
        'PLO code already exists for this program',
      );
    }

    // Create PLO
    const plo = this.ploRepository.create({
      code: createPloDto.code,
      title: createPloDto.title,
      description: createPloDto.description,
      program_id: createPloDto.program_id,
    });

    const savedPlo = await this.ploRepository.save(plo);

    // Log activity
    await this.activityLogRepository.save({
      user_id: createdBy,
      action: 'CREATE_PLO',
      entity: 'PLO',
      metadata: {
        plo_id: savedPlo.id,
        plo_code: savedPlo.code,
        program_id: savedPlo.program_id,
      },
    });

    return {
      message: 'PLO created successfully',
      plo: savedPlo,
    };
  }

  async findAll(programId?: number): Promise<any> {
    const where: any = {};
    if (programId) {
      where.program_id = programId;
    }

    const plos = await this.ploRepository.find({
      where,
      relations: ['program'],
      order: { code: 'ASC' },
    });

    return {
      data: plos,
      total: plos.length,
    };
  }

  async findOne(id: number): Promise<any> {
    const plo = await this.ploRepository.findOne({
      where: { id },
      relations: ['program'],
    });

    if (!plo) {
      throw new NotFoundException('PLO not found');
    }

    return plo;
  }

  async findByProgram(programId: number): Promise<any> {
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const plos = await this.ploRepository.find({
      where: { program_id: programId },
      relations: ['program'],
      order: { code: 'ASC' },
    });

    return {
      program: {
        id: program.id,
        code: program.code,
        name: program.name,
      },
      data: plos,
      total: plos.length,
    };
  }

  async update(
    id: number,
    updatePloDto: UpdatePloDto,
    updatedBy: number,
  ): Promise<any> {
    const plo = await this.ploRepository.findOne({ where: { id } });

    if (!plo) {
      throw new NotFoundException('PLO not found');
    }

    // If program_id is being updated, verify new program exists
    if (updatePloDto.program_id && updatePloDto.program_id !== plo.program_id) {
      const program = await this.programRepository.findOne({
        where: { id: updatePloDto.program_id },
      });

      if (!program) {
        throw new NotFoundException('Program not found');
      }
    }

    // If code is being updated, check for conflicts within the program
    const programIdToCheck = updatePloDto.program_id || plo.program_id;
    if (updatePloDto.code && updatePloDto.code !== plo.code) {
      const existingPlo = await this.ploRepository.findOne({
        where: {
          code: updatePloDto.code,
          program_id: programIdToCheck,
        },
      });

      if (existingPlo && existingPlo.id !== id) {
        throw new ConflictException(
          'PLO code already exists for this program',
        );
      }
    }

    // Update PLO fields
    Object.assign(plo, updatePloDto);
    const updatedPlo = await this.ploRepository.save(plo);

    // Log activity
    await this.activityLogRepository.save({
      user_id: updatedBy,
      action: 'UPDATE_PLO',
      entity: 'PLO',
      metadata: {
        plo_id: id,
        changes: updatePloDto,
      },
    });

    return {
      message: 'PLO updated successfully',
      plo: updatedPlo,
    };
  }

  async remove(id: number, deletedBy: number): Promise<any> {
    const plo = await this.ploRepository.findOne({ where: { id } });

    if (!plo) {
      throw new NotFoundException('PLO not found');
    }

    // Hard delete the PLO
    await this.ploRepository.delete({ id });

    // Log activity
    await this.activityLogRepository.save({
      user_id: deletedBy,
      action: 'DELETE_PLO',
      entity: 'PLO',
      metadata: {
        plo_id: id,
        plo_code: plo.code,
        program_id: plo.program_id,
      },
    });

    return {
      message: 'PLO deleted successfully',
    };
  }
}
