import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Program } from '../../program/entities/program.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  course_code: string; // e.g., CHE-101

  @Column({ type: 'varchar', length: 255 })
  course_name: string;

  @Column({ type: 'text', nullable: true })
  course_description: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  credit_hours: number; // e.g., 3.0, 2.5

  @Column({ type: 'int' })
  program_id: number;

  @Column({ type: 'int', nullable: true })
  semester_number: number | null; // Which semester this course is typically offered (1-8)

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'Core' })
  course_type: string | null; // 'Core', 'Elective', 'Lab', 'Project', etc.

  @Column({ type: 'int' })
  created_by: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Program, (program) => program.courses, { nullable: false })
  @JoinColumn({ name: 'program_id' })
  program: Program;
}
