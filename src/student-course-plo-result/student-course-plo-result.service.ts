import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CourseStudentPloResult } from './entities/course-student-plo-results.entity';
import { StudentProfile } from '../student/entities/student-profile.entity';
import { Course } from '../courses/entities/course.entity';
import { Batch } from '../batch/entities/batch.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';
import { UploadCoursePloResultsDto, StudentCoursePloDataDto } from './dto/upload-course-plo-results.dto';
import { Semester } from '../semester/entities/semester.entity';
import { CourseOffering } from '../course-offering/entities/course-offering.entity';
import { PreRegisteredStudent } from '../student/entities/pre-registered-student.entity';
@Injectable()
export class StudentCoursePloResultService {
  constructor(
    @InjectRepository(CourseStudentPloResult)
    private courseStudentPloResultRepo: Repository<CourseStudentPloResult>,
    @InjectRepository(StudentProfile)
    private studentRepo: Repository<StudentProfile>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Batch)
    private batchRepo: Repository<Batch>,
    @InjectRepository(Semester)
    private semesterRepo: Repository<Semester>,
    @InjectRepository(ActivityLog)
    private activityLogRepo: Repository<ActivityLog>,
    @InjectRepository(CourseOffering)
    private courseOfferingRepo: Repository<CourseOffering>,
    @InjectRepository(PreRegisteredStudent)
    private preRegisteredStudentRepo: Repository<PreRegisteredStudent>,
    private dataSource: DataSource,
  ) {}

  /**
   * Upload bulk PLO results for a course offering
   * 
   * New edge-free approach:
   * - Validates course_offering_id exists
   * - Derives course_id, semester_id, batch_id from course offering
   * - Validates semester is active & unlocked
   * - Matches students using roll_no from pre_registered_students
   * - Ensures students belong to the derived batch_id
   * - Supports both registered and unregistered students
   * - Stores results against course_offering_id (one row per student + course_offering)
   * - Uses upsert behavior
   */
  async uploadBulkPloResults(uploadDto: UploadCoursePloResultsDto, facultyId: number) {
    console.time('Upload PLO Results');

    // Step 1: Validate course offering exists and load related data
    const courseOffering = await this.courseOfferingRepo.findOne({
      where: { id: uploadDto.course_offering_id },
      relations: ['course', 'semester', 'semester.batch'],
    });

    if (!courseOffering) {
      throw new NotFoundException(
        `Course offering with ID ${uploadDto.course_offering_id} not found`,
      );
    }

    // Step 2: Derive course_id, semester_id, batch_id from course offering
    const courseId = courseOffering.course_id;
    const semesterId = courseOffering.semester_id;
    const batchId = courseOffering.semester.batch_id;

    if (!courseOffering.semester || !courseOffering.semester.batch) {
      throw new BadRequestException(
        'Invalid course offering: semester or batch relation missing',
      );
    }

    // Step 3: Validate semester is unlocked (locked semesters cannot be modified)
    if (courseOffering.semester.is_locked) {
      throw new BadRequestException(
        `Cannot upload PLO results: Semester ${courseOffering.semester.number} is locked`,
      );
    }

    // Step 4: Get all pre-registered students in the batch for validation
    const preRegisteredStudents = await this.preRegisteredStudentRepo.find({
      where: { batch_id: batchId },
    });

    // Create a map for quick lookup: roll_no -> pre-registered student
    const preRegStudentMap = new Map(
      preRegisteredStudents.map((s) => [s.roll_no.toLowerCase().trim(), s]),
    );

    // Step 5: Get registered students (if any) for student_id mapping
    const registeredStudents = await this.studentRepo.find({
      where: { batch_id: batchId },
      relations: ['user'],
    });

    // Create a map for registered students: roll_no -> student profile
    const registeredStudentMap = new Map(
      registeredStudents.map((s) => [s.roll_no.toLowerCase().trim(), s]),
    );

    console.log(
      `Found ${preRegStudentMap.size} pre-registered students and ${registeredStudentMap.size} registered students in batch ${courseOffering.semester.batch.name}`,
    );

    // Step 6: Prepare bulk data with validation
    const bulkData: Partial<CourseStudentPloResult>[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const studentData of uploadDto.students) {
      const rollNo = studentData.roll_no.toLowerCase().trim();
      const preRegStudent = preRegStudentMap.get(rollNo);

      if (!preRegStudent) {
        warnings.push(
          `Student with roll no ${studentData.roll_no} not found in batch ${courseOffering.semester.batch.name}`,
        );
        continue;
      }

      // Validate student belongs to correct batch
      if (preRegStudent.batch_id !== batchId) {
        errors.push(
          `Student ${studentData.roll_no} belongs to different batch (expected batch ${batchId})`,
        );
        continue;
      }

      // Get student_id from StudentProfile (required for CourseStudentPloResult)
      // StudentProfile exists for both registered and potentially some unregistered students
      const registeredStudent = registeredStudentMap.get(rollNo);

      if (!registeredStudent) {
        // No StudentProfile exists - student must be registered first
        warnings.push(
          `Student ${studentData.roll_no} does not have a student profile. They must be registered first. Skipping.`,
        );
        continue;
      }

      const studentId = registeredStudent.id;
      const studentName = registeredStudent.user?.name || studentData.student_name;

      // Prepare record with all PLO values
      bulkData.push({
        course_offering_id: uploadDto.course_offering_id,
        course_id: courseId,
        batch_id: batchId,
        semester_id: semesterId,
        student_id: studentId,
        roll_no: preRegStudent.roll_no,
        student_name: studentName || studentData.student_name,
        plo1_value: studentData.plo1 ?? undefined,
        plo2_value: studentData.plo2 ?? undefined,
        plo3_value: studentData.plo3 ?? undefined,
        plo4_value: studentData.plo4 ?? undefined,
        plo5_value: studentData.plo5 ?? undefined,
        plo6_value: studentData.plo6 ?? undefined,
        plo7_value: studentData.plo7 ?? undefined,
        plo8_value: studentData.plo8 ?? undefined,
        plo9_value: studentData.plo9 ?? undefined,
        plo10_value: studentData.plo10 ?? undefined,
        plo11_value: studentData.plo11 ?? undefined,
        plo12_value: studentData.plo12 ?? undefined,
        uploaded_by: facultyId,
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation errors found',
        errors,
        warnings,
      });
    }

    if (bulkData.length === 0) {
      throw new BadRequestException('No valid student data to upload');
    }

    // Step 7: Execute bulk upsert with transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chunkSize = 100; // Process 100 records at a time
      let insertedCount = 0;
      let updatedCount = 0;

      for (let i = 0; i < bulkData.length; i += chunkSize) {
        const chunk = bulkData.slice(i, i + chunkSize);

        // Check which records already exist (using course_offering_id + student_id)
        const existingRecords = await queryRunner.manager.find(CourseStudentPloResult, {
          where: chunk.map((record) => ({
            course_offering_id: record.course_offering_id,
            student_id: record.student_id,
          })),
        });

        const existingSet = new Set(
          existingRecords.map(
            (r) => `${r.course_offering_id}-${r.student_id}`,
          ),
        );

        for (const record of chunk) {
          const key = `${record.course_offering_id}-${record.student_id}`;

          if (existingSet.has(key)) {
            // Update existing record
            await queryRunner.manager.update(
              CourseStudentPloResult,
              {
                course_offering_id: record.course_offering_id,
                student_id: record.student_id,
              },
              record,
            );
            updatedCount++;
          } else {
            // Insert new record
            await queryRunner.manager.insert(CourseStudentPloResult, record);
            insertedCount++;
          }
        }
      }

      // Log activity
      await queryRunner.manager.save(ActivityLog, {
        user_id: facultyId,
        action: 'UPLOAD_PLO_RESULTS',
        entity: 'CourseStudentPloResults',
        metadata: {
          course_offering_id: uploadDto.course_offering_id,
          course_id: courseId,
          course_code: courseOffering.course.course_code,
          semester_id: semesterId,
          semester_number: courseOffering.semester.number,
          batch_id: batchId,
          batch_name: courseOffering.semester.batch.name,
          students_processed: bulkData.length,
          inserted: insertedCount,
          updated: updatedCount,
        },
      });

      await queryRunner.commitTransaction();

      console.timeEnd('Upload PLO Results');

      return {
        success: true,
        message: 'PLO results uploaded successfully',
        stats: {
          total_received: uploadDto.students.length,
          successfully_processed: bulkData.length,
          inserted: insertedCount,
          updated: updatedCount,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get program-level PLOs for a student
  async getStudentProgramPLOs(studentId: number, batchId: number) {
    const result = await this.dataSource.query(
      `
      SELECT 
        student_id,
        roll_no,
        student_name,
        ROUND(AVG(plo1_value), 2) as plo1,
        COUNT(plo1_value) as plo1_courses,
        ROUND(AVG(plo2_value), 2) as plo2,
        COUNT(plo2_value) as plo2_courses,
        ROUND(AVG(plo3_value), 2) as plo3,
        COUNT(plo3_value) as plo3_courses,
        ROUND(AVG(plo4_value), 2) as plo4,
        COUNT(plo4_value) as plo4_courses,
        ROUND(AVG(plo5_value), 2) as plo5,
        COUNT(plo5_value) as plo5_courses,
        ROUND(AVG(plo6_value), 2) as plo6,
        COUNT(plo6_value) as plo6_courses,
        ROUND(AVG(plo7_value), 2) as plo7,
        COUNT(plo7_value) as plo7_courses,
        ROUND(AVG(plo8_value), 2) as plo8,
        COUNT(plo8_value) as plo8_courses,
        ROUND(AVG(plo9_value), 2) as plo9,
        COUNT(plo9_value) as plo9_courses,
        ROUND(AVG(plo10_value), 2) as plo10,
        COUNT(plo10_value) as plo10_courses,
        ROUND(AVG(plo11_value), 2) as plo11,
        COUNT(plo11_value) as plo11_courses,
        ROUND(AVG(plo12_value), 2) as plo12,
        COUNT(plo12_value) as plo12_courses
      FROM course_student_plo_results
      WHERE student_id = ? AND batch_id = ?
      GROUP BY student_id, roll_no, student_name
    `,
      [studentId, batchId],
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(`No PLO data found for student ${studentId} in batch ${batchId}`);
    }

    return result[0];
  }
}