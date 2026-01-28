import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Course } from './course.entity';
  import { Semester } from './semester.entity';
  import { Batch } from './batch.entity';
  
  @Entity('course_offerings')
  export class CourseOffering {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    course_id: number;
  
    @Column({ type: 'int' })
    faculty_id: number;
  
    @Column({ type: 'int' })
    semester_id: number;
  
    @Column({ type: 'int' })
    batch_id: number;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
    course: Course;
  
    @ManyToOne(() => Semester)
    @JoinColumn({ name: 'semester_id' })
    semester: Semester;
  
    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;
  
    // Faculty relation will be added when we create Faculty entity
  }