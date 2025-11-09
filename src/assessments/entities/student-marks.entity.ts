import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Assessment } from './assessment.entity';
  import { CLO } from '../../outcomes/entities/clo.entity';
  
  @Entity('student_marks')
  export class StudentMarks {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    assessment_id: number;
  
    @Column({ type: 'int' })
    student_id: number;
  
    @Column({ type: 'int' })
    clo_id: number;
  
    @Column({ type: 'decimal', precision: 5, scale: 2 })
    marks_obtained: number;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => Assessment)
    @JoinColumn({ name: 'assessment_id' })
    assessment: Assessment;
  
    @ManyToOne(() => CLO)
    @JoinColumn({ name: 'clo_id' })
    clo: CLO;
  
    // Student relation will be added later
  }