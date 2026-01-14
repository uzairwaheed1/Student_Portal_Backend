import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Index } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Batch } from '../../batch/entities/batch.entity';
import { StudentProfile } from '../../student/entities/student-profile.entity';
import { FacultyProfile } from '../../admin/entities/faculty-profile.entity';
import { Semester } from '../../semester/entities/semester.entity';
import { CourseOffering } from '../../course-offering/entities/course-offering.entity';
import {PreRegisteredStudent} from '../../student/entities/pre-registered-student.entity';
@Entity('course_student_plo_results')
@Unique('unique_student_course_offering', ['course_offering_id', 'student_id'])
@Index('idx_course_offering_id', ['course_offering_id'])
@Index('idx_student_id', ['student_id'])
export class CourseStudentPloResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  course_offering_id: number;

  @Column()
  course_id: number;

  @Column()
  batch_id: number;

  @Column()
  semester_id: number;

  @Column()
  student_id: number;

  @Column({ length: 50 })
  roll_no: string;

  @Column({ length: 255 })
  student_name: string;

  @Column({ type: 'float', nullable: true })
  plo1_value: number;

  @Column({ type: 'float', nullable: true })
  plo2_value: number;

  @Column({ type: 'float', nullable: true })
  plo3_value: number;

  @Column({ type: 'float', nullable: true })
  plo4_value: number;

  @Column({ type: 'float', nullable: true })
  plo5_value: number;

  @Column({ type: 'float', nullable: true })
  plo6_value: number;

  @Column({ type: 'float', nullable: true })
  plo7_value: number;

  @Column({ type: 'float', nullable: true })
  plo8_value: number;

  @Column({ type: 'float', nullable: true })
  plo9_value: number;

  @Column({ type: 'float', nullable: true })
  plo10_value: number;

  @Column({ type: 'float', nullable: true })
  plo11_value: number;

  @Column({ type: 'float', nullable: true })
  plo12_value: number;

  @CreateDateColumn()
  upload_timestamp: Date;

  @Column()
  uploaded_by: number;

  // Relations
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @ManyToOne(() => PreRegisteredStudent, { eager: false })
  @JoinColumn({ name: 'student_id' })
  preRegisteredStudent: PreRegisteredStudent;

  @ManyToOne(() => FacultyProfile)
  @JoinColumn({ name: 'uploaded_by' })
  faculty: FacultyProfile;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @ManyToOne(() => CourseOffering)
  @JoinColumn({ name: 'course_offering_id' })
  courseOffering: CourseOffering;
}