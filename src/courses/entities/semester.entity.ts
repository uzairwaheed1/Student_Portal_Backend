import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Batch } from './batch.entity';
  
  @Entity('semesters')
  export class Semester {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    batch_id: number;
  
    @Column({ type: 'int' })
    semester_number: number; // 1 to 8
  
    @Column({ type: 'boolean', default: false })
    is_open: boolean;
  
    @Column({ type: 'date', nullable: true })
    start_date: Date;
  
    @Column({ type: 'date', nullable: true })
    end_date: Date;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;
  }