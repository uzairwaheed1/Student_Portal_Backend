import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Assessment } from './assessment.entity';
  import { CLO } from '../../outcomes/entities/clo.entity';
  
  @Entity('assessment_clo_mappings')
  export class AssessmentCLOMapping {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    assessment_id: number;
  
    @Column({ type: 'int' })
    clo_id: number;
  
    @Column({ type: 'int' })
    marks_allocated: number; // How many marks of this assessment test this CLO
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @ManyToOne(() => Assessment)
    @JoinColumn({ name: 'assessment_id' })
    assessment: Assessment;
  
    @ManyToOne(() => CLO)
    @JoinColumn({ name: 'clo_id' })
    clo: CLO;
  }