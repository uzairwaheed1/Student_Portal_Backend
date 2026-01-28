import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('student_program_plo_cache')
@Unique('unique_rollno_plo', ['roll_no', 'plo_number'])
@Index('idx_rollno_batch', ['roll_no', 'batch_id'])
@Index('idx_batch_plo', ['batch_id', 'plo_number'])
@Index('idx_achievement', ['is_achieved'])
@Index('idx_avg_attainment', ['average_attainment'])
export class StudentProgramPloCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  roll_no: string;

  @Column({ type: 'int' })
  batch_id: number;

  @Column({ type: 'int' })
  plo_number: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_attainment: number;

  @Column({ type: 'int', default: 0 })
  course_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_attainment: number;

  @Column({ type: 'boolean', default: false })
  is_achieved: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  achievement_level: string;

  @Column({ type: 'jsonb', nullable: true })
  contributing_courses: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_calculated: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}