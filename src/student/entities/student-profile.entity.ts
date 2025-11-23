import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../../entities/user.entity';
  import { Batch } from '../../batch/entities/batch.entity';
  
  @Entity('student_profiles')
  export class StudentProfile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', unique: true })
    user_id: number;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    roll_no: string;
  
    @Column({ type: 'int', nullable: true })
    batch_id: number;
  
    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: string; // 'Male', 'Female', 'Other'
  
    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;
  
    @Column({ type: 'varchar', length: 20, nullable: true })
    contact_no: string;
  
    @Column({ type: 'text', nullable: true })
    address: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    father_name: string;
  
    @Column({ type: 'varchar', length: 20, nullable: true })
    father_contact: string;
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    emergency_contact: string;

    @Column({ type: 'boolean', default: false })
    email_verified: boolean;

    @Column({
      type: 'varchar',
      length: 20,
      default: 'pending'
    })
    account_status: string; // 'pending' | 'active' | 'suspended'

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;
  }
  