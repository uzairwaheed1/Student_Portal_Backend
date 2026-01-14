import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Batch } from '../../batch/entities/batch.entity';
  import { CourseOffering } from '../../course-offering/entities/course-offering.entity';
  
  @Entity('semesters')
  export class Semester {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    batch_id: number;
  
    @Column({ type: 'int' })
    number: number; // 1-8
  
    @Column({ type: 'date' })
    start_date: Date;
  
    @Column({ type: 'date' })
    end_date: Date;
  
    @Column({ type: 'boolean', default: false })
    is_active: boolean;
  
    @Column({ type: 'boolean', default: false })
    is_locked: boolean;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => Batch, (batch) => batch.semesters)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @OneToMany(() => CourseOffering, (courseOffering) => courseOffering.semester)
    courseOfferings: CourseOffering[];
  }