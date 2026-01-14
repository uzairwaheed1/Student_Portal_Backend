import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { Batch } from '../../batch/entities/batch.entity';
  
  @Entity('pre_registered_students')
  export class PreRegisteredStudent {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    roll_no: string;

    @Column({ type: 'varchar', length: 255 })
    student_name: string;
  
    @Column({ type: 'int' })
    batch_id: number;
  
    @Column({ type: 'boolean', default: false })
    is_registered: boolean;
  
    @Column({ type: 'int', nullable: true })
    registered_user_id: number;
  
    @Column({ type: 'int' })
    created_by: number; // Admin who uploaded
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;
  }
  