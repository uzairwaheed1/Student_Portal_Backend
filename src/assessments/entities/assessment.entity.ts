import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { CourseOffering } from '../../courses/entities/course-offering.entity';
  
  export enum AssessmentType {
    QUIZ = 'QUIZ',
    ASSIGNMENT = 'ASSIGNMENT',
    MIDTERM = 'MIDTERM',
    FINAL = 'FINAL',
    LAB = 'LAB',
    PROJECT = 'PROJECT',
  }
  
  @Entity('assessments')
  export class Assessment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    course_offering_id: number;
  
    @Column({ type: 'enum', enum: AssessmentType })
    type: AssessmentType;
  
    @Column({ type: 'varchar', length: 255 })
    title: string;
  
    @Column({ type: 'int' })
    max_marks: number;
  
    @Column({ type: 'int' })
    weightage_percentage: number; // % contribution to final grade
  
    @Column({ type: 'boolean', default: true })
    is_theory: boolean; // true for theory, false for lab
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => CourseOffering)
    @JoinColumn({ name: 'course_offering_id' })
    courseOffering: CourseOffering;
  }