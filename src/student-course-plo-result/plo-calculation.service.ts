import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentProgramPloCache } from './entities/student-program-plo-cache.entity';

@Injectable()
export class PLOCalculationService {
  private readonly logger = new Logger(PLOCalculationService.name);

  constructor(
    @InjectRepository(StudentProgramPloCache)
    private programPloRepo: Repository<StudentProgramPloCache>,
    private dataSource: DataSource,
  ) {}

  /**
   * Main entry point: Recalculate PLOs for students after upload
   */
  async recalculateForStudents(
    rollNumbers: string[],
    batchId: number,
  ): Promise<void> {
    this.logger.log(
      `🔄 Starting PLO recalculation for ${rollNumbers.length} students in batch ${batchId}`,
    );

    for (const rollNo of rollNumbers) {
      await this.recalculateProgramPLOsForStudent(rollNo, batchId);
    }

    this.logger.log('✅ PLO recalculation completed successfully');
  }

  /**
   * Recalculate all 12 PLOs for ONE student
   * Uses the database function for automatic calculation
   */
  private async recalculateProgramPLOsForStudent(
    rollNo: string,
    batchId: number,
  ): Promise<void> {
    this.logger.log(`📚 Processing roll_no: ${rollNo}`);

    // Use database function to recalculate PLOs
    await this.dataSource.query(
      `SELECT recalculate_student_program_plos($1, $2)`,
      [rollNo, batchId],
    );

    this.logger.log(`✅ Completed processing for ${rollNo}`);
  }


  /**
   * Recalculate for entire batch (manual trigger)
   */
  async recalculateForBatch(batchId: number): Promise<void> {
    this.logger.log(`🔄 Recalculating entire batch ${batchId}`);

    // Get all unique roll_nos in this batch
    const students = await this.dataSource.query(
      `
      SELECT DISTINCT roll_no
      FROM course_student_plo_results
      WHERE batch_id = $1
        AND roll_no IS NOT NULL
      ORDER BY roll_no
      `,
      [batchId],
    );

    const rollNumbers = students.map((s) => s.roll_no);

    this.logger.log(`📋 Found ${rollNumbers.length} students`);

    await this.recalculateForStudents(rollNumbers, batchId);
  }

  /**
   * Get program-level PLO summary for a student
   */
  async getStudentPLOSummary(rollNo: string): Promise<any[]> {
    return await this.dataSource.query(
      `
      SELECT 
        roll_no,
        plo_number,
        average_attainment,
        course_count,
        is_achieved,
        achievement_level,
        contributing_courses,
        last_calculated
      FROM student_program_plo_cache
      WHERE roll_no = $1
      ORDER BY plo_number
      `,
      [rollNo],
    );
  }

  /**
   * Get batch-level statistics
   */
  async getBatchPLOStatistics(batchId: number): Promise<any[]> {
    return await this.dataSource.query(
      `
      SELECT 
        plo_number,
        COUNT(*) as student_count,
        AVG(average_attainment) as batch_average,
        MIN(average_attainment) as min_attainment,
        MAX(average_attainment) as max_attainment,
        COUNT(*) FILTER (WHERE is_achieved = true) as achieved_count
      FROM student_program_plo_cache
      WHERE batch_id = $1
      GROUP BY plo_number
      ORDER BY plo_number
      `,
      [batchId],
    );
  }
}

