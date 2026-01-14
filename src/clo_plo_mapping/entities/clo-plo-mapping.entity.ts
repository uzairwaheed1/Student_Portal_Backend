import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Course } from '../../courses/entities/course.entity';
  import { Clo } from '../../clo/entities/clo.entity';
  import { Plo } from '../../plo/entities/plo.entity';
  
  @Entity('clo_plo_mappings')
  @Index(['course_id', 'clo_id', 'plo_id'], { unique: true })
  export class CloPloMapping {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'course_id' })
    course_id: number;
  
    @Column({ name: 'clo_id' })
    clo_id: number;
  
    @Column({ name: 'plo_id' })
    plo_id: number;
  
    @Column({ type: 'char', length: 1 })
    domain: string; // 'C', 'P', or 'A'
  
    @Column({ type: 'int' })
    level: number; // 1-7 depending on domain
  
    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
    weightage: number; // 0.0 - 1.0
  
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
  
    @ManyToOne(() => Course, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_id' })
    course: Course;
  
    @ManyToOne(() => Clo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clo_id' })
    clo: Clo;
  
    @ManyToOne(() => Plo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plo_id' })
    plo: Plo;
  }
  