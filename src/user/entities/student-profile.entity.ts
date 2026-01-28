import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { Batch } from '../../courses/entities/batch.entity';
  
  @Entity('student_profiles')
  export class StudentProfile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', unique: true })
    user_id: number;
  
    @Column({ type: 'varchar', length: 255 })
    full_name: string;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    roll_number: string;
  
    @Column({ type: 'int' })
    batch_id: number;
  
    @Column({ type: 'int' })
    current_semester: number;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;
  }