import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Batch } from '../batch/entities/batch.entity';
import { Course } from '../courses/entities/course.entity';
import { PreRegisteredStudent } from '../student/entities/pre-registered-student.entity';

@Injectable()
export class PLOAttainmentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(PreRegisteredStudent)
    private readonly preRegRepo: Repository<PreRegisteredStudent>,
  ) {}

  /**
   * Get all batches that have PLO attainment data
   */
  async getBatchesWithPLOData() {
    const batches = await this.dataSource.query<
      { batch_id: number; batch_name: string; batch_year: number; program_name: string | null; student_count: string }[]
    >(
      `SELECT DISTINCT
        b.id AS batch_id,
        b.name AS batch_name,
        b.year AS batch_year,
        p.name AS program_name,
        COUNT(DISTINCT spc.roll_no)::text AS student_count
      FROM student_program_plo_cache spc
      INNER JOIN batches b ON spc.batch_id = b.id
      LEFT JOIN programs p ON b.program_id = p.id
      GROUP BY b.id, b.name, b.year, p.name
      ORDER BY b.year DESC, b.name`,
    );

    return batches.map((batch) => ({
      batch_id: batch.batch_id,
      batch_name: batch.batch_name,
      batch_year: batch.batch_year,
      program_name: batch.program_name ?? 'N/A',
      student_count: Number(batch.student_count),
    }));
  }

  /**
   * Get all students with their PLO attainments for a batch.
   * Students are resolved from pre_registered_students (same source as PLO upload/cache).
   */
  async getBatchPLOAttainments(batchId: number) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId },
      relations: { program: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const rollNosInCache = await this.dataSource.query<{ roll_no: string }[]>(
      `SELECT DISTINCT spc.roll_no
       FROM student_program_plo_cache spc
       WHERE spc.batch_id = $1
       ORDER BY spc.roll_no`,
      [batchId],
    );
    const rollNoSet = new Set(rollNosInCache.map((r) => r.roll_no));

    if (rollNoSet.size === 0) {
      return {
        batch: {
          id: batch.id,
          name: batch.name,
          year: batch.year,
          program_name: batch.program?.name ?? 'N/A',
        },
        students: [],
      };
    }

    const preRegStudents = await this.preRegRepo.find({
      where: { batch_id: batchId },
      relations: { batch: true },
      order: { roll_no: 'ASC' },
    });
    const studentsInBatch = preRegStudents.filter((s) =>
      rollNoSet.has(s.roll_no),
    );

    const studentsData = await Promise.all(
      studentsInBatch.map(async (student) => {
        const ploRows = await this.dataSource.query<
          {
            plo_number: number;
            average_attainment: string;
            course_count: number;
            is_achieved: boolean;
            achievement_level: string | null;
            contributing_courses: Array<{ course_code: string; attainment: number }> | null;
          }[]
        >(
          `SELECT
            plo_number,
            average_attainment::text,
            course_count,
            is_achieved,
            achievement_level,
            contributing_courses
          FROM student_program_plo_cache
          WHERE roll_no = $1 AND batch_id = $2
          ORDER BY plo_number`,
          [student.roll_no, batchId],
        );

        const totalPLOs = ploRows.length;
        const achievedPLOs = ploRows.filter((plo) => Number(plo.average_attainment) >= 0.5).length;
        const achievementPercentage =
          totalPLOs > 0 ? Number(((achievedPLOs / totalPLOs) * 100).toFixed(2)) : 0;

        return {
          student_id: student.id,
          roll_no: student.roll_no,
          student_name: student.student_name,
          plo_attainments: ploRows.map((plo) => {
            const rawAvg = Number(plo.average_attainment);
            const contributing = (plo.contributing_courses ?? []).map((cc) => ({
              course_code: cc.course_code,
              attainment: Number((Number(cc.attainment) * 100).toFixed(2)),
            }));
            return {
              plo_number: plo.plo_number,
              average_attainment: Number((rawAvg * 100).toFixed(2)),
              course_count: plo.course_count,
              is_achieved: rawAvg >= 0.5,
              achievement_level: plo.achievement_level,
              contributing_courses: contributing,
            };
          }),
          overall_achievement: {
            total_plos: totalPLOs,
            achieved_plos: achievedPLOs,
            achievement_percentage: achievementPercentage,
          },
        };
      }),
    );

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        year: batch.year,
        program_name: batch.program?.name ?? 'N/A',
      },
      students: studentsData,
    };
  }

  /**
   * Get detailed PLO attainments for a single student.
   * studentId is pre_registered_students.id (same ID returned in batch detail).
   */
  async getStudentPLOAttainments(studentId: number) {
    const student = await this.preRegRepo.findOne({
      where: { id: studentId },
      relations: { batch: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const batchId = student.batch_id;
    const programId = student.batch?.program_id ?? undefined;

    let ploAttainments: {
      plo_number: number;
      average_attainment: string;
      course_count: number;
      is_achieved: boolean;
      achievement_level: string | null;
      contributing_courses: Array<{ course_code: string; attainment: number }> | null;
      last_calculated: Date;
      plo_title: string | null;
      plo_description: string | null;
    }[];

    if (batchId !== undefined) {
      const ploQuery = `SELECT
          spc.plo_number,
          spc.average_attainment::text,
          spc.course_count,
          spc.is_achieved,
          spc.achievement_level,
          spc.contributing_courses,
          spc.last_calculated,
          plo.title AS plo_title,
          plo.description AS plo_description
        FROM student_program_plo_cache spc
        LEFT JOIN plos plo ON plo.code = 'PLO-' || spc.plo_number::text
          AND (plo.program_id = $3 OR plo.program_id IS NULL)
        WHERE spc.roll_no = $1 AND spc.batch_id = $2
        ORDER BY spc.plo_number`;
      const ploParams = programId != null
        ? [student.roll_no, batchId, programId]
        : [student.roll_no, batchId];
      const query = programId != null
        ? ploQuery
        : ploQuery.replace('AND (plo.program_id = $3 OR plo.program_id IS NULL)', '');
      ploAttainments = await this.dataSource.query(query, ploParams);
    } else {
      const noBatchQuery = `SELECT
          spc.plo_number,
          spc.average_attainment::text,
          spc.course_count,
          spc.is_achieved,
          spc.achievement_level,
          spc.contributing_courses,
          spc.last_calculated,
          plo.title AS plo_title,
          plo.description AS plo_description
        FROM student_program_plo_cache spc
        LEFT JOIN plos plo ON plo.code = 'PLO-' || spc.plo_number::text
        WHERE spc.roll_no = $1
        ORDER BY spc.plo_number`;
      ploAttainments = await this.dataSource.query(noBatchQuery, [student.roll_no]);
    }

    const totalPLOs = ploAttainments.length;
    const achievedPLOs = ploAttainments.filter((plo) => Number(plo.average_attainment) >= 0.5).length;
    const notAchievedPLOs = totalPLOs - achievedPLOs;
    const rawSum = ploAttainments.reduce((sum, plo) => sum + Number(plo.average_attainment), 0);
    const overallPercentage =
      totalPLOs > 0
        ? Number(((rawSum / totalPLOs) * 100).toFixed(2))
        : 0;

    const courseCodes = new Set<string>();
    for (const plo of ploAttainments) {
      for (const c of plo.contributing_courses ?? []) {
        if (c?.course_code) courseCodes.add(c.course_code);
      }
    }
    const codeToName = new Map<string, string>();
    if (courseCodes.size > 0) {
      const courses = await this.courseRepo.find({
        where: { course_code: In(Array.from(courseCodes)) },
        select: { course_code: true, course_name: true },
      });
      for (const c of courses) codeToName.set(c.course_code, c.course_name);
    }

    return {
      student: {
        id: student.id,
        roll_no: student.roll_no,
        name: student.student_name,
        batch_name: student.batch?.name ?? 'N/A',
      },
      plo_attainments: ploAttainments.map((plo) => {
        const rawAvg = Number(plo.average_attainment);
        const contributing =
          plo.contributing_courses?.map((cc) => ({
            course_code: cc.course_code,
            course_name: codeToName.get(cc.course_code) ?? undefined,
            attainment: Number((Number(cc.attainment) * 100).toFixed(2)),
          })) ?? [];
        return {
          plo_number: plo.plo_number,
          plo_title: plo.plo_title ?? `PLO-${plo.plo_number}`,
          plo_description: plo.plo_description,
          average_attainment: Number((rawAvg * 100).toFixed(2)),
          course_count: plo.course_count,
          is_achieved: rawAvg >= 0.5,
          achievement_level: plo.achievement_level,
          contributing_courses: contributing,
          last_calculated: plo.last_calculated,
        };
      }),
      summary: {
        total_plos: totalPLOs,
        achieved_plos: achievedPLOs,
        not_achieved_plos: notAchievedPLOs,
        overall_percentage: overallPercentage,
      },
    };
  }
}
